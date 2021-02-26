import * as React from 'react';
import { isEqual, startOfDay, sub } from 'date-fns';
import { formatNull } from './helpers';

export const useChartData = ({ historicalData, countryData }) => {
  const [chartData, setChartData] = React.useState([]);

  React.useEffect(() => {
    if (!historicalData || !countryData) {
      return;
    }
    const newChartData = historicalData.data.map(({ date, cases, deaths }, i) => {
      const index14DaysAgo = i - 14;
      const total14Days =
        cases - historicalData.data[index14DaysAgo >= 0 ? index14DaysAgo : 0].cases;
      const totalDeaths14Days =
        deaths - historicalData.data[index14DaysAgo >= 0 ? index14DaysAgo : 0].deaths;
      const runningAveragePer100K = total14Days / (countryData.population / 100000);
      const runningAverage = total14Days / 14;
      const deathsRunningAverage = totalDeaths14Days / 14;
      return {
        date: date.valueOf(),
        cases: i > 0 ? cases - historicalData.data[i - 1].cases : cases,
        deaths: i > 0 ? deaths - historicalData.data[i - 1].deaths : deaths,
        deathsRunningAverage: Math.round(deathsRunningAverage),
        runningAverage: Math.round(runningAverage),
        runningAveragePer100K: Math.round(runningAveragePer100K * 100) / 100
      };
    });
    setChartData(newChartData);
  }, [historicalData, countryData]);

  return { chartData };
};

export const useTextYesterday = ({ historicalData }) => {
  const [textYesterday, setTextYesterday] = React.useState('');

  React.useEffect(() => {
    const yesterdayIndex = historicalData.data.findIndex(({ date }) =>
      isEqual(startOfDay(date), startOfDay(sub(new Date(), { days: 1 })))
    );
    if (yesterdayIndex === -1) {
      setTextYesterday('');
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
    setTextYesterday(
      `, yesterday: ${formatNull(yesterday.cases)} (${formatNull(
        yesterday.deaths
      )}), 2 days ago: ${formatNull(twoDaysAgo.cases)} (${formatNull(twoDaysAgo.deaths)})`
    );
  }, [historicalData]);

  return { textYesterday };
};
