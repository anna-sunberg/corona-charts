import * as React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { formatUnixTime, labelFormatter, useWindowDimensions } from './helpers';

const TrendLineChart = ({ chartData }) => {
  const { width } = useWindowDimensions();
  const trendLineChartData = chartData.slice(chartData.length - 31);

  return (
    <>
      <span className="chart-title">14 day average cases / 100 000 population</span>
      <ResponsiveContainer>
        <LineChart data={trendLineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis
            dataKey="date"
            type="number"
            ticks={trendLineChartData.map(({ date }) => date)}
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatUnixTime}
          />
          <YAxis allowDecimals={false} hide={width < 800} tickCount={5} />
          <YAxis
            yAxisId={1}
            tickCount={5}
            allowDecimals={false}
            orientation="right"
            hide={width < 800}
          />
          <CartesianGrid stroke="#f5f5f5" />
          <Legend />
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
