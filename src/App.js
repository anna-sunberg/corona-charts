import React, { useEffect, useState } from 'react';
import CaseDeathsChart from './CaseDeathsChart';
import TrendLineChart from './TrendLineChart';
import { ResizableBox } from 'react-resizable';
import { compareAsc, differenceInDays, format, parse } from 'date-fns';
import './styles.css';
import 'react-resizable/css/styles.css';

export default function App() {
  const country = 'finland';
  const days = differenceInDays(new Date(), new Date(2020, 2, 1));
  const [data, setData] = useState([]);
  const [countryData, setCountryData] = useState(null);

  useEffect(() => {
    async function fetchCountryData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/countries/${country}?strict=true`
      );
      const json = await response.json();
      setCountryData(json);
    }
    fetchCountryData();
  }, [country, days]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `https://disease.sh/v3/covid-19/historical/${country}?lastdays=${days}`
      );
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
      Latest data:
      {countryData && ` ${format(new Date(countryData.updated), 'dd.MM.yy HH:mm')}`}
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
