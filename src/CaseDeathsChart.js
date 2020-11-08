import React, { useEffect, useState } from 'react';
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
import { format, isEqual, startOfDay, sub } from 'date-fns';
import { curveBundle } from 'd3-shape';
import {
  formatNull,
  formatUnixTime,
  labelFormatter,
  roundToHundred,
  useWindowDimensions
} from './helpers';

const CaseDeathsChart = ({ historicalData, countryData }) => {
  const [chartData, setChartData] = useState([]);
  const [displayYesterday, setDisplayYesterday] = useState('');
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!countryData || !historicalData) {
      return;
    }

    const newChartData = historicalData.data.map(({ date, deaths, cases }, i) => ({
      date: date.valueOf(),
      cases: i > 0 ? cases - historicalData.data[i - 1].cases : cases,
      deaths: i > 0 ? deaths - historicalData.data[i - 1].deaths : deaths
    }));
    setChartData(newChartData);
  }, [countryData, historicalData]);

  useEffect(() => {
    const yesterdayIndex = historicalData.data.findIndex(({ date }) =>
      isEqual(startOfDay(date), startOfDay(sub(new Date(), { days: 1 })))
    );
    if (yesterdayIndex === -1) {
      setDisplayYesterday('');
      return;
    }

    const yesterday = {
      cases:
        historicalData.data[yesterdayIndex].cases - historicalData.data[yesterdayIndex - 1].cases,
      deaths:
        historicalData.data[yesterdayIndex].deaths - historicalData.data[yesterdayIndex - 1].deaths
    };
    const twoDaysAgo = {
      cases:
        historicalData.data[yesterdayIndex - 1].cases -
        historicalData.data[yesterdayIndex - 2].cases,
      deaths:
        historicalData.data[yesterdayIndex - 1].deaths -
        historicalData.data[yesterdayIndex - 2].deaths
    };
    setDisplayYesterday(
      `, yesterday: ${formatNull(yesterday.cases)} (${formatNull(
        yesterday.deaths
      )}), 2 days ago: ${formatNull(twoDaysAgo.cases)} (${formatNull(twoDaysAgo.deaths)})`
    );
  }, [historicalData]);
  return (
    <>
      <span className="chart-title">{`Today: ${formatNull(countryData.todayCases)} (deaths: ${
        formatNull(countryData.todayDeaths) || 0
      })${displayYesterday}`}</span>
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
          <Bar type="monotone" dot={false} dataKey="deaths" fill="#FA003F" yAxisId={1} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export default CaseDeathsChart;
