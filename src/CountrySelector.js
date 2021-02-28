import * as React from 'react';
import classnames from 'classnames';

const CountrySelector = ({ removeFavoriteCountry, country, allCountries, favoriteCountries }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const dropdownRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const listener = (e) => {
      if (!dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        e.stopPropagation();
      }
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  const getFormatted = (country) => allCountries.find((s) => s.toLowerCase() === country);

  const onRemoveFavoriteCountry = (e, favoriteCountry) => {
    e.preventDefault();
    e.stopPropagation();
    removeFavoriteCountry(favoriteCountry);
  };

  return (
    <nav className="NavBar top-bar" role="navigation" aria-label="main navigation">
      <div className={classnames('dropdown', { 'is-active': dropdownOpen })} ref={dropdownRef}>
        <div className="dropdown-trigger">
          <button
            className="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setTimeout(() => inputRef.current.focus(), 50);
            }}
          >
            <span>{getFormatted(country)}</span>
            <span className="icon is-small">
              <i className="fa fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            <div className="field dropdown-item">
              <div className="control has-icons-left">
                <input
                  type="text"
                  placeholder="Search"
                  className="input is-transparent"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  ref={inputRef}
                />
                <span className="icon is-left">
                  <i className="fa fa-search"></i>
                </span>
              </div>
            </div>
            {favoriteCountries
              .filter((entry) => entry.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
              .map((_favoriteCountry, i) => {
                const favoriteCountry = _favoriteCountry.toLowerCase();
                return (
                  <>
                    <a
                      className={classnames('dropdown-item', {
                        'is-active': favoriteCountry.toLowerCase() === country
                      })}
                      onClick={() => setDropdownOpen(false)}
                      href={`/#/${favoriteCountry}`}
                      key={`${favoriteCountry}-${i}`}
                    >
                      <span>{getFormatted(favoriteCountry)}</span>
                      <span
                        className="icon is-small remove-favorite"
                        onClick={(e) => onRemoveFavoriteCountry(e, favoriteCountry)}
                      >
                        <i className="fa fa-times" aria-hidden="true"></i>
                      </span>
                    </a>
                  </>
                );
              })}
            <hr className="dropdown-divider" />
            {allCountries
              .map((entry) => [entry.toLowerCase(), entry])
              .filter(([entry]) => favoriteCountries.indexOf(entry) === -1)
              .filter(([entry]) => entry.indexOf(inputValue.toLowerCase()) > -1)
              .map(([entry, entryFormatted], i) => {
                return (
                  <a
                    className={classnames('dropdown-item', {
                      'is-active': entry === country
                    })}
                    onClick={() => setDropdownOpen(false)}
                    href={`/#/${entry}`}
                    key={`${entry}-${i}`}
                  >
                    {entryFormatted}
                  </a>
                );
              })}
          </div>
        </div>
      </div>
      <a href="https://corona-charts.xyz">
        <h2 className="title is-5">
          <i className="fa fa-virus" aria-hidden="true"></i> Corona charts
        </h2>
      </a>
    </nav>
  );
};

export default CountrySelector;
