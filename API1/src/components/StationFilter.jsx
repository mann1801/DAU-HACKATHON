import React, { useState, useEffect, useMemo } from 'react';
import { geolocationService } from '../services/geolocationService';

const StationFilter = ({ stations, storms, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const [locationError, setLocationError] = useState('');
  const [nearestStations, setNearestStations] = useState([]);

  // Get unique countries from stations
  const countries = useMemo(() => {
    const countrySet = new Set();
    Object.values(stations).forEach(station => {
      if (station.country) countrySet.add(station.country);
    });
    return Array.from(countrySet).sort();
  }, [stations]);

  // Filter and sort stations
  const filteredStations = useMemo(() => {
    let filtered = Object.entries(stations);

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(([id, station]) => 
        station.name.toLowerCase().includes(term) ||
        id.toLowerCase().includes(term) ||
        (station.country && station.country.toLowerCase().includes(term))
      );
    }

    // Apply country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(([, station]) => station.country === selectedCountry);
    }

    // Sort by distance if enabled and user location available
    if (sortByDistance && userLocation) {
      filtered = filtered.map(([id, station]) => [
        id,
        {
          ...station,
          distance: geolocationService.calculateDistance(
            userLocation.lat, userLocation.lon, station.lat, station.lon
          ).toFixed(1)
        }
      ]).sort(([, a], [, b]) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    // Apply show more/less limit
    if (!showAll && filtered.length > 12) {
      filtered = filtered.slice(0, 12);
    }

    return filtered.reduce((obj, [id, station]) => {
      obj[id] = station;
      return obj;
    }, {});
  }, [stations, searchTerm, selectedCountry, showAll, sortByDistance, userLocation]);

  // Update parent component when filtered stations change
  useEffect(() => {
    onFilterChange(filteredStations);
  }, [filteredStations, onFilterChange]);

  // Handle location request
  const handleLocationRequest = async () => {
    if (!geolocationService.isSupported()) {
      setLocationError('Geolocation is not supported by this browser');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    try {
      const position = await geolocationService.getCurrentPosition();
      setUserLocation(position);
      setLocationStatus('success');

      // Find nearest stations
      const nearest = geolocationService.findNearestStations(
        stations, position.lat, position.lon, 5
      );
      setNearestStations(nearest);

      // Auto-enable distance sorting
      setSortByDistance(true);
    } catch (error) {
      setLocationError(error.message);
      setLocationStatus('error');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setShowAll(false);
    setSortByDistance(false);
  };

  const totalStations = Object.keys(stations).length;
  const filteredCount = Object.keys(filteredStations).length;
  const remainingCount = totalStations - (showAll ? 0 : Math.min(12, filteredCount));

  return (
    <div className="station-filter">
      <div className="filter-header">
        <h3>🔍 Station Filter & Location</h3>
        <div className="station-count">
          Showing {filteredCount} of {totalStations} stations
        </div>
      </div>

      <div className="filter-controls">
        {/* Search Input */}
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Search stations by name, ID, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Country Filter */}
        <div className="filter-group">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="country-select"
          >
            <option value="all">🌍 All Countries ({totalStations})</option>
            {countries.map(country => {
              const countryCount = Object.values(stations).filter(s => s.country === country).length;
              const flag = country === 'USA' ? '🇺🇸' : 
                          country === 'India' ? '🇮🇳' : 
                          country === 'China' ? '🇨🇳' : 
                          country === 'Japan' ? '🇯🇵' : '🏳️';
              return (
                <option key={country} value={country}>
                  {flag} {country} ({countryCount})
                </option>
              );
            })}
          </select>
        </div>

        {/* Location Controls */}
        <div className="location-controls">
          <button
            onClick={handleLocationRequest}
            disabled={locationStatus === 'loading'}
            className={`location-button ${locationStatus}`}
          >
            {locationStatus === 'loading' ? '📍 Getting Location...' :
             locationStatus === 'success' ? '✅ Location Found' :
             '🌍 Get My Location'}
          </button>

          {userLocation && (
            <button
              onClick={() => setSortByDistance(!sortByDistance)}
              className={`sort-button ${sortByDistance ? 'active' : ''}`}
            >
              📏 Sort by Distance
            </button>
          )}
        </div>
      </div>

      {/* Location Status */}
      {locationStatus === 'success' && userLocation && (
        <div className="location-info">
          <div className="location-details">
            📍 Your Location: {userLocation.lat.toFixed(4)}°, {userLocation.lon.toFixed(4)}°
            <span className="accuracy">±{userLocation.accuracy?.toFixed(0)}m</span>
          </div>
        </div>
      )}

      {locationError && (
        <div className="location-error">
          ❌ {locationError}
        </div>
      )}

      {/* Nearest Stations */}
      {nearestStations.length > 0 && (
        <div className="nearest-stations">
          <h4>📍 Nearest Stations to You:</h4>
          <div className="nearest-list">
            {nearestStations.slice(0, 3).map(station => (
              <div key={station.id} className="nearest-item">
                <span className="station-name">{station.name}</span>
                <span className="distance">{station.distance.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="filter-actions">
        {(searchTerm || selectedCountry !== 'all') && (
          <button onClick={clearFilters} className="clear-button">
            🗑️ Clear Filters
          </button>
        )}

        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="show-more-button"
          >
            📥 Show More Stations ({remainingCount} more)
          </button>
        )}

        {showAll && totalStations > 12 && (
          <button
            onClick={() => setShowAll(false)}
            className="show-less-button"
          >
            📤 Show Less Stations
          </button>
        )}
      </div>
    </div>
  );
};

export default StationFilter;
