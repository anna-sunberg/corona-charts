import * as React from 'react';
import CasesDeathsChart from './CasesDeathsChart';
import TrendLineChart from './TrendLineChart';
import CountrySelector from './CountrySelector';
import InfoCards from './InfoCards';
import { ResizableBox } from 'react-resizable';
import { compareAsc, differenceInDays, getDay, parse, startOfDay } from 'date-fns';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import { useHistory, useParams } from 'react-router-dom';
import { useChartData, useRecentData, useVaccinationData } from './useChartData';
import './styles.css';
import 'react-resizable/css/styles.css';
import { Country, CountryData, HistoricalData, HistoricalDataPoint, ParamTypes } from './types';
import { nameToStartCase } from './helpers';

const DEFAULT_COUNTRY = 'finland';

export default function App() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [initialCountries] = useLocalStorage<Country[]>('favoriteCountries', []);
  const [initialCountry] = useLocalStorage<Country>('favoriteCountry', DEFAULT_COUNTRY);
  const { country: paramCountry } = useParams<ParamTypes>();
  const history = useHistory();
  const [selectedCountryName, setSelectedCountryName] = React.useState<Country>(
    paramCountry || initialCountry
  );
  // TODO: remove temporary fix for faulty values in local storage
  const [favoriteCountries, setFavoriteCountries] = React.useState<Country[]>(
    initialCountries.filter((c) => c && c !== 'undefined').map((c) => c.toLowerCase())
  );
  const days = differenceInDays(new Date(), new Date(2020, 2, 1));
  const [historicalData, setHistoricalData] = React.useState<HistoricalData>(null);
  const [countryData, setCountryData] = React.useState<CountryData | null>(null);
  const [allCountries, setAllCountries] = React.useState<CountryData[]>([]);
  const { chartData } = useChartData({ historicalData, countryData });
  const { vaccinationData } = useVaccinationData({ countryData });
  const { recentData } = useRecentData({ historicalData });

  const selectCountry = (c: Country) => {
    setLoading(true);
    setErrorMessage(null);
    history.push(`/${c}`);
    return false;
  };

  React.useEffect(() => {
    if (!paramCountry) {
      return;
    }
    setSelectedCountryName(paramCountry);
  }, [paramCountry]);

  const removeFavoriteCountry = (countryToRemove: Country) => {
    const newCountries = favoriteCountries.filter((c) => c.toLowerCase() !== countryToRemove);
    if (!newCountries.length) {
      newCountries.push(selectedCountryName);
    }
    if (!newCountries.find((c) => c.toLowerCase() === selectedCountryName)) {
      selectCountry(newCountries[0]);
    }
    setFavoriteCountries(newCountries);
  };

  React.useEffect(() => {
    if (!favoriteCountries.find((c) => c === selectedCountryName)) {
      setFavoriteCountries([...favoriteCountries, selectedCountryName]);
    }
  }, [favoriteCountries, selectedCountryName]);

  React.useEffect(() => {
    writeStorage('favoriteCountries', favoriteCountries);
  }, [favoriteCountries]);

  React.useEffect(() => {
    writeStorage('favoriteCountry', selectedCountryName);
  }, [selectedCountryName]);

  React.useEffect(() => {
    async function fetchAllCountries() {
      setLoading(true);
      try {
        const response = await fetch(`https://disease.sh/v3/covid-19/countries?allowNull=true`);
        if (!response.ok) {
          throw await response.text();
        }
        const json: CountryData[] = await response.json();
        setAllCountries(json);
      } catch (err) {
        console.error(err);
        setErrorMessage(`Failed to fetch countries`);
      }
    }
    fetchAllCountries();
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      if (!allCountries.length) {
        return;
      }
      setLoading(true);
      try {
        const selectedCountry: CountryData = allCountries.find(
          ({ country }) => country.toLowerCase() === selectedCountryName
        )!;
        const response = await fetch(
          `https://disease.sh/v3/covid-19/historical/${selectedCountry.countryInfo.iso3}?lastdays=${days}`
        );
        const json = await response.json();
        if (!response.ok) {
          throw json.message;
        }
        const newData: HistoricalDataPoint[] = [];

        if (!json.timeline) {
          setHistoricalData(null);
          return;
        }

        Object.keys(json.timeline.cases).forEach((key) => {
          const date = parse(key, 'M/d/yy', new Date());
          newData.push({
            date,
            cases: json.timeline.cases[key],
            deaths: json.timeline.deaths[key],
            recovered: json.timeline.recovered[key]
          });
        });

        setCountryData(
          allCountries.find(({ country }) => country.toLowerCase() === selectedCountryName) ||
            json[0]
        );
        setHistoricalData({
          country: json.country,
          data: newData.sort((a, b) => compareAsc(a.date, b.date))
        });
      } catch (err) {
        console.error(err);
        setHistoricalData(null);
        setErrorMessage(`Failed to fetch historical data for country "${selectedCountryName}"`);
      }
    }
    fetchData();
  }, [selectedCountryName, days, allCountries]);

  React.useEffect(() => {
    if (
      countryData &&
      historicalData &&
      countryData.country === historicalData.country &&
      countryData.todayCases !== null &&
      getDay(new Date(countryData.updated)) !==
        getDay(historicalData.data[historicalData.data.length - 1].date)
    ) {
      // historical data doesn't include today
      setHistoricalData({
        ...historicalData,
        data: [
          ...historicalData.data,
          {
            date: startOfDay(new Date(countryData.updated)),
            cases:
              countryData.todayCases + historicalData.data[historicalData.data.length - 1].cases,
            deaths:
              countryData.todayDeaths! + historicalData.data[historicalData.data.length - 1].deaths
          }
        ]
      });
    }
  }, [countryData, historicalData]);

  React.useEffect(() => {
    if (historicalData && countryData && recentData && vaccinationData) {
      setLoading(false);
    }
  }, [historicalData, countryData, recentData, vaccinationData]);

  React.useEffect(() => {
    if (errorMessage) {
      setLoading(false);
    }
  }, [errorMessage]);

  return (
    <div className="App">
      <>
        <CountrySelector
          allCountries={allCountries}
          country={selectedCountryName}
          favoriteCountries={favoriteCountries}
          removeFavoriteCountry={removeFavoriteCountry}
        />
        {!errorMessage && !loading && countryData && (
          <>
            <InfoCards
              countryData={countryData}
              vaccinationData={vaccinationData}
              recentData={recentData}
            />
            <ResizableBox height={400} width={Infinity}>
              <div style={{ width: '100%', height: '100%' }}>
                {historicalData && countryData && (
                  <>
                    <CasesDeathsChart countryData={countryData} chartData={chartData} />
                    <TrendLineChart chartData={chartData} />
                  </>
                )}
              </div>
            </ResizableBox>
          </>
        )}
        {(loading || errorMessage) && (
          <div className="app-loader">
            {!errorMessage && <button className="button is-loading">Loading</button>}
            {errorMessage && (
              <>
                <div className="mb-2">{errorMessage}</div>
                <div className="mb-2">
                  <a href="/">Refresh</a>
                </div>
                <div>
                  <a href="/#" onClick={() => selectCountry(DEFAULT_COUNTRY)} className="mb-2">
                    Go to {nameToStartCase(DEFAULT_COUNTRY)} 😢
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </>
    </div>
  );
}
