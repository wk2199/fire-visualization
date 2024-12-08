import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PieChart from './PieChart';  // 引入 PieChart 组件
import BarChart from './BarChart';  // 引入 BarChart 组件

const HeatMap = ({ data }) => {
  const svgRef = useRef();
  const [selectedData, setSelectedData] = useState(null); // 用于存储选中的数据

  useEffect(() => {
    if (!data || data.length === 0) return;

    console.log("Original Data:", data);

    // 1. 数据聚合：按州和年份聚合
    const aggregatedData = d3.rollups(
      data,
      v => ({
        avgFireSize: d3.mean(v, d => +d.fire_size),
        frequency: v.length
      }),
      d => d.state,
      d => d.fire_year
    ).map(([state, yearData]) =>
      yearData.map(([year, { avgFireSize, frequency }]) => ({
        state,
        fire_year: year,
        avg_fire_size: avgFireSize,
        frequency: frequency
      }))
    ).flat();

    console.log("Aggregated Data:", aggregatedData);

    // SVG 设置
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 150, right: 450, bottom: 50, left: 150 };
    const width = 1000 - margin.left - margin.right;

    // 动态设置高度
    const states = [...new Set(aggregatedData.map(d => d.state))];
    const height = states.length * 60;

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', '#e6f7ff')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const chartArea = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const years = [...new Set(aggregatedData.map(d => d.fire_year))];

    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.1);
    console.log("xScale domain:", xScale.domain());  // 确保 2020 包含在内
    const yScale = d3.scaleBand()
      .domain(states)
      .range([0, height])
      .padding(0.1);

    const minFireSize = Math.max(d3.min(aggregatedData, d => +d.avg_fire_size), 1);
    const maxFireSize = d3.max(aggregatedData, d => +d.avg_fire_size);
    const minFrequency = d3.min(aggregatedData, d => +d.frequency);
    const maxFrequency = d3.max(aggregatedData, d => +d.frequency);

    const radiusScale = d3.scaleSqrt()
      .domain([minFireSize, maxFireSize])
      .range([15, 60]);

    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([minFrequency, maxFrequency]);

    // 添加坐标轴
    const xAxis = d3.axisTop(xScale);
    const yAxis = d3.axisLeft(yScale);

    chartArea.append('g')
      .attr('transform', `translate(0, 0)`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "translate(0, -15) rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "#000")
      .style("font-weight", "bold");

    chartArea.append('g')
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#000")
      .style("font-weight", "bold");

    chartArea.selectAll(".domain, .tick line")
      .style("stroke", "#000")
      .style("stroke-width", 1.5);

    chartArea.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", -50)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#000")
      .text("Year");

    chartArea.append("text")
      .attr("class", "y axis-label")
      .attr("x", -height / 2)
      .attr("y", -130)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#000")
      .text("State");

    // 绘制圆圈，并添加点击事件
    chartArea.selectAll('circle')
      .data(aggregatedData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.fire_year) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.state) + yScale.bandwidth() / 2)
      .attr('r', d => radiusScale(+d.avg_fire_size))
      .attr('fill', d => colorScale(+d.frequency))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .on('click', (event, d) => {
        console.log("Clicked Data:", d); 
        setSelectedData(d); // 更新选中的数据
      });

    // Add visual legend for color and size with significant spacing
    const legendArea = svg.append('g')
      .attr('transform', `translate(${width + margin.left + 60}, ${margin.top})`);

    // Color legend (Frequency)
    legendArea.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#000")
      .text("Frequency of Fires");

    const gradient = legendArea.append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.interpolateReds(0));

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.interpolateReds(1));

    legendArea.append("rect")
      .attr("x", 0)
      .attr("y", 30)
      .attr("width", 200)
      .attr("height", 25)
      .style("fill", "url(#gradient)");

    // Size legend (Fire Size)
    legendArea.append("text")
      .attr("x", 0)
      .attr("y", 120) // Much more space between color and size legend
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#000")
      .text("Average Fire Size");

    legendArea.append('circle')
      .attr('cx', 70)
      .attr('cy', 200) // Increased y position for better spacing
      .attr('r', radiusScale(maxFireSize))
      .attr('fill', '#fee8c8')
      .attr('opacity', 0.7)
      .attr('stroke', '#000');

    legendArea.append('text')
      .attr('x', 150)
      .attr('y', 205)
      .style('font-size', '16px')
      .style('fill', '#000')
      .text('Large Fire Size');

    legendArea.append('circle')
      .attr('cx', 70)
      .attr('cy', 300) // Increased y position for better spacing
      .attr('r', radiusScale(minFireSize))
      .attr('fill', '#fee8c8')
      .attr('opacity', 0.7)
      .attr('stroke', '#000');

    legendArea.append('text')
      .attr('x', 150)
      .attr('y', 305)
      .style('font-size', '16px')
      .style('fill', '#000')
      .text('Small Fire Size');

  }, [data]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <svg ref={svgRef}></svg>
      </div>
      <div style={{ width: '300px', marginLeft: '20px' }}>
        {selectedData && (
          <>
            <PieChart 
      data={data.filter(d => d.state === selectedData.state && d.fire_year === selectedData.fire_year)} 
      selectedstate={selectedData.state} 
      selectedyear={selectedData.fire_year} 
    />
            <BarChart 
      data={data.filter(d => d.state === selectedData.state && d.fire_year === selectedData.fire_year)} 
      selectedstate={selectedData.state} 
      selectedyear={selectedData.fire_year} 
    />
          </>
          
        )}
      </div>
    </div>
  );
};

export default HeatMap;
