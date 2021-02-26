import * as React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { format } from 'date-fns';
import { useTextYesterday } from './useChartData';
import {
  formatNull,
  formatUnixTime,
  labelFormatter,
  nameToStartCase,
  roundToHundred,
  useWindowDimensions
} from './helpers';

const CaseDeathsChart = ({ historicalData, countryData, chartData }) => {
  const { width } = useWindowDimensions();
  const { textYesterday } = useTextYesterday({ historicalData });

  return (
    <>
      <span className="chart-title">{`Today: ${formatNull(countryData.todayCases)} (deaths: ${
        formatNull(countryData.todayDeaths) || 0
      })${textYesterday}`}</span>
      <span>
        Latest data:
        {countryData && ` ${format(new Date(countryData.updated), 'dd.MM.yy HH:mm')}`}
      </span>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <YAxis domain={['dataMin', roundToHundred]} hide={width < 800} />
          <YAxis
            domain={[() => 0, (dataMax) => roundToHundred(dataMax * 3)]}
            yAxisId={1}
            orientation="right"
            hide={width < 800}
          />
          <XAxis
            dataKey="date"
            type="number"
            tickCount={30}
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatUnixTime}
          />
          <Legend />
          <Tooltip
            labelFormatter={labelFormatter}
            formatter={(value, name) => {
              return [value, nameToStartCase(name)];
            }}
          />
          <CartesianGrid stroke="#f5f5f5" />
          <Line
            type="basis"
            dot={false}
            dataKey="cases"
            stroke="#1982C4"
            yAxisId={0}
            strokeWidth={2}
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
            dataKey="deathsRunningAverage"
            stroke="#FFCA3A"
            yAxisId={1}
            strokeWidth={2}
          />
          <Bar type="monotone" dot={false} dataKey="deaths" fill="#FF595E" yAxisId={1} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export default CaseDeathsChart;
