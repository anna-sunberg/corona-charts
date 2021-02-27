import * as React from 'react';
import classnames from 'classnames';
import Autosuggest from 'react-autosuggest';
import './CountrySelector.css';

const CountrySelector = ({
  selectCountry,
  removeFavoriteCountry,
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

  const getFormatted = (country) => allCountries.find((s) => s.toLowerCase() === country);

  const inputProps = {
    placeholder: 'Select a country',
    value: inputValue,
    onChange: (_, { newValue }) => setInputValue(newValue),
    className: 'input is-primary'
  };

  return (
    <div className="flex">
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
        <div className="tabs is-toggle">
          <ul>
            {favoriteCountries.map((_favoriteCountry, i) => {
              const favoriteCountry = _favoriteCountry.toLowerCase();
              return (
                <li
                  className={classnames({
                    'is-active': favoriteCountry.toLowerCase() === country
                  })}
                  onClick={() => handleSelect(favoriteCountry)}
                  key={`${favoriteCountry}-${i}`}
                >
                  <a href={`/#/${favoriteCountry}`}>
                    <span>{getFormatted(favoriteCountry)} </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <button
        className="button is-outlined is-danger button-remove-favorite"
        onClick={() => removeFavoriteCountry(country)}
      >
        <span>Remove favorite</span>
      </button>
    </div>
  );
};

export default CountrySelector;
