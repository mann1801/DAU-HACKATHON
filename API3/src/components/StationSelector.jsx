import React, { useState } from 'react';
import LocationService from '../services/LocationService';
import './StationSelector.css';

const StationSelector = ({ stations, selectedStation, onStationSelect, userLocation }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByDistance, setSortByDistance] = useState(true);

  const locationService = new LocationService();

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStations = sortByDistance && userLocation
    ? [...filteredStations].sort((a, b) => a.distance - b.distance)
    : filteredStations;

  const displayStations = showAll ? sortedStations : sortedStations.slice(0, 5);

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'Mexico': '🇲🇽'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="station-selector">
      <h3>🏭 Select Monitoring Station</h3>
      
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
        
        {userLocation && (
          <button
            className={`sort-btn ${sortByDistance ? 'active' : ''}`}
            onClick={() => setSortByDistance(!sortByDistance)}
          >
            📏 Sort by Distance
          </button>
        )}
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

      {sortedStations.length > 5 && (
        <div className="show-more-section">
          <button
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll 
              ? `📤 Show Less Stations` 
              : `📥 Show More Stations (${sortedStations.length - 5} more)`
            }
          </button>
        </div>
      )}

      <div className="station-counter">
        Showing {displayStations.length} of {sortedStations.length} stations
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
    </div>
  );
};

export default StationSelector;
