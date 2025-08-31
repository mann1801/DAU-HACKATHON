import React from 'react';
import WaterLevelChart from '../WaterLevelChart';
import StationSelector from '../StationSelector';
import DataSummary from '../DataSummary';
import LocationButton from '../LocationButton';

const Home = ({ 
  waterLevelData, 
  selectedStation, 
  onStationChange, 
  loading, 
  error 
}) => {
  return (
    <div className="page-content">
      <div className="hero-section">
        <h1>🌊 NOAA Water Level Dashboard</h1>
        <p>Real-time water level monitoring and predictions</p>
      </div>

      <LocationButton 
        onLocationFound={onStationChange}
        selectedStation={selectedStation}
      />

      <StationSelector 
        selectedStation={selectedStation}
        onStationChange={onStationChange}
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
  );
};

export default Home;
