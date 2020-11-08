import * as React from 'react';
import classnames from 'classnames';
import Autosuggest from 'react-autosuggest';
import './CountrySelector.css';

const CountrySelector = ({
  selectCountry,
  removeCountry,
  country,
  allCountries,
  favoriteCountries
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState(allCountries);

  const handleSelect = (value) => {
    if (!value) {
      return;
    }
    selectCountry(value.toLowerCase());
    setInputValue('');
  };

  const onSuggestionSelected = (_, { suggestionValue }) => {
    handleSelect(suggestionValue);
  };

  const handleRemoveClick = (e, availableCountry) => {
    e.stopPropagation();
    removeCountry(availableCountry);
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : allCountries.filter((c) => c.toLowerCase().slice(0, inputLength) === inputValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions(allCountries);
  };

  const renderSuggestion = (suggestion) => <div>{suggestion}</div>;

  const inputProps = {
    placeholder: 'Select a country',
    value: inputValue,
    onChange: (_, { newValue }) => setInputValue(newValue)
  };

  return (
    <div className="flex">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSuggestionSelected}
        getSuggestionValue={(value) => value.toLowerCase()}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
      {favoriteCountries.map((availableCountry_, i) => {
        const availableCountry = availableCountry_.toLowerCase();
        return (
          <div
            className={classnames('country', {
              selected: availableCountry.toLowerCase() === country
            })}
            onClick={() => handleSelect(availableCountry)}
            key={`${availableCountry}-${i}`}
          >
            {availableCountry}{' '}
            <span className="remove-icon" onClick={(e) => handleRemoveClick(e, availableCountry)}>
              ×
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CountrySelector;
