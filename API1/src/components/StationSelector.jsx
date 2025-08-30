import React, { useState, useMemo } from 'react';
import { stations } from '../utils/geolocation';
import './StationSelector.css';

const StationSelector = ({ selectedStation, onStationChange }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Filter stations based on search and region
  const filteredStations = useMemo(() => {
    let filtered = stations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(station => {
        if (selectedRegion === 'us') return !station.id.startsWith('IN');
        if (selectedRegion === 'india') return station.id.startsWith('IN');
        return true;
      });
    }

    return filtered;
  }, [searchTerm, selectedRegion]);

  // Show limited stations initially
  const displayedStations = showAll ? filteredStations : filteredStations.slice(0, 12);
  const hasMoreStations = filteredStations.length > 12;

  const regions = [
    { value: 'all', label: '🌍 All Regions' },
    { value: 'us', label: '🇺🇸 United States' },
    { value: 'india', label: '🇮🇳 India' }
  ];

  return (
    <div className="card station-selector">
      <h3>🏖️ Select Monitoring Station</h3>
      
      {/* Search and Filter Controls */}
      <div className="station-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="station-search"
          />
        </div>
        
        <div className="region-filter">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="region-select"
          >
            {regions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Station Count Info */}
      <div className="station-info">
        Showing {displayedStations.length} of {filteredStations.length} stations
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </div>

      {/* Station Grid */}
      <div className="station-grid">
        {displayedStations.map(station => (
          <button
            key={station.id}
            className={`station-button ${selectedStation === station.id ? 'active' : ''}`}
            onClick={() => onStationChange(station.id)}
          >
            <div className="station-name">{station.name}</div>
            <div className="station-location">{station.location}</div>
            <div className="station-id">ID: {station.id}</div>
          </button>
        ))}
      </div>

      {/* See More/Less Button */}
      {hasMoreStations && !searchTerm && (
        <div className="see-more-container">
          <button
            className="see-more-button"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                📤 Show Less Stations
              </>
            ) : (
              <>
                📥 See More Stations ({filteredStations.length - 12} more)
              </>
            )}
          </button>
        </div>
      )}

      {/* No Results Message */}
      {filteredStations.length === 0 && (
        <div className="no-results">
          <p>🔍 No stations found matching your search.</p>
          <button 
            className="clear-search"
            onClick={() => {
              setSearchTerm('');
              setSelectedRegion('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StationSelector;
