import React, { useRef, useEffect } from 'react';
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
    const data = toIcicleData(useDriveData());
    console.log(`SEB: data: ${JSON.stringify(data)}`);
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!data) return;

        const width = 800;
        const height = 400;

        const root = d3
            .hierarchy<IcicleData>(data)
            .sum((d) => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const partition = d3.partition<IcicleData>().size([width, height]);
        const rootRectangular = partition(root);

        let currentRoot = rootRectangular;

        const rootNodeColor = '#f0f0f0';
        const rootTextColor = '#000';

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

        const rect = svg
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
                if (currentRoot === d) {
                    zoom(rootRectangular);
                } else {
                    zoom(d);
                }
                currentRoot = d;
            });

        const text = svg
            .selectAll<SVGTextElement, d3.HierarchyRectangularNode<IcicleData>>('text')
            .data(rootRectangular.descendants())
            .join('text')
            .attr('x', (d) => d.x0 + 4)
            .attr('y', (d) => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .text((d) => d.data.name)
            .style('fill', (d) => (d === rootRectangular ? rootTextColor : '#000'))
            .style('display', (d) => (d.x1 - d.x0 > 40 ? null : 'none'));

        const valueText = svg
            .selectAll<SVGTextElement, d3.HierarchyRectangularNode<IcicleData>>('.value')
            .data(rootRectangular.descendants())
            .join('text')
            .attr('class', 'value')
            .attr('x', (d) => d.x0 + 4)
            .attr('y', (d) => (d.y1 + d.y0) / 2 + 12)
            .attr('dy', '0.35em')
            .text((d) => (d.value ? `(${d.value})` : ''))
            .style('display', (d) => (d.x1 - d.x0 > 40 ? null : 'none'));

        const zoom = (d: d3.HierarchyRectangularNode<IcicleData>) => {
            const xScale = d3.scaleLinear().domain([d.x0, d.x1]).range([0, width]);
            const yScale = d3.scaleLinear().domain([d.y0, height]).range([0, height]);

            rect.transition()
                .duration(750)
                .attr('x', (d) => xScale(d.x0))
                .attr('y', (d) => yScale(d.y0))
                .attr('width', (d) => xScale(d.x1) - xScale(d.x0))
                .attr('height', (d) => yScale(d.y1) - yScale(d.y0));

            text.transition()
                .duration(750)
                .attr('x', (d) => xScale(d.x0) + 4)
                .attr('y', (d) => (yScale(d.y1) + yScale(d.y0)) / 2)
                .style('display', (d) =>
                    xScale(d.x1) - xScale(d.x0) > 40 ? null : 'none'
                );

            valueText.transition()
                .duration(750)
                .attr('x', (d) => xScale(d.x0) + 4)
                .attr('y', (d) => (yScale(d.y1) + yScale(d.y0)) / 2 + 12)
                .style('display', (d) =>
                    xScale(d.x1) - xScale(d.x0) > 40 ? null : 'none'
                );
        };
    }, [data]);

    return <svg ref={svgRef}> </svg>;
};

export default ZoomableIcicle;
