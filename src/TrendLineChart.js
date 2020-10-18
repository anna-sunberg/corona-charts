import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatUnixTime, labelFormatter } from './helpers';

export default ({ data, countryData }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!data.length || !countryData) {
      return;
    }
    const newChartData = data.slice(data.length - 30).map(({ date, cases }, i) => {
      const runningAverage =
        (cases - data[data.length - 30 + (i - 14)].cases) / (countryData.population / 100000);
      return {
        date: date.valueOf(),
        runningAverage: Math.round(runningAverage * 100) / 100
      };
    });
    setChartData(newChartData);
  }, [data, countryData]);

  return (
    <>
      <span className="chart-title">14 day average cases / 100 000 population</span>
      <ResponsiveContainer>
        {chartData && (
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
              formatter={(value) => {
                return [value, 'Running average'];
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
          </LineChart>
        )}
      </ResponsiveContainer>
    </>
  );
};
