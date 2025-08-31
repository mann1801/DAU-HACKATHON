import React, { useState } from 'react';
import './PollutionStationSelector.css';

const PollutionStationSelector = ({ stations, selectedStation, onStationSelect, userLocation }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const countries = [...new Set(stations.map(station => station.country))].sort();

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || station.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const sortedStations = userLocation
    ? [...filteredStations].sort((a, b) => a.distance - b.distance)
    : filteredStations;

  const displayStations = showAll ? sortedStations : sortedStations.slice(0, 8);

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦'
    };
    return flags[country] || '🌍';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setShowAll(false);
  };

  return (
    <div className="pollution-station-selector">
      <h3>🏭 Select Air Quality Station</h3>
      
      <div className="selector-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="country-select"
        >
          <option value="">🌍 All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>
              {getCountryFlag(country)} {country}
            </option>
          ))}
        </select>
      </div>

      <div className="stations-grid">
        {displayStations.map((station) => (
          <div
            key={station.id}
            className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
            onClick={() => onStationSelect(station)}
          >
            <div className="station-header">
              <span className="country-flag">{getCountryFlag(station.country)}</span>
              <div className="station-info">
                <h4 className="station-name">{station.name}</h4>
                <p className="station-location">{station.city}, {station.country}</p>
              </div>
            </div>
            
            <div className="station-details">
              <div className="coordinates">
                <span className="coord-label">📍</span>
                <span>{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</span>
              </div>
              
              {station.distance && (
                <div className="distance">
                  <span className="distance-label">📏</span>
                  <span>{station.distance.toFixed(1)} km away</span>
                </div>
              )}
            </div>
            
            <div className="station-id">ID: {station.id}</div>
          </div>
        ))}
      </div>

      {filteredStations.length === 0 && (
        <div className="no-results">
          <p>No stations found matching your criteria</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            🔄 Clear Filters
          </button>
        </div>
      )}

      {sortedStations.length > 8 && (
        <div className="show-more-section">
          <button
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll 
              ? `📤 Show Less Stations` 
              : `📥 Show More Stations (${sortedStations.length - 8} more)`
            }
          </button>
        </div>
      )}

      <div className="station-counter">
        Showing {displayStations.length} of {sortedStations.length} stations
        {searchTerm && ` matching "${searchTerm}"`}
        {selectedCountry && ` in ${selectedCountry}`}
      </div>
    </div>
  );
};

export default PollutionStationSelector;
