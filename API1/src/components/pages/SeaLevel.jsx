import React from 'react';
import WaterLevelChart from '../WaterLevelChart';
import StationSelector from '../StationSelector';
import DataSummary from '../DataSummary';
import LocationButton from '../LocationButton';

const SeaLevel = ({ 
  waterLevelData, 
  selectedStation, 
  onStationChange, 
  loading, 
  error 
}) => {
  return (
    <div className="page-content">
      <div className="hero-section">
        <h1>🌊 Sea Level Monitoring</h1>
        <p>Advanced water level analysis and tidal predictions</p>
      </div>

      <div className="sea-level-controls">
        <LocationButton 
          onLocationFound={onStationChange}
          selectedStation={selectedStation}
        />

        <StationSelector 
          selectedStation={selectedStation}
          onStationChange={onStationChange}
        />
      </div>

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
          
          <div className="sea-level-insights">
            <h3>📊 Sea Level Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>📈 Trend Analysis</h4>
                <p>Long-term sea level rise: +2.3mm/year</p>
              </div>
              <div className="insight-card">
                <h4>🌙 Tidal Patterns</h4>
                <p>Semi-diurnal tides with 6.2h cycle</p>
              </div>
              <div className="insight-card">
                <h4>⚠️ Flood Risk</h4>
                <p>High tide flood potential: Moderate</p>
              </div>
              <div className="insight-card">
                <h4>🔮 Predictions</h4>
                <p>Next high tide: 3.2ft in 4h 15m</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SeaLevel;
