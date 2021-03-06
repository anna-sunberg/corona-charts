import * as React from 'react';
import CaseDeathsChart from './CaseDeathsChart';
import TrendLineChart from './TrendLineChart';
import CountrySelector from './CountrySelector';
import { ResizableBox } from 'react-resizable';
import { compareAsc, differenceInDays, getDay, parse, startOfDay } from 'date-fns';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import { useHistory, useParams } from 'react-router-dom';
import { useChartData } from './useChartData';
import './styles.css';
import 'react-resizable/css/styles.css';

const DEFAULT_COUNTRY = 'finland';

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [initialCountries] = useLocalStorage('favoriteCountries', []);
  const [initialCountry] = useLocalStorage('favoriteCountry', DEFAULT_COUNTRY);
  const { country: paramCountry } = useParams();
  const history = useHistory();
  const [selectedCountry, setSelectedCountry] = React.useState(paramCountry || initialCountry);
  // TODO: remove temporary fix for faulty values in local storage
  const [favoriteCountries, setFavoriteCountries] = React.useState(
    initialCountries.filter((c) => c && c !== 'undefined').map((c) => c.toLowerCase())
  );
  const days = differenceInDays(new Date(), new Date(2020, 2, 1));
  const [historicalData, setHistoricalData] = React.useState(null);
  const [countryData, setCountryData] = React.useState(null);
  const [allCountries, setAllCountries] = React.useState(null);
  const [availableCountries, setAvailableCountries] = React.useState([]);
  const { chartData } = useChartData({ historicalData, countryData });

  const selectCountry = (c) => {
    setSelectedCountry(c);
    history.push(`/${c}`);
  };

  React.useEffect(() => {
    if (!paramCountry || paramCountry === selectedCountry) {
      return;
    }
    setSelectedCountry(paramCountry);
  }, [paramCountry, selectedCountry]);

  const removeFavoriteCountry = (countryToRemove) => {
    const newCountries = favoriteCountries.filter((c) => c.toLowerCase() !== countryToRemove);
    if (!newCountries.length) {
      newCountries.push(selectedCountry);
    }
    if (!newCountries.find((c) => c.toLowerCase() === selectedCountry)) {
      selectCountry(newCountries[0]);
    }
    setFavoriteCountries(newCountries);
  };

  React.useEffect(() => {
    if (!favoriteCountries.find((c) => c === selectedCountry)) {
      setFavoriteCountries([...favoriteCountries, selectedCountry]);
    }
  }, [favoriteCountries, selectedCountry]);

  React.useEffect(() => {
    writeStorage('favoriteCountries', favoriteCountries);
  }, [favoriteCountries]);

  React.useEffect(() => {
    writeStorage('favoriteCountry', selectedCountry);
  }, [selectedCountry]);

  React.useEffect(() => {
    if (allCountries && historicalData) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [allCountries, historicalData]);

  React.useEffect(() => {
    async function fetchAllCountries() {
      try {
        const response = await fetch(`https://disease.sh/v3/covid-19/countries?allowNull=true`);
        const json = await response.json();
        setAllCountries({ data: json });
        setAvailableCountries(json.map(({ country }) => country));
      } catch (err) {
        console.error(err);
        setErrorMessage(`Failed to fetch countries`);
      }
    }
    fetchAllCountries();
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      if (!allCountries) {
        return;
      }
      try {
        const response = await fetch(
          `https://disease.sh/v3/covid-19/historical/${selectedCountry}?lastdays=${days}`
        );
        const json = await response.json();
        const newData = [];

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
          allCountries.data.find(({ country }) => country.toLowerCase() === selectedCountry) ||
            json[0]
        );
        setHistoricalData({ country: json.country, data: newData.sort(compareAsc) });
      } catch (err) {
        console.error(err);
        setHistoricalData(null);
        setErrorMessage(`Failed to fetch historical data for country '${selectedCountry}'`);
      }
    }
    fetchData();
  }, [selectedCountry, days, allCountries]);

  React.useEffect(() => {
    if (!loading) {
      setErrorMessage(null);
    }
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
              countryData.todayDeaths + historicalData.data[historicalData.data.length - 1].deaths
          }
        ]
      });
    }
  }, [countryData, historicalData, loading]);

  return (
    <div className="App">
      {loading && (
        <div className="app-loader">
          <button className="button is-loading">Loading</button>
        </div>
      )}
      {errorMessage && (
        <>
          <div>{errorMessage}</div>
          <a href={`/#/${DEFAULT_COUNTRY}`}>Refresh</a>
        </>
      )}
      {!loading && !errorMessage && (
        <>
          <CountrySelector
            allCountries={availableCountries}
            country={selectedCountry}
            favoriteCountries={favoriteCountries}
            selectCountry={selectCountry}
            removeFavoriteCountry={removeFavoriteCountry}
          />

          <ResizableBox height={400}>
            <div style={{ width: '100%', height: '100%' }}>
              {historicalData && countryData && (
                <>
                  <CaseDeathsChart
                    historicalData={historicalData}
                    countryData={countryData}
                    chartData={chartData}
                  />
                  <TrendLineChart chartData={chartData} />
                </>
              )}
            </div>
          </ResizableBox>
        </>
      )}
    </div>
  );
}
