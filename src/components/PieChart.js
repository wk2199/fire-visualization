import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, selectedState, selectedYear }) => {
  const svgRef = useRef();

  useEffect(() => {
    // 确保 data 是一个有效的数组
    if (!data || !Array.isArray(data) || data.length === 0) return;

    console.log("Data received by PieChart:", data);  // 查看接收到的数据

    // 筛选数据：根据 selectedState 和 selectedYear 筛选
    const filteredData = data

    // 确保筛选后的数据不为空
    if (filteredData.length === 0) return;
    

    // 统计 origin 字段的出现频率
    const fireCauseCounts = filteredData.reduce((acc, d) => {
      const cause = d.origin;  // 获取 origin 字段
      if (cause) {
        acc[cause] = (acc[cause] || 0) + 1;  // 如果已存在该原因，增加频次；否则初始化为 1
      }
      return acc;
    }, {});

    // 将统计结果转换为数组形式
    const pieData = Object.keys(fireCauseCounts).map(cause => ({
      label: cause,  // 火灾原因作为标签
      frequency: fireCauseCounts[cause]  // 频率为该火灾原因出现的次数
    }));

    // 使用 D3 绘制饼图
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();  // 清除之前的内容

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const pie = d3.pie().value(d => d.frequency);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // 绘制每个扇形区域
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colorScale(i));

    // 绘制文本标签
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff')
      .text(d => d.data.label);  // 显示火灾原因

  }, [data, selectedState, selectedYear]);  // 依赖于 data, selectedState 和 selectedYear

  return <svg ref={svgRef}></svg>;
};

export default PieChart;
