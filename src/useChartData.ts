import * as React from 'react';
import { isEqual, startOfDay, sub } from 'date-fns';
import {
  ChartData,
  Country,
  CountryData,
  HistoricalData,
  RecentData,
  VaccinationData
} from './types';

type UseChartDataProps = {
  historicalData: HistoricalData;
  countryData: CountryData | null;
};

export const useChartData = ({
  historicalData,
  countryData
}: UseChartDataProps): { chartData: ChartData } => {
  const [chartData, setChartData] = React.useState<ChartData>([]);

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

type UseRecentDataProps = { historicalData: HistoricalData };
type UseRecentData = { recentData: RecentData };
export const useRecentData = ({ historicalData }: UseRecentDataProps): UseRecentData => {
  const [recentData, setRecentData] = React.useState<RecentData>([]);

  React.useEffect(() => {
    if (!historicalData) {
      return;
    }
    const yesterdayDt = startOfDay(sub(new Date(), { days: 1 }));
    const yesterdayIndex = historicalData.data.findIndex(({ date }) =>
      isEqual(startOfDay(date), yesterdayDt)
    );
    const dayBeforeDt = startOfDay(sub(new Date(), { days: 2 }));
    const dayBeforeIndex = historicalData.data.findIndex(({ date }) =>
      isEqual(startOfDay(date), dayBeforeDt)
    );

    const yesterday =
      yesterdayIndex > -1
        ? {
            cases:
              historicalData.data[yesterdayIndex].cases -
              historicalData.data[yesterdayIndex - 1].cases,
            deaths:
              historicalData.data[yesterdayIndex].deaths -
              historicalData.data[yesterdayIndex - 1].deaths
          }
        : null;
    const dayBefore =
      dayBeforeIndex > -1
        ? {
            cases:
              historicalData.data[dayBeforeIndex].cases -
              historicalData.data[dayBeforeIndex - 1].cases,
            deaths:
              historicalData.data[dayBeforeIndex].deaths -
              historicalData.data[dayBeforeIndex - 1].deaths
          }
        : null;
    setRecentData([yesterday, dayBefore]);
  }, [historicalData]);

  return { recentData };
};

type UseVaccinationDataProps = {
  countryData: CountryData | null;
  selectedCountry: Country;
};
type UseVaccinationData = { vaccinationData: VaccinationData };
export const useVaccinationData = ({
  countryData,
  selectedCountry
}: UseVaccinationDataProps): UseVaccinationData => {
  const [vaccinationData, setVaccinationData] = React.useState<VaccinationData>(null);

  React.useEffect(() => {
    async function fetchData() {
      if (!countryData) {
        return;
      }
      try {
        const response = await fetch(
          `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${selectedCountry}`
        );
        const json = await response.json();
        if (!json.timeline) {
          setVaccinationData(null);
          return;
        }
        const rawData = json.timeline;
        const keys = Object.keys(rawData);
        const coverage = rawData[keys[keys.length - 1]];
        const percentage = Math.round((coverage / countryData.population) * 10000) / 100;
        setVaccinationData({ coverage, percentage });
      } catch (err) {
        console.error('Vaccination data fetch failed', err);
      }
    }
    fetchData();
  }, [selectedCountry, countryData]);

  return { vaccinationData };
};
