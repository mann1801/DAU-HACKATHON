import React, { useState, useEffect } from 'react';

const SeaLevelNotificationSystem = ({ waterLevelData, selectedStation, lastUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!waterLevelData || waterLevelData.length === 0) return;

    const newNotifications = [];
    const now = new Date();
    const currentLevel = waterLevelData[waterLevelData.length - 1]?.waterLevel;
    
    if (!currentLevel) return;

    // Get station info
    const getStationName = (stationId) => {
      const stations = {
        '8518750': 'The Battery, NY',
        '8516945': 'Kings Point, NY',
        '8510560': 'Montauk, NY',
        '8461490': 'New London, CT',
        '8443970': 'Boston, MA',
        '8418150': 'Eastport, ME'
      };
      return stations[stationId] || 'Unknown Station';
    };

    const stationName = getStationName(selectedStation);

    // Critical flood warnings (>8ft)
    if (currentLevel >= 8.0) {
      newNotifications.push({
        id: `flood-critical-${selectedStation}`,
        type: 'danger',
        title: `Critical Flood Warning - ${stationName}`,
        message: `Extreme water level: ${currentLevel.toFixed(2)}ft. Immediate evacuation may be required.`,
        timestamp: now,
        icon: '🚨'
      });
    }
    // High water warnings (6-8ft)
    else if (currentLevel >= 6.0) {
      newNotifications.push({
        id: `flood-warning-${selectedStation}`,
        type: 'warning',
        title: `High Water Level Warning`,
        message: `Elevated water level at ${stationName}: ${currentLevel.toFixed(2)}ft`,
        timestamp: now,
        icon: '⚠️'
      });
    }
    // Low water alerts (<2ft)
    else if (currentLevel <= 2.0) {
      newNotifications.push({
        id: `low-water-${selectedStation}`,
        type: 'info',
        title: 'Low Water Level Notice',
        message: `Unusually low water at ${stationName}: ${currentLevel.toFixed(2)}ft`,
        timestamp: now,
        icon: '📉'
      });
    }

    // Rapid change detection (if we have enough data)
    if (waterLevelData.length >= 6) {
      const recent = waterLevelData.slice(-6);
      const change = recent[recent.length - 1].waterLevel - recent[0].waterLevel;
      
      if (Math.abs(change) >= 2.0) {
        newNotifications.push({
          id: `rapid-change-${selectedStation}`,
          type: 'warning',
          title: 'Rapid Water Level Change',
          message: `${change > 0 ? 'Rise' : 'Drop'} of ${Math.abs(change).toFixed(2)}ft in 3 hours at ${stationName}`,
          timestamp: now,
          icon: '📈'
        });
      }
    }

    // Tidal predictions
    const nextHigh = currentLevel + 1.5; // Simplified prediction
    if (nextHigh >= 7.0) {
      newNotifications.push({
        id: `tidal-prediction-${selectedStation}`,
        type: 'warning',
        title: 'High Tide Flood Risk',
        message: `Predicted high tide of ${nextHigh.toFixed(2)}ft in 4 hours at ${stationName}`,
        timestamp: now,
        icon: '🌊'
      });
    }

    setNotifications(newNotifications);
  }, [waterLevelData, selectedStation]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'danger': return 'notification-danger';
      case 'warning': return 'notification-warning';
      case 'info': return 'notification-info';
      default: return 'notification-info';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-system">
      <div className="notification-toggle">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="notification-button"
        >
          🔔 Alerts ({notifications.length})
        </button>
      </div>

      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h4>🚨 Active Alerts</h4>
            <button onClick={clearNotifications} className="clear-all-btn">
              Clear All
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${getNotificationClass(notification.type)}`}
              >
                <div className="notification-icon">
                  {notification.icon}
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeaLevelNotificationSystem;
