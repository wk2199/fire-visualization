import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, selectedState, selectedYear }) => {
  const svgRef = useRef();

  useEffect(() => {
    // 确保 data 是一个有效的数组
    if (!data || !Array.isArray(data) || data.length === 0) return;

    console.log("Data received by PieChart:", data); // 查看接收到的数据

    // 筛选数据：根据 selectedState 和 selectedYear 筛选
    const filteredData = data;

    // 确保筛选后的数据不为空
    if (filteredData.length === 0) return;

    // 统计 origin 字段的出现频率
    const fireCauseCounts = filteredData.reduce((acc, d) => {
      const cause = d.origin; // 获取 origin 字段
      if (cause) {
        acc[cause] = (acc[cause] || 0) + 1; // 如果已存在该原因，增加频次；否则初始化为 1
      }
      return acc;
    }, {});

    // 计算总频率以转换为百分比
    const totalFrequency = Object.values(fireCauseCounts).reduce((sum, freq) => sum + freq, 0);

    // 将统计结果转换为数组形式
    const pieData = Object.keys(fireCauseCounts).map(cause => ({
      label: cause, // 火灾原因作为标签
      frequency: fireCauseCounts[cause], // 频率为该火灾原因出现的次数
      percentage: ((fireCauseCounts[cause] / totalFrequency) * 100).toFixed(1) // 百分比
    }));

    // 使用 D3 绘制饼图
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 清除之前的内容

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // 添加白色背景
    svg.append('rect')
      .attr('width', width + 150) // 增加宽度以适应图例
      .attr('height', height + 80) // 增加高度以适应标题和间距
      .attr('fill', 'white');

    const pie = d3.pie().value(d => d.frequency);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const g = svg
      .attr('width', width + 150) // 增加宽度以适应图例
      .attr('height', height + 80) // 增加高度以适应标题和间距
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 + 30})`); // 下移以容纳标题和间距

    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // 绘制每个扇形区域
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colorScale(i));

    // 添加标题
    svg.append('text')
      .attr('x', (width + 150) / 2)
      .attr('y', 25) // 向上移动一些，增加下方间距
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Different Causes of Fire Contribution for ${selectedState} in ${selectedYear}`);

    // 绘制图例
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 20}, ${60})`);

    pieData.forEach((d, i) => {
      legend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(i));

      legend.append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 12)
        .style('font-size', '12px')
        .style('fill', 'black')
        .text(`${d.label} (${d.percentage}%)`);
    });
  }, [data, selectedState, selectedYear]); // 依赖于 data, selectedState 和 selectedYear

  return <svg ref={svgRef}></svg>;
};

export default PieChart;

