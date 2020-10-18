import React, { useEffect, useState } from 'react';
import CaseDeathsChart from './CaseDeathsChart';
import TrendLineChart from './TrendLineChart';
import CountrySelector from './CountrySelector';
import { ResizableBox } from 'react-resizable';
import { compareAsc, differenceInDays, format, getDay, parse, startOfDay } from 'date-fns';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import './styles.css';
import 'react-resizable/css/styles.css';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [initialCountries] = useLocalStorage('favoriteCountries', []);
  const [initialCountry] = useLocalStorage('favoriteCountry', 'Finland');
  const [country, setCountry] = useState(initialCountry);
  const [countries, setCountries] = useState(initialCountries);
  const days = differenceInDays(new Date(), new Date(2020, 2, 1));
  const [historicalData, setHistoricalData] = useState(null);
  const [countryData, setCountryData] = useState(null);

  const removeFavoriteCountry = (countryToRemove) => {
    const newCountries = countries.filter((c) => c !== countryToRemove);
    if (!newCountries.length) {
      newCountries.push(country);
    }
    if (!newCountries.find((c) => c === country)) {
      setCountry(newCountries[0]);
    }
    setCountries(newCountries);
  };

  useEffect(() => {
    writeStorage('favoriteCountries', countries);
  }, [countries]);

  useEffect(() => {
    writeStorage('favoriteCountry', country);
  }, [country]);

  useEffect(() => {
    if (countryData && historicalData) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [countryData, historicalData]);

  useEffect(() => {
    async function fetchCountryData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/countries/${country}?strict=true&allowNull=true`
      );
      if (response.status !== 200) {
        setCountryData(null);
        setErrorMessage(`Failed to fetch country '${country}'`);
        return;
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        // API returns an array of countries if no country is specified
        setCountryData(null);
        setErrorMessage(`Country '${country}' not found`);
        return;
      }
      setCountryData(json);
    }
    fetchCountryData();
  }, [country, days]);

  useEffect(() => {
    if (!countryData) {
      return;
    }
    if (!countries.find((c) => c === countryData.country)) {
      setCountries([...countries, countryData.country]);
    }
  }, [countries, countryData]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/historical/${country}?lastdays=${days}`
      );
      if (response.status !== 200) {
        setHistoricalData(null);
        setErrorMessage(`Failed to fetch historical data for country '${country}'`);
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
  }, [country, days]);

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
            date: startOfDay(new Date(countryData.updated)).valueOf(),
            cases: countryData.cases,
            deaths: countryData.deaths
          }
        ]
      });
    }
  }, [countryData, historicalData, loading]);

  return (
    <div className="App" style={{ paddingRight: '10px' }}>
      <div className="top-bar">
        Latest data:
        {countryData && ` ${format(new Date(countryData.updated), 'dd.MM.yy HH:mm')}`}
        <CountrySelector
          country={(countryData && countryData.country) || country}
          countries={countries}
          selectCountry={setCountry}
          removeCountry={removeFavoriteCountry}
        />
      </div>
      {loading && <div className="loader">{errorMessage ? errorMessage : 'loading...'}</div>}
      {!loading && (
        <ResizableBox height={400}>
          <div style={{ width: '100%', height: '100%' }}>
            {historicalData && countryData && (
              <>
                <CaseDeathsChart historicalData={historicalData} countryData={countryData} />
                <TrendLineChart historicalData={historicalData} countryData={countryData} />
              </>
            )}
          </div>
        </ResizableBox>
      )}
    </div>
  );
}
