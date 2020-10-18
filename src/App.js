import React, { useEffect, useState } from 'react';
import CaseDeathsChart from './CaseDeathsChart';
import TrendLineChart from './TrendLineChart';
import CountrySelector from './CountrySelector';
import { ResizableBox } from 'react-resizable';
import { compareAsc, differenceInDays, format, parse } from 'date-fns';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import './styles.css';
import 'react-resizable/css/styles.css';

export default function App() {
  const [initialCountries] = useLocalStorage('favoriteCountries', []);
  const [initialCountry] = useLocalStorage('favoriteCountry', 'Finland');
  const [country, setCountry] = useState(initialCountry);
  const [countries, setCountries] = useState(initialCountries);
  const days = differenceInDays(new Date(), new Date(2020, 2, 1));
  const [data, setData] = useState([]);
  const [countryData, setCountryData] = useState(null);

  const removeFavoriteCountry = (countryToRemove) => {
    const newCountries = countries.filter((c) => c !== countryToRemove);
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
    async function fetchCountryData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/countries/${country}?strict=true&allowNull=true`
      );
      if (response.status !== 200) {
        setCountryData(null);
        return;
      }
      const json = await response.json();

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
  }, [countryData]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/historical/${country}?lastdays=${days}`
      );
      if (response.status !== 200) {
        setData([]);
        return;
      }
      const json = await response.json();
      const newData = [];

      Object.keys(json.timeline.cases).forEach((key) => {
        const date = parse(key, 'M/d/yy', new Date());
        newData.push({
          date,
          cases: json.timeline.cases[key],
          deaths: json.timeline.deaths[key],
          recovered: json.timeline.recovered[key]
        });
      });

      setData(newData.sort(compareAsc));
    }
    fetchData();
  }, [country, days]);

  return (
    <div className="App" style={{ paddingRight: '20px' }}>
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
      <ResizableBox height={400}>
        <div style={{ width: '100%', height: '100%' }}>
          {data && countryData && (
            <>
              <CaseDeathsChart data={data} countryData={countryData} />
              <TrendLineChart data={data} countryData={countryData} />
            </>
          )}
        </div>
      </ResizableBox>
    </div>
  );
}
