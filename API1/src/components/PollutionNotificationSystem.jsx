import React, { useState, useEffect } from 'react';

const PollutionNotificationSystem = ({ pollutionData, selectedStation, lastUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!pollutionData || !pollutionData.current) return;

    const newNotifications = [];
    const now = new Date();
    const current = pollutionData.current;
    
    // Get station info
    const getStationName = (stationId) => {
      const stations = {
        'US001': 'New York City, NY',
        'US002': 'Los Angeles, CA',
        'US003': 'Chicago, IL',
        'IN001': 'Mumbai, India',
        'IN002': 'Delhi, India',
        'CN001': 'Beijing, China'
      };
      return stations[stationId] || 'Unknown Station';
    };

    const stationName = getStationName(selectedStation);

    // Critical AQI alerts (>300)
    if (current.aqi >= 300) {
      newNotifications.push({
        id: `aqi-critical-${selectedStation}`,
        type: 'danger',
        title: `Hazardous Air Quality - ${stationName}`,
        message: `Extremely dangerous AQI: ${current.aqi}. Avoid all outdoor activities.`,
        timestamp: now,
        icon: '🚨'
      });
    }
    // Unhealthy AQI (151-300)
    else if (current.aqi >= 151) {
      newNotifications.push({
        id: `aqi-unhealthy-${selectedStation}`,
        type: 'warning',
        title: `Unhealthy Air Quality`,
        message: `Poor air quality at ${stationName}: AQI ${current.aqi}. Limit outdoor exposure.`,
        timestamp: now,
        icon: '⚠️'
      });
    }
    // Moderate AQI (101-150)
    else if (current.aqi >= 101) {
      newNotifications.push({
        id: `aqi-moderate-${selectedStation}`,
        type: 'info',
        title: 'Moderate Air Quality',
        message: `Sensitive groups should limit outdoor activities. AQI: ${current.aqi}`,
        timestamp: now,
        icon: '🟡'
      });
    }

    // PM2.5 critical levels (>75 μg/m³)
    if (current.pm25 >= 75) {
      newNotifications.push({
        id: `pm25-critical-${selectedStation}`,
        type: 'danger',
        title: 'Critical PM2.5 Levels',
        message: `Dangerous PM2.5 at ${stationName}: ${current.pm25.toFixed(1)} μg/m³`,
        timestamp: now,
        icon: '💨'
      });
    }
    // PM2.5 high levels (35-75 μg/m³)
    else if (current.pm25 >= 35) {
      newNotifications.push({
        id: `pm25-high-${selectedStation}`,
        type: 'warning',
        title: 'Elevated PM2.5 Levels',
        message: `High PM2.5 at ${stationName}: ${current.pm25.toFixed(1)} μg/m³`,
        timestamp: now,
        icon: '🌫️'
      });
    }

    // Ozone alerts (>160 μg/m³)
    if (current.o3 >= 160) {
      newNotifications.push({
        id: `ozone-alert-${selectedStation}`,
        type: 'warning',
        title: 'High Ozone Alert',
        message: `Elevated ozone levels at ${stationName}: ${current.o3.toFixed(1)} μg/m³`,
        timestamp: now,
        icon: '☀️'
      });
    }

    // NO2 pollution alerts (>200 μg/m³)
    if (current.no2 >= 200) {
      newNotifications.push({
        id: `no2-alert-${selectedStation}`,
        type: 'warning',
        title: 'High NO₂ Pollution',
        message: `Traffic pollution spike at ${stationName}: ${current.no2.toFixed(1)} μg/m³`,
        timestamp: now,
        icon: '🚗'
      });
    }

    // SO2 industrial pollution (>350 μg/m³)
    if (current.so2 >= 350) {
      newNotifications.push({
        id: `so2-alert-${selectedStation}`,
        type: 'warning',
        title: 'Industrial Pollution Alert',
        message: `High SO₂ levels at ${stationName}: ${current.so2.toFixed(1)} μg/m³`,
        timestamp: now,
        icon: '🏭'
      });
    }

    setNotifications(newNotifications);
  }, [pollutionData, selectedStation]);

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

export default PollutionNotificationSystem;
