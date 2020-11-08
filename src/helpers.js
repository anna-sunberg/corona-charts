import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export const formatUnixTime = (unixTime, formatString = 'd.M') => {
  if (!isFinite(unixTime)) {
    return null;
  }
  return format(new Date(unixTime), formatString);
};

export const labelFormatter = (unixTime) => formatUnixTime(unixTime, 'dd.MM.yy');

export const formatNull = (value) => (value === null ? '-' : value);

export const roundToHundred = (value) => Math.round(value / 100) * 100;

export const roundToTen = (value) => (value > 10 ? Math.round(value) : Math.round(value / 10) * 10);

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

export const nameToStartCase = (name) => {
  const letters = name.split('');
  name.split('').forEach((l, i) => {
    if (l.toUpperCase() === l) {
      letters.splice(i, 0, ' ');
    }
  });
  return `${letters[0].toUpperCase()}${letters.splice(1).join('').toLowerCase()}`;
};
