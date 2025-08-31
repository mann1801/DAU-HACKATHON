import React, { useState, useEffect } from 'react';
import AirQualityDashboard from './components/AirQualityDashboard';
import LocationService from './services/LocationService';
import './App.css';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const locationService = new LocationService();

  useEffect(() => {
    // Try to get user's location on app load
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentPosition();
      setCurrentLocation(location);
      await fetchAirQualityData(location.latitude, location.longitude);
    } catch (err) {
      setError('Unable to get location. Using default location (New York).');
      // Default to New York
      const defaultLocation = { latitude: 40.7128, longitude: -74.0060 };
      setCurrentLocation(defaultLocation);
      await fetchAirQualityData(defaultLocation.latitude, defaultLocation.longitude);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirQualityData = async (lat, lon) => {
    try {
      const response = await fetch(`http://localhost:8000/api/air-quality/current?latitude=${lat}&longitude=${lon}`);
      if (!response.ok) throw new Error('Failed to fetch air quality data');
      const data = await response.json();
      setAirQualityData(data.data);
    } catch (err) {
      console.error('API Error:', err);
      // Use mock data as fallback
      setAirQualityData({
        time: new Date().toISOString(),
        pm2_5: 12.5,
        pm10: 18.3,
        carbon_monoxide: 0.3,
        nitrogen_dioxide: 25.1,
        sulphur_dioxide: 8.2,
        ozone: 65.4,
        uv_index: 3.2,
        european_aqi: 42
      });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌍 Air Quality Monitor</h1>
        <p>Real-time air pollution tracking and analysis</p>
      </header>
      
      <AirQualityDashboard
        location={currentLocation}
        airQualityData={airQualityData}
        loading={loading}
        error={error}
        onLocationRefresh={getCurrentLocation}
        onLocationChange={fetchAirQualityData}
      />
    </div>
  );
};

export default App;
