import React, { useEffect, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  Line,
  ComposedChart,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { curveBundle } from 'd3-shape';
import { formatUnixTime, labelFormatter } from './helpers';

export default ({ data }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const newChartData = data.map(({ date, deaths, cases }, i) => ({
      date: date.valueOf(),
      cases: i > 0 ? cases - data[i - 1].cases : cases,
      deaths: i > 0 ? deaths - data[i - 1].deaths : deaths
    }));
    setChartData(newChartData);
  }, [data]);

  return (
    <>
      <span>Cases and deaths 2020</span>
      <ResponsiveContainer>
        {chartData && (
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <YAxis domain={['dataMin', 'dataMax + 10']} />
            <XAxis
              dataKey="date"
              type="number"
              tickCount={30}
              domain={['auto', 'auto']}
              tickFormatter={formatUnixTime}
            />
            <Tooltip
              labelFormatter={labelFormatter}
              formatter={(value, name) => {
                return [value, `${name[0].toUpperCase()}${name.split('').splice(1).join('')}`];
              }}
            />
            <CartesianGrid stroke="#f5f5f5" />
            <Line
              type={curveBundle}
              dot={false}
              dataKey="cases"
              stroke="#00916E"
              yAxisId={0}
              strokeWidth={2}
            />
            <Bar type="monotone" dot={false} dataKey="deaths" stroke="#FA003F" yAxisId={0} />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </>
  );
};
