import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useDriveData } from './drivedata.tsx';
import { Folder } from '../drive/defs.ts';
import Path from './path.tsx';


interface ZoomableIcicleProps {
    currentRootPath: string[];
    setCurrentRootPath: (path: string[]) => void;
}

interface tableData {
    color: string;
    path: string[];
    size: number;
    children: tableEntry[];
}
interface tableEntry {
    color: string;
    name: string;
    size: number;
    select?: () => void;
    deselect?: () => void;
}

interface IcicleData {
    name: string;
    value?: number;
    children?: IcicleData[];
    rect?: SVGElement,
}

const toHumanReadableStorageSize = (n: number): string => (n < 1024
    ? `${n} Bytes`
    : n < 1024 * 1024
        ? `${(n / 1024).toFixed(2)} KB`
        : n < 1024 * 1024 * 1024
            ? `${(n / (1024 * 1024)).toFixed(2)} MB`
            : `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
)

const toIcicleData = (folder: Folder): IcicleData => {
    return {
        name: folder.name,
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


const ZoomableIcicle: React.FC<ZoomableIcicleProps> = ({ currentRootPath, setCurrentRootPath }) => {
    const driveData = useDriveData();
    const svgRef = useRef<SVGSVGElement | null>(null);

    const [tableData, setTableData] = useState<tableData | undefined>(undefined);

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

        const addFilesAtThisLevel = (node: d3.HierarchyNode<IcicleData>, tableData: tableData) => {
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

        const rootTableData: tableData = addFilesAtThisLevel(root, {
            color: colorMap[JSON.stringify(getAbsPath(root))],
            path: getAbsPath(root),
            size: root.value || 0,
            children: root.children?.map((node) => ({
                color: colorMap[JSON.stringify(getAbsPath(node))],
                name: node.data.name,
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
                const selectedTableData: tableData = addFilesAtThisLevel(d, {
                    color: colorMap[JSON.stringify(getAbsPath(d))],
                    path: getAbsPath(d),
                    size: d.value || 0,
                    children: d.children?.map((node) => ({
                        color: colorMap[JSON.stringify(getAbsPath(node))],
                        name: node.data.name,
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
    }, [currentRootPath, driveData]);

    // TODO(seb): Pointer cursor on tr.
    return (
        <>
            <div className="w-full">
                <Path value={currentRootPath} setCurrentRootPath={setCurrentRootPath} />
            </div>
            <div className="flex items-start gap-4">
                <svg ref={svgRef} className="w-1/2"></svg>
                <div className="w-1/2 overflow-auto max-h-screen">
                    {tableData && (
                        <table className="w-full">
                            <tbody>
                                <tr key="0">
                                    <td className="p-0 py-4">
                                        <div
                                            className="inline-block w-6 h-6 border border-white"
                                            style={{ backgroundColor: tableData.color }}
                                        />
                                    </td>
                                    <td className="p-0 py-4 text-xl">{tableData.path[tableData.path.length - 1]}</td>
                                    <td className="p-0 py-4 text-xl">{toHumanReadableStorageSize(tableData.size)}</td>
                                </tr>
                                {tableData.children.map((entry, index) => (
                                    <tr
                                        key={index + 1}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.textDecoration = "underline";
                                            entry.select?.()
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.textDecoration = "none";
                                            entry.deselect?.()
                                        }}
                                        onClick={() => setCurrentRootPath([...tableData.path, entry.name])}
                                    >
                                        <td className="p-0">
                                            <div
                                                className="inline-block w-4 h-4 border border-white"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                        </td>
                                        <td className="p-0">{entry.name}</td>
                                        <td className="p-0">{toHumanReadableStorageSize(entry.size)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default ZoomableIcicle;
