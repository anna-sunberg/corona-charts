import * as React from 'react';
import { isEqual, startOfDay, sub } from 'date-fns';

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

export const useRecentData = ({ historicalData }) => {
  const [recentData, setRecentData] = React.useState(null);

  React.useEffect(() => {
    if (!historicalData) {
      return;
    }
    const yesterdayIndex = historicalData.data.findIndex(({ date }) =>
      isEqual(startOfDay(date), startOfDay(sub(new Date(), { days: 1 })))
    );
    if (yesterdayIndex === -1) {
      setRecentData(null);
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
    setRecentData([yesterday, twoDaysAgo]);
  }, [historicalData]);

  return { recentData };
};

export const useVaccinationData = ({ countryData, selectedCountry }) => {
  const [vaccinationData, setVaccinationData] = React.useState(null);
  const [rawData, setRawData] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${selectedCountry}`
        );
        const json = await response.json();
        if (!json.timeline) {
          setRawData(null);
          return;
        }
        setRawData(json.timeline);
      } catch (err) {
        console.error('Vaccination data fetch failed', err);
      }
    }
    fetchData();
  }, [selectedCountry]);

  React.useEffect(() => {
    if (!rawData || !countryData) {
      setVaccinationData(null);
      return;
    }
    const keys = Object.keys(rawData);
    const coverage = rawData[keys[keys.length - 1]];
    const percentage = Math.round((coverage / countryData.population) * 10000) / 100;
    setVaccinationData({ coverage, percentage });
  }, [rawData, countryData]);

  return { vaccinationData };
};
