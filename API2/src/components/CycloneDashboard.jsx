import React, { useState, useEffect } from 'react';
import AlertCard from './AlertCard';
import StormMap from './StormMap';
import StationMonitor from './StationMonitor';

const CycloneDashboard = ({ storms, stations, loading, onRefresh }) => {
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');

  // Filter storms based on alert level
  const filteredStorms = storms.filter(storm => {
    if (filterLevel === 'all') return true;
    return storm.alert_level === filterLevel;
  });

  // Get summary statistics
  const getStats = () => {
    const total = storms.length;
    const critical = storms.filter(s => s.alert_level === 'critical').length;
    const danger = storms.filter(s => s.alert_level === 'danger').length;
    const warning = storms.filter(s => s.alert_level === 'warning').length;
    
    return { total, critical, danger, warning };
  };

  const stats = getStats();

  return (
    <div className="cyclone-dashboard">
      {/* Dashboard Statistics */}
      <div className="dashboard-stats">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Storms</div>
          </div>
          <div className="stat-card critical">
            <div className="stat-number">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-number">{stats.danger}</div>
            <div className="stat-label">High Risk</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">{stats.warning}</div>
            <div className="stat-label">Moderate Risk</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-group">
          <label>Filter by Alert Level:</label>
          <select 
            value={filterLevel} 
            onChange={(e) => setFilterLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Storms ({storms.length})</option>
            <option value="critical">Critical ({stats.critical})</option>
            <option value="danger">High Risk ({stats.danger})</option>
            <option value="warning">Moderate Risk ({stats.warning})</option>
          </select>
        </div>
        
        <button 
          onClick={onRefresh} 
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? '🔄 Updating...' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* Storm Alerts Grid */}
      <div className="alerts-section">
        <h3 className="section-title">
          🚨 Active Storm Alerts 
          {filterLevel !== 'all' && ` (${filterLevel})`}
        </h3>
        
        {filteredStorms.length > 0 ? (
          <div className="alerts-grid">
            {filteredStorms.map((storm) => (
              <AlertCard 
                key={storm.storm_id} 
                storm={storm}
                isSelected={selectedStorm?.storm_id === storm.storm_id}
                onClick={() => setSelectedStorm(storm)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {filterLevel === 'all' ? '✅' : '🔍'}
            </div>
            <div className="empty-message">
              {filterLevel === 'all' 
                ? 'No Active Storms' 
                : `No ${filterLevel} level storms`}
            </div>
            <div className="empty-submessage">
              {filterLevel === 'all'
                ? 'All monitoring areas are currently clear'
                : 'Try adjusting the filter or check other alert levels'}
            </div>
          </div>
        )}
      </div>

      {/* Selected Storm Details */}
      {selectedStorm && (
        <div className="selected-storm-details">
          <div className="details-header">
            <h3>📍 {selectedStorm.storm_name} Details</h3>
            <button 
              onClick={() => setSelectedStorm(null)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
          
          <div className="details-content">
            <div className="detail-section">
              <h4>Current Status</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Storm ID:</span>
                  <span className="value">{selectedStorm.storm_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value">{selectedStorm.category}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Alert Level:</span>
                  <span className={`value alert-${selectedStorm.alert_level}`}>
                    {selectedStorm.alert_level.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Meteorological Data</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Wind Speed:</span>
                  <span className="value">
                    {selectedStorm.wind_speed_knots} kt ({selectedStorm.wind_speed_mph?.toFixed(0)} mph)
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Central Pressure:</span>
                  <span className="value">{selectedStorm.pressure_mb} mb</span>
                </div>
                <div className="detail-item">
                  <span className="label">Movement:</span>
                  <span className="value">
                    {selectedStorm.movement.direction_cardinal} at {selectedStorm.movement.speed_knots} kt
                  </span>
                </div>
              </div>
            </div>

            {selectedStorm.warnings && selectedStorm.warnings.length > 0 && (
              <div className="detail-section">
                <h4>⚠️ Active Warnings</h4>
                <div className="warnings-list">
                  {selectedStorm.warnings.map((warning, index) => (
                    <div key={index} className="warning-detail">
                      <span className="warning-type">{warning.type.replace('_', ' ').toUpperCase()}:</span>
                      <span className="warning-text">{warning.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CycloneDashboard;
