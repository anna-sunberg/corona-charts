import React, { useState } from 'react';
import classnames from 'classnames';

export default ({ selectCountry, removeCountry, country, countries }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSelect(inputValue);
    }
  };

  const handleSelect = (value) => {
    if (!value) {
      return;
    }
    selectCountry(value);
    setInputValue('');
  };

  const handleRemoveClick = (e, availableCountry) => {
    e.stopPropagation();
    removeCountry(availableCountry);
  };

  return (
    <div className="flex">
      <div>
        Search countries:{' '}
        <input
          name="country"
          value={inputValue}
          onBlur={() => handleSelect(inputValue)}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {countries.map((availableCountry, i) => (
        <div
          className={classnames('country', { selected: availableCountry === country })}
          onClick={() => handleSelect(availableCountry)}
          key={`${availableCountry}-${i}`}
        >
          {availableCountry}{' '}
          <span className="remove-icon" onClick={(e) => handleRemoveClick(e, availableCountry)}>
            ×
          </span>
        </div>
      ))}
    </div>
  );
};
