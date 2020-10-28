import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatUnixTime, labelFormatter } from './helpers';

const TrendLineChart = ({ historicalData, countryData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!historicalData || !countryData) {
      return;
    }
    const newChartData = historicalData.data
      .slice(historicalData.data.length - 30)
      .map(({ date, cases }, i) => {
        const total14Days =
          cases - historicalData.data[historicalData.data.length - 30 + (i - 14)].cases;
        const runningAveragePer100K = total14Days / (countryData.population / 100000);
        const runningAverage = total14Days / 14;
        return {
          date: date.valueOf(),
          runningAverage: Math.round(runningAverage),
          runningAveragePer100K: Math.round(runningAveragePer100K * 100) / 100
        };
      });
    setChartData(newChartData);
  }, [historicalData, countryData]);

  return (
    <>
      <span className="chart-title">14 day average cases / 100 000 population</span>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis
            dataKey="date"
            type="number"
            ticks={chartData.map(({ date }) => date)}
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatUnixTime}
          />

          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip
            labelFormatter={labelFormatter}
            formatter={(value, name) => {
              const displayName =
                name === 'runningAverage' ? 'Running average' : 'Running average per 100k';
              return [value, displayName];
            }}
          />
          <Line
            type="linear"
            dot={false}
            dataKey="runningAverage"
            stroke="#EE6123"
            yAxisId={0}
            strokeWidth={2}
          />
          <Line
            type="linear"
            dot={false}
            dataKey="runningAveragePer100K"
            stroke="#E0CA3C"
            yAxisId={1}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default TrendLineChart;
// next chart color: #3E2F5B
