import React, { useState, useEffect } from 'react';
import PollutionCard from '../PollutionCard';
import PollutionChart from '../PollutionChart';
import PollutionStationSelector from '../PollutionStationSelector';
import AQIIndicator from '../AQIIndicator';
import { geolocationService } from '../../services/geolocationService';
import PollutionAPI, { POLLUTION_STATIONS } from '../../services/pollutionAPI';

const Pollution = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [nearestStations, setNearestStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // geolocationService is already instantiated
  const pollutionAPI = new PollutionAPI();

  useEffect(() => {
    initializePollutionMonitoring();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentLocation) {
      findNearestStations();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (selectedStation) {
      fetchAirQualityData(selectedStation.latitude, selectedStation.longitude);
      fetchHourlyData(selectedStation.latitude, selectedStation.longitude);
    }
  }, [selectedStation]);

  const initializePollutionMonitoring = async () => {
    setLoading(true);
    try {
      const location = await geolocationService.getCurrentPosition();
      const locationInfo = await geolocationService.reverseGeocode(location.lat, location.lon);
      setCurrentLocation({ 
        latitude: location.lat, 
        longitude: location.lon, 
        accuracy: location.accuracy,
        ...locationInfo 
      });
    } catch (err) {
      setError('Location access denied. Using default location (New York).');
      const defaultLocation = { 
        latitude: 40.7128, 
        longitude: -74.0060, 
        city: 'New York', 
        country: 'United States' 
      };
      setCurrentLocation(defaultLocation);
      await fetchAirQualityData(defaultLocation.latitude, defaultLocation.longitude);
    } finally {
      setLoading(false);
    }
  };

  const findNearestStations = () => {
    if (!currentLocation) return;

    const stationsWithDistance = POLLUTION_STATIONS.map(station => ({
      ...station,
      distance: geolocationService.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        station.latitude,
        station.longitude
      )
    }));

    const nearest = stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setNearestStations(nearest);
    if (!selectedStation && nearest.length > 0) {
      setSelectedStation(nearest[0]);
    }
  };

  const fetchAirQualityData = async (lat, lon) => {
    try {
      const response = await pollutionAPI.getCurrentAirQuality(lat, lon);
      setAirQualityData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch air quality data:', err);
    }
  };

  const fetchHourlyData = async (lat, lon) => {
    try {
      const response = await pollutionAPI.getHourlyAirQuality(lat, lon, 2);
      setHourlyData(response.data || []);
    } catch (err) {
      console.error('Failed to fetch hourly data:', err);
    }
  };

  const refreshData = async () => {
    if (selectedStation) {
      await fetchAirQualityData(selectedStation.latitude, selectedStation.longitude);
      await fetchHourlyData(selectedStation.latitude, selectedStation.longitude);
    } else if (currentLocation) {
      await fetchAirQualityData(currentLocation.latitude, currentLocation.longitude);
      await fetchHourlyData(currentLocation.latitude, currentLocation.longitude);
    }
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading air quality data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="hero-section">
        <h1>🏭 Air Quality & Pollution Monitoring</h1>
        <p>Real-time air pollution tracking and analysis worldwide</p>
      </div>

      {/* Dashboard Header */}
      <div className="pollution-header">
        <div className="location-info">
          {currentLocation && (
            <div className="current-location">
              <span className="location-icon">📍</span>
              <span className="location-text">
                {currentLocation.city}, {currentLocation.country}
              </span>
              <span className="coordinates">
                ({currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)})
              </span>
            </div>
          )}
        </div>
        
        <div className="dashboard-controls">
          <button 
            className="refresh-btn"
            onClick={refreshData}
          >
            <span className="refresh-icon">🔄</span>
            Refresh
          </button>
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="pollution-dashboard">
        {/* AQI Overview */}
        {airQualityData && (
          <div className="aqi-section">
            <AQIIndicator 
              aqi={airQualityData.european_aqi} 
              location={selectedStation?.name || 'Current Location'}
            />
          </div>
        )}

        {/* Station Selector */}
        <div className="station-section">
          <PollutionStationSelector
            stations={nearestStations}
            selectedStation={selectedStation}
            onStationSelect={handleStationSelect}
            userLocation={currentLocation}
          />
        </div>

        {/* Pollution Metrics */}
        {airQualityData && (
          <div className="pollution-metrics">
            <PollutionCard
              title="PM2.5"
              value={airQualityData.pm2_5}
              unit="µg/m³"
              icon="🔴"
              threshold={25}
              description="Fine particulate matter"
            />
            <PollutionCard
              title="PM10"
              value={airQualityData.pm10}
              unit="µg/m³"
              icon="🟠"
              threshold={50}
              description="Coarse particulate matter"
            />
            <PollutionCard
              title="NO₂"
              value={airQualityData.nitrogen_dioxide}
              unit="µg/m³"
              icon="🟡"
              threshold={40}
              description="Nitrogen dioxide"
            />
            <PollutionCard
              title="O₃"
              value={airQualityData.ozone}
              unit="µg/m³"
              icon="🔵"
              threshold={120}
              description="Ground-level ozone"
            />
            <PollutionCard
              title="SO₂"
              value={airQualityData.sulphur_dioxide}
              unit="µg/m³"
              icon="🟣"
              threshold={20}
              description="Sulfur dioxide"
            />
            <PollutionCard
              title="CO"
              value={airQualityData.carbon_monoxide}
              unit="mg/m³"
              icon="⚫"
              threshold={10}
              description="Carbon monoxide"
            />
          </div>
        )}

        {/* Pollution Trends Chart */}
        <div className="chart-section">
          <PollutionChart data={hourlyData} />
        </div>

        {/* Recent Alerts */}
        <div className="recent-alerts">
          <h3>🚨 Recent Pollution Alerts</h3>
          <div className="alert-list">
            <div className="alert-item warning">
              <span className="alert-time">2 hours ago</span>
              <span className="alert-message">Elevated PM2.5 levels detected in {selectedStation?.city || 'current area'}</span>
            </div>
            <div className="alert-item info">
              <span className="alert-time">6 hours ago</span>
              <span className="alert-message">Air quality improved at {selectedStation?.name || 'monitoring station'}</span>
            </div>
            <div className="alert-item danger">
              <span className="alert-time">1 day ago</span>
              <span className="alert-message">High ozone levels reported in urban areas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pollution;
