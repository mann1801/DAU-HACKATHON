import React from 'react';
import { format } from 'date-fns';
import './DataSummary.css';

const DataSummary = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3>Data Summary</h3>
        <p>No data available</p>
      </div>
    );
  }

  const currentLevel = data[data.length - 1]?.waterLevel || 0;
  const maxLevel = Math.max(...data.map(item => item.waterLevel));
  const minLevel = Math.min(...data.map(item => item.waterLevel));
  const avgLevel = data.reduce((sum, item) => sum + item.waterLevel, 0) / data.length;
  const lastUpdate = data[data.length - 1]?.time;

  const getTrendIcon = () => {
    if (data.length < 2) return '➡️';
    const recent = data.slice(-3);
    const trend = recent[recent.length - 1].waterLevel - recent[0].waterLevel;
    
    if (trend > 0.1) return '📈';
    if (trend < -0.1) return '📉';
    return '➡️';
  };

  const getStatusColor = (level) => {
    if (level > 4) return '#e74c3c'; // High - Red
    if (level > 2) return '#f39c12'; // Medium - Orange
    return '#27ae60'; // Normal - Green
  };

  return (
    <div className="card data-summary">
      <h3>📊 Current Water Level Summary</h3>
      
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Current Level</div>
          <div 
            className="summary-value current-level"
            style={{ color: getStatusColor(currentLevel) }}
          >
            {currentLevel.toFixed(2)} ft {getTrendIcon()}
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-label">24h High</div>
          <div className="summary-value">{maxLevel.toFixed(2)} ft</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">24h Low</div>
          <div className="summary-value">{minLevel.toFixed(2)} ft</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">24h Average</div>
          <div className="summary-value">{avgLevel.toFixed(2)} ft</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Range</div>
          <div className="summary-value">{(maxLevel - minLevel).toFixed(2)} ft</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Last Update</div>
          <div className="summary-value">
            {lastUpdate ? format(new Date(lastUpdate), 'MMM dd, HH:mm') : 'N/A'}
          </div>
        </div>
      </div>

      <div className="status-indicator">
        <div className="status-badge" style={{ backgroundColor: getStatusColor(currentLevel) }}>
          {currentLevel > 4 ? 'HIGH WATER' : currentLevel > 2 ? 'MODERATE' : 'NORMAL'}
        </div>
      </div>
    </div>
  );
};

export default DataSummary;
