import React, { useState, useEffect } from 'react';
import geolocationService from '../services/geolocationService';

const LocationButton = ({ onLocationUpdate, onNearestStations }) => {
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const [locationInfo, setLocationInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if location is already available
    const cachedLocation = geolocationService.getCachedLocation();
    if (cachedLocation) {
      setLocationStatus('success');
      updateLocationInfo(cachedLocation);
    }
  }, []);

  const updateLocationInfo = async (location) => {
    try {
      const reverseGeocode = await geolocationService.getReverseGeocode();
      const info = {
        ...location,
        ...reverseGeocode
      };
      setLocationInfo(info);
      onLocationUpdate && onLocationUpdate(location);
    } catch (error) {
      console.warn('Could not get location info:', error);
      setLocationInfo({
        ...location,
        city: 'Unknown',
        country: 'Unknown'
      });
      onLocationUpdate && onLocationUpdate(location);
    }
  };

  const handleGetLocation = async () => {
    if (!geolocationService.isSupported()) {
      setError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    setError(null);

    try {
      const location = await geolocationService.getCurrentPosition();
      setLocationStatus('success');
      await updateLocationInfo(location);
    } catch (err) {
      setError(err.message);
      setLocationStatus('error');
    }
  };

  const handleFindNearestStations = (stations) => {
    if (!geolocationService.getCachedLocation()) {
      handleGetLocation().then(() => {
        const nearestStations = geolocationService.findNearestStations(stations, 5);
        onNearestStations && onNearestStations(nearestStations);
      });
    } else {
      const nearestStations = geolocationService.findNearestStations(stations, 5);
      onNearestStations && onNearestStations(nearestStations);
    }
  };

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'loading':
        return '🔄';
      case 'success':
        return '📍';
      case 'error':
        return '❌';
      default:
        return '🌍';
    }
  };

  const getButtonText = () => {
    switch (locationStatus) {
      case 'loading':
        return 'Getting Location...';
      case 'success':
        return 'Location Found';
      case 'error':
        return 'Try Again';
      default:
        return 'Get My Location';
    }
  };

  return (
    <div className="location-button-container">
      <button
        onClick={handleGetLocation}
        disabled={locationStatus === 'loading'}
        className={`location-button ${locationStatus}`}
      >
        <span className="location-icon">{getStatusIcon()}</span>
        <span className="location-text">{getButtonText()}</span>
      </button>

      {locationStatus === 'success' && locationInfo && (
        <div className="location-info">
          <div className="location-details">
            <span className="location-city">
              📍 {locationInfo.city}, {locationInfo.country}
            </span>
            <span className="location-coords">
              {locationInfo.lat.toFixed(4)}°, {locationInfo.lon.toFixed(4)}°
            </span>
          </div>
          <div className="location-accuracy">
            Accuracy: ±{Math.round(locationInfo.accuracy)}m
          </div>
        </div>
      )}

      {locationStatus === 'error' && error && (
        <div className="location-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}

      {/* Expose function to parent components */}
      {React.cloneElement(<div />, {
        ref: (ref) => {
          if (ref) {
            ref.findNearestStations = handleFindNearestStations;
          }
        }
      })}
    </div>
  );
};

export default LocationButton;
