import React, { useEffect, useState } from 'react';
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

export default function App() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [initialCountries] = useLocalStorage('favoriteCountries', []);
  const [initialCountry] = useLocalStorage('favoriteCountry', 'finland');
  const { country: paramCountry } = useParams();
  const history = useHistory();
  const [selectedCountry, setSelectedCountry] = useState(paramCountry || initialCountry);
  // TODO: remove temporary fix for faulty values in local storage
  const [favoriteCountries, setFavoriteCountries] = useState(
    initialCountries.filter((c) => c && c !== 'undefined').map((c) => c.toLowerCase())
  );
  const days = differenceInDays(new Date(), new Date(2020, 2, 1));
  const [historicalData, setHistoricalData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [allCountries, setAllCountries] = useState(null);
  const [availableCountries, setAvailableCountries] = useState([]);
  const { chartData } = useChartData({ historicalData, countryData });

  const selectCountry = (c) => {
    setSelectedCountry(c);
    history.push(`/${c}`);
  };

  useEffect(() => {
    if (!paramCountry) {
      return;
    }
    setSelectedCountry(paramCountry);
  }, [paramCountry]);

  const removeFavoriteCountry = (countryToRemove) => {
    const newCountries = favoriteCountries.filter((c) => c.toLowerCase() !== countryToRemove);
    if (!newCountries.length) {
      newCountries.push(selectedCountry);
    }
    if (!newCountries.find((c) => c.toLowerCase() === selectedCountry)) {
      setSelectedCountry(newCountries[0]);
    }
    setFavoriteCountries(newCountries);
  };

  useEffect(() => {
    if (!favoriteCountries.find((c) => c === selectedCountry)) {
      setFavoriteCountries([...favoriteCountries, selectedCountry]);
    }
  }, [favoriteCountries, selectedCountry]);

  useEffect(() => {
    writeStorage('favoriteCountries', favoriteCountries);
  }, [favoriteCountries]);

  useEffect(() => {
    writeStorage('favoriteCountry', selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    if (allCountries && historicalData) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [allCountries, historicalData]);

  useEffect(() => {
    async function fetchAllCountries() {
      const response = await fetch(`https://disease.sh/v3/covid-19/countries?allowNull=true`);
      if (response.status !== 200) {
        setErrorMessage(`Failed to fetch countries`);
        return;
      }
      const json = await response.json();
      setAllCountries({ data: json });
      setAvailableCountries(json.map(({ country }) => country));
      setCountryData(
        json.find(({ country }) => country.toLowerCase() === selectedCountry) || json[0]
      );
    }
    fetchAllCountries();
  }, [selectedCountry]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/historical/${selectedCountry}?lastdays=${days}`
      );
      if (response.status !== 200) {
        setHistoricalData(null);
        setErrorMessage(`Failed to fetch historical data for country '${selectedCountry}'`);
        return;
      }
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

      setHistoricalData({ country: json.country, data: newData.sort(compareAsc) });
    }
    fetchData();
  }, [selectedCountry, days]);

  useEffect(() => {
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
      <div className="top-bar">
        <CountrySelector
          allCountries={availableCountries}
          country={selectedCountry}
          favoriteCountries={favoriteCountries}
          selectCountry={selectCountry}
          removeCountry={removeFavoriteCountry}
        />
      </div>
      {loading && <div className="loader">{errorMessage ? errorMessage : 'loading...'}</div>}
      {!loading && (
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
      )}
    </div>
  );
}
