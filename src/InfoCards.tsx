import * as React from 'react';
import { formatNull } from './helpers';
import { format } from 'date-fns';
import { CountryData, DayData, RecentData, VaccinationData } from './types';

type Props = {
  countryData: CountryData;
  recentData: RecentData;
  vaccinationData: VaccinationData;
};

const InfoCards = ({ countryData, recentData, vaccinationData }: Props) => {
  const renderValue = (day: DayData | null, key: 'cases' | 'deaths') => {
    if (!day) {
      return formatNull(null);
    }
    return formatNull(day[key]);
  };
  const [yesterday, twoDaysAgo] = recentData;
  return (
    <div className="columns is-desktop InfoCards">
      <div className="column">
        <div className="card">
          <h6 className="title is-6">🦠 New cases (☠️ deaths)</h6>
          <div>
            Today: 🦠 {formatNull(countryData.todayCases)} (☠️ ️
            {formatNull(countryData.todayDeaths)})
          </div>
          <div>
            Yesterday: 🦠 {renderValue(yesterday, 'cases')} (☠️ {renderValue(yesterday, 'deaths')})
          </div>
          <div>
            2 days ago: 🦠 {renderValue(twoDaysAgo, 'cases')} (☠️{' '}
            {renderValue(twoDaysAgo, 'deaths')})
          </div>
        </div>
      </div>
      {vaccinationData && (
        <div className="column">
          <div className="card">
            <h6 className="title is-6">Vaccine coverage</h6>
            <div>Vaccinated: 💉 {vaccinationData.coverage}</div>
            <div>% of population: {vaccinationData.percentage} %</div>
          </div>
        </div>
      )}
      <div className="column">
        <div className="card">
          <h6 className="title is-6">Latest update</h6>
          <div>{format(new Date(countryData.updated), 'dd.MM.yyyy HH:mm')}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards;
