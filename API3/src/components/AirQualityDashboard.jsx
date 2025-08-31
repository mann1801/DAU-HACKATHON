import React, { useState, useEffect } from 'react';
import AirQualityCard from './AirQualityCard';
import PollutionChart from './PollutionChart';
import StationSelector from './StationSelector';
import PollutionMap from './PollutionMap';
import AQIIndicator from './AQIIndicator';
import LocationService from '../services/LocationService';
import AirQualityAPI from '../services/airQualityAPI';
import './AirQualityDashboard.css';

const AirQualityDashboard = ({ location, airQualityData, loading, error, onLocationRefresh, onLocationChange }) => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [nearestStations, setNearestStations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const locationService = new LocationService();
  const airQualityAPI = new AirQualityAPI();

  useEffect(() => {
    if (location) {
      findNearestStations();
      fetchHourlyData();
    }
  }, [location]);

  useEffect(() => {
    if (selectedStation) {
      onLocationChange(selectedStation.latitude, selectedStation.longitude);
      fetchHourlyData();
    }
  }, [selectedStation]);

  const findNearestStations = () => {
    if (!location) return;

    const stations = airQualityAPI.getMonitoringStations();
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: locationService.calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      )
    }));

    const nearest = stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setNearestStations(nearest);
    if (!selectedStation && nearest.length > 0) {
      setSelectedStation(nearest[0]);
    }
  };

  const fetchHourlyData = async () => {
    if (!location && !selectedStation) return;

    const lat = selectedStation?.latitude || location?.latitude;
    const lon = selectedStation?.longitude || location?.longitude;

    if (!lat || !lon) return;

    try {
      const response = await airQualityAPI.getHourlyAirQuality(lat, lon, 2);
      setHourlyData(response.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch hourly data:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onLocationRefresh();
    await fetchHourlyData();
    setRefreshing(false);
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: '#00e400', icon: '😊' };
    if (aqi <= 100) return { level: 'Moderate', color: '#ffff00', icon: '😐' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: '#ff7e00', icon: '😷' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#ff0000', icon: '😨' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8f3f97', icon: '🤢' };
    return { level: 'Hazardous', color: '#7e0023', icon: '☠️' };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading air quality data...</p>
      </div>
    );
  }

  return (
    <div className="air-quality-dashboard">
      {/* Header Controls */}
      <div className="dashboard-header">
        <div className="location-info">
          {location && (
            <div className="current-location">
              <span className="location-icon">📍</span>
              <span className="location-text">
                {location.city || 'Unknown'}, {location.country || 'Unknown'}
              </span>
              <span className="coordinates">
                ({location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)})
              </span>
            </div>
          )}
        </div>
        
        <div className="dashboard-controls">
          <button 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <span className="refresh-icon">🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
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

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Current AQI Overview */}
        {airQualityData && (
          <div className="aqi-overview">
            <AQIIndicator 
              aqi={airQualityData.european_aqi} 
              location={selectedStation?.name || 'Current Location'}
            />
          </div>
        )}

        {/* Station Selector */}
        <div className="station-section">
          <StationSelector
            stations={nearestStations}
            selectedStation={selectedStation}
            onStationSelect={handleStationSelect}
            userLocation={location}
          />
        </div>

        {/* Pollution Metrics Cards */}
        {airQualityData && (
          <div className="pollution-metrics">
            <AirQualityCard
              title="PM2.5"
              value={airQualityData.pm2_5}
              unit="µg/m³"
              icon="🔴"
              threshold={25}
              description="Fine particulate matter"
            />
            <AirQualityCard
              title="PM10"
              value={airQualityData.pm10}
              unit="µg/m³"
              icon="🟠"
              threshold={50}
              description="Coarse particulate matter"
            />
            <AirQualityCard
              title="NO₂"
              value={airQualityData.nitrogen_dioxide}
              unit="µg/m³"
              icon="🟡"
              threshold={40}
              description="Nitrogen dioxide"
            />
            <AirQualityCard
              title="O₃"
              value={airQualityData.ozone}
              unit="µg/m³"
              icon="🔵"
              threshold={120}
              description="Ground-level ozone"
            />
            <AirQualityCard
              title="SO₂"
              value={airQualityData.sulphur_dioxide}
              unit="µg/m³"
              icon="🟣"
              threshold={20}
              description="Sulfur dioxide"
            />
            <AirQualityCard
              title="CO"
              value={airQualityData.carbon_monoxide}
              unit="mg/m³"
              icon="⚫"
              threshold={10}
              description="Carbon monoxide"
            />
          </div>
        )}

        {/* Charts and Map */}
        <div className="dashboard-charts">
          <div className="chart-section">
            <PollutionChart data={hourlyData} />
          </div>
          <div className="map-section">
            <PollutionMap
              stations={nearestStations}
              selectedStation={selectedStation}
              userLocation={location}
              onStationSelect={handleStationSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityDashboard;
