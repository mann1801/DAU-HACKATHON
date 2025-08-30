import React, { useState, useEffect } from 'react';
import WaterLevelChart from './components/WaterLevelChart';
import StationSelector from './components/StationSelector';
import DataSummary from './components/DataSummary';
import LocationButton from './components/LocationButton';
import './App.css';

const App = () => {
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [selectedStation, setSelectedStation] = useState('8518750'); // Default to The Battery, NY
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWaterLevelData = async (stationId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Connect to Flask API server
      const response = await fetch(`http://localhost:5000/api/water-level/${stationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch water level data');
      }
      const data = await response.json();
      setWaterLevelData(data);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data if API is unavailable
      const mockData = generateMockData();
      setWaterLevelData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const waterLevel = 2.5 + Math.sin(i * 0.5) * 1.2 + Math.random() * 0.3;
      
      data.push({
        time: time.toISOString(),
        waterLevel: parseFloat(waterLevel.toFixed(2)),
        prediction: parseFloat((waterLevel + Math.random() * 0.2 - 0.1).toFixed(2))
      });
    }
    
    return data;
  };

  useEffect(() => {
    fetchWaterLevelData(selectedStation);
  }, [selectedStation]);

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🌊 NOAA Water Level Dashboard</h1>
          <p>Real-time water level monitoring and predictions</p>
        </header>

        <LocationButton 
          onLocationFound={handleStationChange}
          selectedStation={selectedStation}
        />

        <StationSelector 
          selectedStation={selectedStation}
          onStationChange={handleStationChange}
        />

        {error && (
          <div className="error">
            <strong>Note:</strong> Using mock data for demonstration. {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading water level data...</div>
        ) : (
          <>
            <DataSummary data={waterLevelData} />
            <WaterLevelChart data={waterLevelData} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
