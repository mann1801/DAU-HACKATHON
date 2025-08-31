import React from 'react';
import './AQIIndicator.css';

const AQIIndicator = ({ aqi, location }) => {
  const getAQIInfo = (value) => {
    if (value <= 50) return { 
      level: 'Good', 
      color: '#00e400', 
      icon: '😊',
      message: 'Air quality is satisfactory for most people'
    };
    if (value <= 100) return { 
      level: 'Moderate', 
      color: '#ffff00', 
      icon: '😐',
      message: 'Air quality is acceptable for most people'
    };
    if (value <= 150) return { 
      level: 'Unhealthy for Sensitive Groups', 
      color: '#ff7e00', 
      icon: '😷',
      message: 'Sensitive individuals may experience health effects'
    };
    if (value <= 200) return { 
      level: 'Unhealthy', 
      color: '#ff0000', 
      icon: '😨',
      message: 'Everyone may experience health effects'
    };
    if (value <= 300) return { 
      level: 'Very Unhealthy', 
      color: '#8f3f97', 
      icon: '🤢',
      message: 'Health alert: everyone may experience serious health effects'
    };
    return { 
      level: 'Hazardous', 
      color: '#7e0023', 
      icon: '☠️',
      message: 'Emergency conditions: entire population affected'
    };
  };

  const aqiInfo = getAQIInfo(aqi);
  const percentage = Math.min((aqi / 300) * 100, 100);

  return (
    <div className="aqi-indicator">
      <div className="aqi-header">
        <h2>Air Quality Index</h2>
        <p className="location-name">{location}</p>
      </div>
      
      <div className="aqi-display">
        <div className="aqi-circle">
          <div 
            className="aqi-progress"
            style={{
              background: `conic-gradient(${aqiInfo.color} ${percentage}%, rgba(255,255,255,0.2) ${percentage}%)`
            }}
          >
            <div className="aqi-inner">
              <span className="aqi-icon">{aqiInfo.icon}</span>
              <span className="aqi-value">{Math.round(aqi)}</span>
              <span className="aqi-label">AQI</span>
            </div>
          </div>
        </div>
        
        <div className="aqi-info">
          <div className="aqi-level" style={{ color: aqiInfo.color }}>
            {aqiInfo.level}
          </div>
          <p className="aqi-message">{aqiInfo.message}</p>
        </div>
      </div>
      
      <div className="aqi-scale">
        <div className="scale-item good">
          <span className="scale-range">0-50</span>
          <span className="scale-label">Good</span>
        </div>
        <div className="scale-item moderate">
          <span className="scale-range">51-100</span>
          <span className="scale-label">Moderate</span>
        </div>
        <div className="scale-item unhealthy-sensitive">
          <span className="scale-range">101-150</span>
          <span className="scale-label">Unhealthy for Sensitive</span>
        </div>
        <div className="scale-item unhealthy">
          <span className="scale-range">151-200</span>
          <span className="scale-label">Unhealthy</span>
        </div>
        <div className="scale-item very-unhealthy">
          <span className="scale-range">201-300</span>
          <span className="scale-label">Very Unhealthy</span>
        </div>
        <div className="scale-item hazardous">
          <span className="scale-range">301+</span>
          <span className="scale-label">Hazardous</span>
        </div>
      </div>
    </div>
  );
};

export default AQIIndicator;
