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

import { formatUnixTime, labelFormatter, nameToStartCase, useWindowDimensions } from './helpers';
import { ChartData } from './types';

const TrendLineChart = ({ chartData }: { chartData: ChartData }) => {
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
          <Legend formatter={(name) => nameToStartCase(name)} />
          <Tooltip
            labelFormatter={labelFormatter}
            formatter={(value, name) => [value, nameToStartCase(name)]}
          />
          <Line
            type="linear"
            dot={false}
            dataKey="runningAverage"
            stroke="#6A4C93"
            yAxisId={0}
            strokeWidth={2}
          />
          <Line
            type="linear"
            dot={false}
            dataKey="runningAveragePer100K"
            stroke="#8AC926"
            yAxisId={1}
            strokeWidth={2}
          />
          <Line
            type="linear"
            dot={false}
            dataKey="deathsRunningAverage"
            stroke="#FFCA3A"
            yAxisId={1}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default TrendLineChart;
