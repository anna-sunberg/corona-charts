import { format } from 'date-fns';

export const formatUnixTime = (unixTime, formatString = 'd.M') => {
  if (!isFinite(unixTime)) {
    return null;
  }
  return format(new Date(unixTime), formatString);
};

export const labelFormatter = (unixTime) => formatUnixTime(unixTime, 'dd.MM.yy');
