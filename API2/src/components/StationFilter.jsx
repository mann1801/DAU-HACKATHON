import React, { useState, useMemo, useRef } from 'react';
import LocationButton from './LocationButton';
import geolocationService from '../services/geolocationService';

const StationFilter = ({ stations, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [nearestStations, setNearestStations] = useState([]);
  const locationButtonRef = useRef();

  // Get unique countries from stations
  const countries = useMemo(() => {
    const countrySet = new Set();
    Object.values(stations).forEach(station => {
      if (station.country) {
        countrySet.add(station.country);
      }
    });
    return Array.from(countrySet).sort();
  }, [stations]);

  // Filter and sort stations based on search, country, and distance
  const filteredStations = useMemo(() => {
    let filtered = Object.entries(stations);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(([id, station]) =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (station.country && station.country.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by country
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(([id, station]) => station.country === selectedCountry);
    }

    // Sort by distance if location is available and sort is enabled
    if (sortByDistance && geolocationService.getCachedLocation()) {
      const userLocation = geolocationService.getCachedLocation();
      filtered = filtered.map(([id, station]) => {
        const distance = geolocationService.calculateDistance(
          userLocation.lat,
          userLocation.lon,
          station.lat,
          station.lon
        );
        return [id, { ...station, distance: Math.round(distance * 10) / 10 }];
      }).sort((a, b) => a[1].distance - b[1].distance);
    }

    return filtered;
  }, [stations, searchTerm, selectedCountry, sortByDistance]);

  // Determine how many stations to show
  const stationsToShow = showAll ? filteredStations : filteredStations.slice(0, 12);
  const hasMore = filteredStations.length > 12;

  // Notify parent of filtered stations
  React.useEffect(() => {
    const stationObject = Object.fromEntries(stationsToShow);
    onFilterChange(stationObject);
  }, [stationsToShow, onFilterChange]);

  const handleLocationUpdate = (location) => {
    // Enable distance sorting when location is available
    if (location && !sortByDistance) {
      setSortByDistance(true);
    }
  };

  const handleNearestStations = (nearest) => {
    setNearestStations(nearest);
    setSortByDistance(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setShowAll(false);
    setSortByDistance(false);
  };

  const toggleDistanceSort = () => {
    if (!geolocationService.getCachedLocation()) {
      // Request location first
      locationButtonRef.current?.findNearestStations(stations);
    } else {
      setSortByDistance(!sortByDistance);
    }
  };

  const getCountryFlag = (country) => {
    const flags = {
      'USA': '🇺🇸',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'Singapore': '🇸🇬',
      'Thailand': '🇹🇭',
      'Philippines': '🇵🇭',
      'Indonesia': '🇮🇩',
      'Malaysia': '🇲🇾',
      'Vietnam': '🇻🇳',
      'UK': '🇬🇧',
      'Netherlands': '🇳🇱',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Greece': '🇬🇷',
      'Turkey': '🇹🇷',
      'Portugal': '🇵🇹',
      'Sweden': '🇸🇪',
      'UAE': '🇦🇪',
      'Qatar': '🇶🇦',
      'Kuwait': '🇰🇼',
      'Oman': '🇴🇲',
      'Saudi Arabia': '🇸🇦'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="station-filter">
      <div className="location-section">
        <LocationButton
          ref={locationButtonRef}
          onLocationUpdate={handleLocationUpdate}
          onNearestStations={handleNearestStations}
        />
        
        {geolocationService.getCachedLocation() && (
          <button
            onClick={toggleDistanceSort}
            className={`distance-sort-btn ${sortByDistance ? 'active' : ''}`}
          >
            📏 {sortByDistance ? 'Sorted by Distance' : 'Sort by Distance'}
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="country-group">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="country-select"
          >
            <option value="all">🌍 All Countries ({Object.keys(stations).length})</option>
            {countries.map(country => {
              const count = Object.values(stations).filter(s => s.country === country).length;
              return (
                <option key={country} value={country}>
                  {getCountryFlag(country)} {country} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {(searchTerm || selectedCountry !== 'all' || sortByDistance) && (
          <button onClick={handleClearFilters} className="clear-filters-btn">
            ✕ Clear Filters
          </button>
        )}
      </div>

      <div className="filter-info">
        <span className="station-count">
          Showing {stationsToShow.length} of {filteredStations.length} stations
          {searchTerm || selectedCountry !== 'all' ? ` (filtered from ${Object.keys(stations).length} total)` : ''}
        </span>
        
        {hasMore && !showAll && (
          <button 
            onClick={() => setShowAll(true)} 
            className="show-more-btn"
          >
            📥 Show More Stations ({filteredStations.length - 12} more)
          </button>
        )}
        
        {showAll && hasMore && (
          <button 
            onClick={() => setShowAll(false)} 
            className="show-less-btn"
          >
            📤 Show Less Stations
          </button>
        )}
      </div>

      {filteredStations.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <div className="no-results-message">No stations found</div>
          <div className="no-results-submessage">
            Try adjusting your search terms or country filter
          </div>
          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StationFilter;
