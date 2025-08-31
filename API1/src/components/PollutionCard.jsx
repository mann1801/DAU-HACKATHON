import React from 'react';
import './PollutionCard.css';

const PollutionCard = ({ title, value, unit, icon, threshold, description }) => {
  const getStatusLevel = (value, threshold) => {
    if (value <= threshold * 0.5) return { level: 'good', color: '#00e400' };
    if (value <= threshold) return { level: 'moderate', color: '#ffff00' };
    if (value <= threshold * 1.5) return { level: 'unhealthy-sensitive', color: '#ff7e00' };
    if (value <= threshold * 2) return { level: 'unhealthy', color: '#ff0000' };
    return { level: 'hazardous', color: '#7e0023' };
  };

  const status = getStatusLevel(value, threshold);

  return (
    <div className={`pollution-card ${status.level}`}>
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3 className="card-title">{title}</h3>
      </div>
      
      <div className="card-content">
        <div className="value-display">
          <span className="value">{value?.toFixed(1) || 'N/A'}</span>
          <span className="unit">{unit}</span>
        </div>
        
        <div className="status-indicator" style={{ backgroundColor: status.color }}>
          <span className="status-text">{status.level.replace('-', ' ')}</span>
        </div>
        
        <p className="description">{description}</p>
        
        <div className="threshold-info">
          <span className="threshold-label">WHO Guideline: {threshold} {unit}</span>
        </div>
      </div>
    </div>
  );
};

export default PollutionCard;
