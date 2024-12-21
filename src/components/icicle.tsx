import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useDriveData } from './drivedata.tsx';
import { Folder } from '../drive/defs.ts';

interface IcicleData {
    name: string;
    value?: number;
    children?: IcicleData[];
}

const toIcicleData = (folder: Folder): IcicleData => {
    return {
        name: folder.name,
        value: folder.size,
        children: folder.subfolders?.map(toIcicleData),
    };
}

const ZoomableIcicle: React.FC = () => {
    let data = toIcicleData(useDriveData());
    const svgRef = useRef<SVGSVGElement | null>(null);

    const [currentRootPath, setCurrentRootPath] = useState(["root"]);

    const getPath = (node: d3.HierarchyNode<IcicleData>): string[] => {
        const path: string[] = [];
        while (node) {
            path.unshift(node.data.name);
            node = node.parent!;
        }
        return path;
    }

    const getAbsPath = (node: d3.HierarchyNode<IcicleData>): string[] => {
        return currentRootPath.concat(getPath(node).slice(1));
    }

    useEffect(() => {
        if (!data) return;

        currentRootPath.slice(1).forEach((name) => {
            const newData = data.children?.find((c) => c.name == name)
            if (newData) {
                data = newData
            } else {
                throw new Error(`"${name}" not found in data`);
            }
        });


        const width = 800;
        const height = 400;

        const root = d3
            .hierarchy<IcicleData>(data)
            .sum((d) => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const partition = d3.partition<IcicleData>().size([width, height]);
        const rootRectangular = partition(root);

        const rootNodeColor = '#f0f0f0';

        const color = d3.scaleOrdinal(
            d3.quantize(d3.interpolateRainbow, (root.children?.length || 0) + 1)
        );

        const colorMap: Record<string, string> = {};
        colorMap[root.data.name || ''] = rootNodeColor;

        root.children?.forEach((child) => {
            const colorForChild = color(child.data.name || '');
            colorMap[child.data.name || ''] = colorForChild;
            child.descendants().forEach((descendant) => {
                colorMap[descendant.data.name || ''] = colorForChild;
            });
        });

        const svg = d3
            .select(svgRef.current)
            .attr('viewBox', [0, 0, width, height])
            .style('font', '10px sans-serif');

        svg.selectAll('*').remove();

        svg
            .selectAll<SVGRectElement, d3.HierarchyRectangularNode<IcicleData>>('rect')
            .data(rootRectangular.descendants())
            .join('rect')
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('width', (d) => d.x1 - d.x0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('fill', (d) => colorMap[d.data.name || ''])
            .style('stroke', '#fff')
            .style('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('click', (_event, d) => {
                // Go up one level if clicking on the top node.  Otherwise zoom in to
                // clicked-on node.
                if (rootRectangular === d) {
                    if (currentRootPath.length > 1) {
                        setCurrentRootPath(currentRootPath.slice(0, -1)); // up one
                    } // Otherwise already at root, do nothing.
                } else {
                    setCurrentRootPath(getAbsPath(d));
                }
            });
    }, [data]);

    return <svg ref={svgRef}> </svg>;
};

export default ZoomableIcicle;
