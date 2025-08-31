import React, { useState, useEffect } from 'react';

const NotificationSystem = ({ storms, lastUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!storms || storms.length === 0) return;

    const newNotifications = [];
    const now = new Date();

    storms.forEach(storm => {
      // High priority notifications for dangerous storms
      if (storm.alert_level === 'danger' || storm.alert_level === 'critical') {
        newNotifications.push({
          id: `storm-${storm.storm_id}`,
          type: 'danger',
          title: `${storm.storm_name} - ${storm.category}`,
          message: `High risk storm ${storm.nearest_station.distance_km.toFixed(1)}km from ${storm.nearest_station.station_name}`,
          timestamp: now,
          icon: '🚨'
        });
      }

      // Wind speed warnings
      if (storm.wind_speed_knots > 100) {
        newNotifications.push({
          id: `wind-${storm.storm_id}`,
          type: 'warning',
          title: 'Extreme Wind Alert',
          message: `${storm.storm_name}: ${storm.wind_speed_knots} knots (${storm.wind_speed_mph} mph)`,
          timestamp: now,
          icon: '💨'
        });
      }

      // Proximity warnings
      if (storm.nearest_station.distance_km < 100) {
        newNotifications.push({
          id: `proximity-${storm.storm_id}`,
          type: 'warning',
          title: 'Station Proximity Alert',
          message: `${storm.storm_name} approaching ${storm.nearest_station.station_name}`,
          timestamp: now,
          icon: '📍'
        });
      }
    });

    setNotifications(newNotifications);
  }, [storms]);

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

export default NotificationSystem;
