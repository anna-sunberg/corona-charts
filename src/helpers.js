import { format } from 'date-fns';

export const formatUnixTime = (unixTime, formatString = 'd.M') => {
  if (!isFinite(unixTime)) {
    return null;
  }
  return format(new Date(unixTime), formatString);
};

export const labelFormatter = (unixTime) => formatUnixTime(unixTime, 'dd.MM.yy');

export const formatNull = (value) => (value === null ? '-' : value);

export const roundToHundred = (value) => Math.round(value / 100) * 100;
