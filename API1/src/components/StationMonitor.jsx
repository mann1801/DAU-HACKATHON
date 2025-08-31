import React, { useState } from 'react';
import StationFilter from './StationFilter';

const StationMonitor = ({ stations, storms }) => {
  const [filteredStations, setFilteredStations] = useState(stations);
  // Calculate station threat levels based on nearby storms
  const calculateStationThreat = (stationId, station) => {
    let maxThreat = 'active';
    let nearestStorm = null;
    let minDistance = Infinity;

    storms.forEach(storm => {
      if (storm.nearest_station.station_id === stationId) {
        const distance = storm.nearest_station.distance_km;
        if (distance < minDistance) {
          minDistance = distance;
          nearestStorm = storm;
        }

        // Determine threat level based on storm category and distance
        if (storm.category.includes('Category') && distance < 100) {
          maxThreat = 'danger';
        } else if (storm.category.includes('Tropical Storm') && distance < 50) {
          maxThreat = 'warning';
        } else if (distance < 200) {
          maxThreat = 'warning';
        }
      }
    });

    return { threat: maxThreat, nearestStorm, distance: minDistance };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'danger': return '🔴';
      case 'warning': return '🟡';
      default: return '🟢';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'danger': return 'High Risk';
      case 'warning': return 'Moderate Risk';
      default: return 'Normal';
    }
  };

  return (
    <div className="station-monitor">
      <StationFilter 
        stations={stations} 
        storms={storms}
        onFilterChange={setFilteredStations}
      />
      
      <div className="stations-grid">
        {Object.entries(filteredStations).map(([stationId, station]) => {
        const threatInfo = calculateStationThreat(stationId, station);
        const finalStatus = station.status || threatInfo.threat;

        return (
          <div key={stationId} className="station-card">
            <div className="station-header">
              <div className="station-name">{station.name}</div>
              <div className="station-id">({stationId})</div>
            </div>
            
            <div className="station-coords">
              {station.lat.toFixed(2)}°{station.lat >= 0 ? 'N' : 'S'}, {Math.abs(station.lon).toFixed(2)}°{station.lon >= 0 ? 'E' : 'W'}
            </div>
            
            {station.country && (
              <div className="station-country">
                📍 {station.country}
              </div>
            )}
            
            {station.distance && (
              <div className="station-distance">
                📏 {station.distance} km away
              </div>
            )}
            
            <div className="station-status">
              <div className={`status-indicator ${finalStatus}`}></div>
              <span className="status-text">
                {getStatusIcon(finalStatus)} {getStatusText(finalStatus)}
              </span>
            </div>

            {threatInfo.nearestStorm && threatInfo.distance < 500 && (
              <div className="threat-info">
                <div className="threat-title">⚠️ Nearby Storm:</div>
                <div className="threat-details">
                  <div className="storm-name-small">
                    {threatInfo.nearestStorm.storm_name}
                  </div>
                  <div className="storm-distance">
                    {threatInfo.distance.toFixed(1)} km away
                  </div>
                  <div className="storm-category-small">
                    {threatInfo.nearestStorm.category}
                  </div>
                </div>
              </div>
            )}

            <div className="station-metrics">
              <div className="metric">
                <span className="metric-label">Last Contact:</span>
                <span className="metric-value">Active</span>
              </div>
              <div className="metric">
                <span className="metric-label">Data Quality:</span>
                <span className="metric-value">Good</span>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default StationMonitor;
