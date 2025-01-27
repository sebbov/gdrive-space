import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useDriveData } from './drivedata.tsx';
import { Folder } from '../drive.ts';
import { TableData } from './table.tsx';
import { toHumanReadableStorageSize } from '../util.ts';

interface IcicleProps {
    currentRootPath: string[];
    setCurrentRootPath: (path: string[]) => void;
    setTableData: (data: TableData | undefined) => void;
}

interface IcicleData {
    name: string;
    fileId: string;
    value?: number;
    children?: IcicleData[];
    rect?: SVGElement,
}

const toIcicleData = (folder: Folder): IcicleData => {
    return {
        name: folder.name,
        fileId: folder.fileId,
        value: folder.size,
        children: folder.subfolders?.map(toIcicleData),
    };
}

const getPath = (node: d3.HierarchyNode<IcicleData>): string[] => {
    const path: string[] = [];
    while (node) {
        path.unshift(node.data.name);
        node = node.parent!;
    }
    return path;
}

const getColorMap = (root: d3.HierarchyNode<IcicleData>): Record<string, string> => {
    const width = 1000;
    const partition = d3.partition<IcicleData>().size([width, 10 /* don't-care */]);
    const rootRectangular = partition(root);

    const colorMap: Record<string, string> = {};
    rootRectangular.each((n) => {
        const relCenterX = (n.x0 + n.x1) / 2 / width;
        colorMap[JSON.stringify(getPath(n))] = d3.interpolateTurbo(relCenterX);
    });

    return colorMap;
}


const Icicle: React.FC<IcicleProps> = ({ currentRootPath, setCurrentRootPath, setTableData }) => {
    const driveData = useDriveData();
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!driveData) return;

        const data = toIcicleData(driveData);
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

        const colorMap = getColorMap(root);

        currentRootPath.slice(1).forEach((name) => {
            const next = root.children?.find((n) => n.data.name == name)
            if (next) {
                root = next.copy();
            } else {
                throw new Error(`"${name}" not found in data`);
            }
        });

        const origDepth = d3.max(root.descendants(), (node) => node.depth + 1) || 1;
        const maxDepth = 5;
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


        const getAbsPath = (node: d3.HierarchyNode<IcicleData>): string[] => {
            return currentRootPath.concat(getPath(node).slice(1));
        }

        const addFilesAtThisLevel = (node: d3.HierarchyNode<IcicleData>, tableData: TableData) => {
            const filesSizeChild = {
                color: "#aaa",
                name: "[Files at this level]",
                size: (node.value || 0) - (node.children?.reduce((sum, child) => sum + (child.value || 0), 0) || 0),
            }
            const insertIndex = tableData.children.findIndex(child => child.size < filesSizeChild.size);
            if (insertIndex === -1) {
                tableData.children.push(filesSizeChild);
            } else {
                tableData.children.splice(insertIndex, 0, filesSizeChild);
            }
            return tableData;
        }

        const rootTableData: TableData = addFilesAtThisLevel(root, {
            color: colorMap[JSON.stringify(getAbsPath(root))],
            path: getAbsPath(root),
            fileId: root.data.fileId,
            size: root.value || 0,
            children: root.children?.map((node) => ({
                color: colorMap[JSON.stringify(getAbsPath(node))],
                name: node.data.name,
                fileId: node.data.fileId,
                size: node.value || 0,
                select: () => {
                    if (node.data.rect) d3.select(node.data.rect)
                        .style('stroke', '#333')
                        .style('stroke-width', 2);
                },
                deselect: () => {
                    if (node.data.rect) d3.select(node.data.rect)
                        .style('stroke-width', 0);
                },
            })) || []
        });
        setTableData(rootTableData);

        svg.selectAll('*').remove();

        const minWidthFraction = 0.001;
        svg
            .selectAll<SVGRectElement, d3.HierarchyRectangularNode<IcicleData>>('rect')
            .data(rootRectangular.descendants().filter((d) => (d.x1 - d.x0) > minWidthFraction * width))
            .join('rect')
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('width', (d) => d.x1 - d.x0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('fill', (d) => colorMap[JSON.stringify(getAbsPath(d))])
            .style('cursor', 'pointer')
            .each(function(d) {
                d.data.rect = this;
            })
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
                const selectedTableData: TableData = addFilesAtThisLevel(d, {
                    color: colorMap[JSON.stringify(getAbsPath(d))],
                    path: getAbsPath(d),
                    fileId: d.data.fileId,
                    size: d.value || 0,
                    children: d.children?.map((node) => ({
                        color: colorMap[JSON.stringify(getAbsPath(node))],
                        name: node.data.name,
                        fileId: node.data.fileId,
                        size: node.value || 0,
                    })) || [],
                });
                setTableData(selectedTableData);
                d3.select(this)
                    .style('stroke', '#333')
                    .style('stroke-width', 2);
            })
            .on('mouseout', function(_event, _d) {
                setTableData(rootTableData);
                d3.select(this)
                    .style('stroke-width', 0);
            });

        svg
            .selectAll<SVGTextElement, d3.HierarchyRectangularNode<IcicleData>>('text')
            .data([rootRectangular])
            .join('text')
            .attr('x', (d) => (d.x0 + d.x1) / 2)
            .attr('y', (d) => (d.y0 + d.y1) / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text((d) => toHumanReadableStorageSize(d.value || 0))
            .style('font-family', 'Courier New, monospace')
            .style('font-size', (d) => Math.max(12, Math.min(32, (d.x1 - d.x0) / 4)) + 'px')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .style('fill', 'black');
    }, [currentRootPath, driveData]);

    return <svg ref={svgRef} className="w-1/2 p-2"></svg>;
};

export default Icicle;
