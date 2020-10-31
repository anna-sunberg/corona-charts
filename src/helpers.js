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
