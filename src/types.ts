export type ParamTypes = {
  country: string;
};

export type RecentData = (DayData | null)[];

export type DayData = {
  cases: number | null;
  deaths: number | null;
};

export type CountryData = {
  updated: number;
  country: string;
  countryInfo: {
    iso3: string;
  };
  cases: number | null;
  todayCases: number | null;
  deaths: number | null;
  todayDeaths: number | null;
  recovered: number | null;
  todayRecovered: number | null;
  active: number | null;
  critical: number | null;
  population: number;
  tests: number;
};
export type VaccinationData = {
  coverage: number;
  percentage: number;
} | null;

export type HistoricalData = {
  country: Country;
  data: HistoricalDataPoint[];
} | null;

export type DataPoint = {
  date: number;
  cases: number;
  deaths: number;
  deathsRunningAverage: number;
  runningAverage: number;
  runningAveragePer100K: number;
  recovered?: number;
};

export type HistoricalDataPoint = {
  date: Date;
  cases: number;
  deaths: number;
  recovered?: number;
};

export type ChartData = DataPoint[];

export type Country = string;

export type AllCountriesData = {
  data: CountryData[];
} | null;
