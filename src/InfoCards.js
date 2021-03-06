import * as React from 'react';
import { formatNull } from './helpers';
import { format } from 'date-fns';

const InfoCards = ({ countryData, recentData, vaccinationData }) => {
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
            Yesterday: 🦠 {yesterday.cases} (☠️ {yesterday.deaths})
          </div>
          <div>
            2 days ago: 🦠 {twoDaysAgo.cases} (☠️ {twoDaysAgo.deaths})
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
