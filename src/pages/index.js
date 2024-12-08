import React, { useState, useEffect } from 'react';
import HeatMap from '../components/HeatMap';
import StateDropdown from '../components/StateDropdown';
import * as d3 from 'd3';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';

// Define state regions (reuse in Home.js for filtering)
const stateRegions = {
  Eastern: ['CT', 'DE', 'FL', 'GA', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'NC', 'PA', 'RI', 'SC', 'VT', 'VA', 'WV'],
  Central: ['AL', 'AR', 'IL', 'IN', 'IA', 'KY', 'LA', 'MI', 'MN', 'MS', 'MO', 'OH', 'OK', 'TN', 'TX', 'WI'],
  Western: ['AK', 'AZ', 'CA', 'CO', 'HI', 'ID', 'KS', 'MT', 'NE', 'NV', 'NM', 'ND', 'OR', 'SD', 'UT', 'WA', 'WY'],
};

const Home = () => {
  const [fireData, setFireData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedState, setSelectedState] = useState(null);  // 管理选中的州
  const [selectedYear, setSelectedYear] = useState(null);  // 管理选中的年份

  useEffect(() => {
    // 使用原生 fetch 加载 CSV 数据
    fetch('/df_final.csv')
      .then(response => response.text())  // 解析为文本
      .then(csvData => {
        const rows = csvData.split("\n");  // 按行拆分数据
        const headers = rows[0].split(",");  // 提取表头
        const data = rows.slice(1).map(row => {
          const values = row.split(",");
          let rowData = {};
          values.forEach((value, index) => {
            rowData[headers[index]] = value.trim();  // 构建每一行的数据对象
          });
          return rowData;
        });
        console.log("Loaded data:", data);  // 打印加载的数据
        setFireData(data);
      })
      .catch(error => {
        console.error("Error loading CSV:", error);
      });
  }, []);

  // 根据 selectedRegion 更新 filteredData
  useEffect(() => {
    if (selectedRegion) {
      const statesInRegion = stateRegions[selectedRegion];
      setFilteredData(fireData.filter((d) => statesInRegion.includes(d.state)));
    } else {
      setFilteredData(fireData);
    }
  }, [selectedRegion, fireData]);

  // 计算选中区域/州的统计数据
  const calculateStatistics = (data) => {
    if (data.length === 0) return { avgFireSize: 0, totalFrequency: 0 };

    const avgFireSize = d3.mean(data, (d) => +d.fire_size);
    const totalFrequency = data.length;

    return { avgFireSize, totalFrequency };
  };

  const stats = calculateStatistics(filteredData);

  // 在这里我们需要为BarChart准备数据，按州和年份筛选并聚合每月的火灾数量
  const getMonthlyFireData = (state, year) => {
    // 过滤并聚合数据
    const filtered = filteredData.filter(d => d.state === state && d.fire_year == year);
    
    // 聚合每个月的火灾数量
    const monthlyData = filtered.reduce((acc, d) => {
      const month = d.disc_month;  // 使用disc_month字段
      if (!acc[month]) acc[month] = 0;
      acc[month]++;
      return acc;
    }, {});

    // 将数据转化为数组并按月份排序
    const monthlyArray = Object.keys(monthlyData)
      .map(month => ({ month: parseInt(month), count: monthlyData[month] }))
      .sort((a, b) => a.month - b.month);

    // 补充缺失的月份数据
    for (let i = 1; i <= 12; i++) {
      if (!monthlyArray.some(d => d.month === i)) {
        monthlyArray.push({ month: i, count: 0 });
      }
    }

    // 按月份排序
    return monthlyArray.sort((a, b) => a.month - b.month);
  };

  const monthlyFireData = selectedState && selectedYear ? getMonthlyFireData(selectedState, selectedYear) : [];

  return (
    <div
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/266487/pexels-photo-266487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`, // Fire background image URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px',
        minHeight: '100vh', // Ensure it covers the full viewport height
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXqVU_CwMOGfCNDdNFszJuOHIgAYKDUWa6Ow&s" // Torch icon URL
            alt="Torch Icon"
            style={{
              width: '50px',
              height: '50px',
              marginRight: '10px',
            }}
          />
          <h1
            style={{
              color: '#b85c00', // Darker title color
              fontWeight: 'bold',
              fontFamily: "'Pacifico', cursive", // Apply the fancy "Pacifico" font
            }}
          >
            Wildfire Data Visualization in the United States
          </h1>
        </div>
        <div style={{ color: '#b85c00', fontWeight: 'bold', fontSize: '18px' }}>
          Xiangdong Zhang, Wenkai Kang
        </div>
      </div>

      <StateDropdown onSelectRegion={setSelectedRegion} />

      {/* Display statistical data for the selected region/state */}
      <div
        style={{
          backgroundColor: '#ffffffbb',
          padding: '15px',
          borderRadius: '10px',
          width: 'fit-content',
          margin: '20px 0',
        }}
      >
        <h2>Statistics for Selected Region</h2>
        <p><strong>Average Fire Size:</strong> {stats.avgFireSize.toFixed(2)} acres</p>
        <p><strong>Total Frequency of Fires:</strong> {stats.totalFrequency}</p>
      </div>

      {/* HeatMap, PieChart, and BarChart - Updated Layout */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '20px' }}>
        {/* HeatMap */}
        <div style={{ width: '30%' }}>
          <HeatMap 
            data={filteredData} 
            setSelectedState={setSelectedState} // 传递设置选中州的函数
            setSelectedYear={setSelectedYear} // 传递设置选中年份的函数
          />
        </div>

        {/* PieChart */}
        <div style={{ width: '30%', marginLeft: '20px'}}>
          {selectedState && selectedYear && (
            <PieChart data={filteredData} selectedState={selectedState} selectedYear={selectedYear} />
          )}
        </div>

        {/* BarChart */}
        <div style={{ width: '30%' ,marginLeft: '20px'}}>
          {selectedState && selectedYear && (
            <BarChart data={filteredData} selectedState={selectedState} selectedYear={selectedYear} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
