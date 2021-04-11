import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import startCase from 'lodash.startcase';

export const formatUnixTime = (unixTime: number, formatString = 'd.M') => {
  if (!isFinite(unixTime)) {
    return null;
  }
  return format(new Date(unixTime), formatString);
};

export const labelFormatter = (unixTime: string | number) =>
  formatUnixTime(Number(unixTime), 'dd.MM.yy');

export const formatNull = (value: number | null): string => (value === null ? '-' : `${value}`);

export const roundToHundred = (value: number): number => Math.round(value / 100) * 100;

export const roundToTen = (value: number): number =>
  value > 10 ? Math.round(value) : Math.round(value / 10) * 10;

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

export const nameToStartCase = (name: string) => {
  const words = startCase(name);
  return `${words[0]}${words.substring(1).toLowerCase()}`;
};
