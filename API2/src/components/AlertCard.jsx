import React from 'react';
import { format } from 'date-fns';

const AlertCard = ({ storm }) => {
  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM dd, HH:mm UTC');
    } catch (error) {
      return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    if (category.includes('Category 5')) return '#8b00ff';
    if (category.includes('Category 4')) return '#ff0000';
    if (category.includes('Category 3')) return '#ff4500';
    if (category.includes('Category 2')) return '#ffa500';
    if (category.includes('Category 1')) return '#ffff00';
    if (category.includes('Tropical Storm')) return '#00ff00';
    if (category.includes('Tropical Depression')) return '#00bfff';
    return '#808080';
  };

  return (
    <div className="alert-card">
      <div className="alert-header">
        <div className="storm-info">
          <div className="storm-name">
            {storm.emoji} {storm.storm_name}
          </div>
          <div className="storm-id">{storm.storm_id}</div>
        </div>
        <div className={`alert-level ${storm.alert_level}`}>
          {storm.alert_level}
        </div>
      </div>

      <div className="category-indicator" style={{
        background: getCategoryColor(storm.category),
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '15px'
      }}>
        {storm.category}
      </div>

      <div className="storm-details">
        <div className="detail-item">
          <span className="detail-label">Position</span>
          <span className="detail-value">
            {storm.current_position.lat?.toFixed(1)}°N, {Math.abs(storm.current_position.lon)?.toFixed(1)}°W
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Wind Speed</span>
          <span className="detail-value">
            {storm.wind_speed_knots} kt ({storm.wind_speed_mph?.toFixed(0)} mph)
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Pressure</span>
          <span className="detail-value">
            {storm.pressure_mb} mb
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Movement</span>
          <span className="detail-value">
            {storm.movement.direction_cardinal} at {storm.movement.speed_knots} kt
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Nearest Station</span>
          <span className="detail-value">
            {storm.nearest_station.station_name} ({storm.nearest_station.distance_km?.toFixed(1)} km)
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Last Update</span>
          <span className="detail-value">
            {formatTimestamp(storm.current_position.timestamp)}
          </span>
        </div>
      </div>

      {storm.warnings && storm.warnings.length > 0 && (
        <div className="warnings-list">
          <div className="warnings-title">⚠️ Warnings:</div>
          {storm.warnings.map((warning, index) => (
            <div key={index} className="warning-item">
              <span className="warning-icon">
                {warning.type === 'high_wind' ? '💨' : 
                 warning.type === 'proximity_warning' ? '📍' : '⚠️'}
              </span>
              <span className="warning-message">{warning.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertCard;
