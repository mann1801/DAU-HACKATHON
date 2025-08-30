import React, { useState } from 'react';
import { getCurrentLocation, findNearestStation } from '../utils/geolocation';
import './LocationButton.css';

const LocationButton = ({ onLocationFound, selectedStation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStationInfo, setNearestStationInfo] = useState(null);

  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      const nearest = findNearestStation(location.lat, location.lon);
      setNearestStationInfo(nearest);
      
      // Auto-select the nearest station
      onLocationFound(nearest.station.id);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-section">
      <div className="location-header">
        <h4>📍 Find Nearest Station</h4>
        <button 
          className={`location-button ${loading ? 'loading' : ''}`}
          onClick={handleGetLocation}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Getting Location...
            </>
          ) : (
            <>
              🎯 Use My Location
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="location-error">
          <strong>Location Error:</strong> {error}
          <div className="error-help">
            Please enable location access in your browser settings.
          </div>
        </div>
      )}

      {userLocation && nearestStationInfo && (
        <div className="location-result">
          <div className="location-info">
            <div className="user-coords">
              📍 Your Location: {userLocation.lat.toFixed(4)}°, {userLocation.lon.toFixed(4)}°
            </div>
            <div className="nearest-station">
              🎯 Nearest Station: <strong>{nearestStationInfo.station.name}</strong>
              <span className="distance">({nearestStationInfo.distance} miles away)</span>
            </div>
            {nearestStationInfo.station.id === selectedStation && (
              <div className="active-indicator">
                ✅ Currently viewing nearest station
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationButton;
