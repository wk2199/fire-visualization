import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, selectedState, selectedYear }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    // 1. 过滤出对应州和年份的数据
    const filteredData = data
    if (filteredData.length === 0) return;

    console.log("Filtered data:", filteredData); // 查看过滤后的数据

    // 2. 聚合每个月的火灾数量
    const monthlyData = filteredData.reduce((acc, d) => {
      const month = Math.ceil(d.disc_doy / 31);  // 使用 disc_day 除以 31 向上取整来计算月份
      if (month < 1 || month > 12) return acc;  // 排除无效月份

      if (!acc[month]) {
        acc[month] = 0; // 如果该月没有记录，则初始化为 0
      }
      acc[month] += 1;  // 每次遇到该月的记录，计数加 1
      return acc;
    }, {});

    console.log("Monthly data:", monthlyData); // 输出聚合后的数据

    // 3. 将聚合后的数据转换为数组，并补充缺失的月份
    const completeMonthlyData = [];
    for (let month = 1; month <= 12; month++) {
      completeMonthlyData.push({
        month,
        count: monthlyData[month] || 0  // 如果该月没有火灾记录，则设置为 0
      });
    }

    // 4. 设置SVG画布尺寸和比例尺
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();  // 清除旧的图表

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };  // 增加左边的 margin

    const xScale = d3.scaleBand()
      .domain(completeMonthlyData.map(d => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(completeMonthlyData, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // 5. 添加白色背景矩形
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white');

    // 6. 绘制柱状图
    svg.selectAll('.bar')
      .data(completeMonthlyData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.month))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.count))
      .attr('fill', 'blue');  // 修改为蓝色

    // 7. 添加X轴
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => {
        // 格式化月份显示为"Jan", "Feb", ...
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[d - 1];
      }))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("fill", "black");

    // 8. 添加Y轴
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

  }, [data, selectedState, selectedYear]);

  return <svg ref={svgRef} width="500" height="300"></svg>;
};

export default BarChart;
