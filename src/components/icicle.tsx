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

        const width = 800;
        let height = 400;
        const svg = d3
            .select(svgRef.current)
            .attr('viewBox', [0, 0, width, height])
            .style('font', '10px sans-serif');

        let root = d3
            .hierarchy<IcicleData>(data)
            .sum((d) => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

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

        currentRootPath.slice(1).forEach((name) => {
            const next = root.children?.find((n) => n.data.name == name)
            if (next) {
                root = next.copy();
            } else {
                throw new Error(`"${name}" not found in data`);
            }
        });
        const origDepth = d3.max(root.descendants(), (node) => node.depth + 1) || 1;

        const maxDepth = 4;
        root.each((node) => {
            if (node.depth >= maxDepth) {
                node.children = undefined;
            }
        });
        const prunedDepth = d3.max(root.descendants(), (node) => node.depth + 1) || 1;
        const prunedFactor = origDepth / prunedDepth;
        height *= prunedFactor;

        const partition = d3.partition<IcicleData>().size([width, height]).padding(1);
        const rootRectangular = partition(root);

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
            })
            .on('mouseover', function(_event, d) {
                d3.select(this)
                    .style('stroke', '#333')
                    .style('stroke-width', 2);
            })
            .on('mouseout', function(_event, d) {
                d3.select(this)
                    .style('stroke-width', 0);
            });
    }, [data]);

    return <svg ref={svgRef}> </svg>;
};

export default ZoomableIcicle;
