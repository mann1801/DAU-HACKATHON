import React from 'react';

const Pollution = () => {
  return (
    <div className="page-content">
      <div className="hero-section">
        <h1>🏭 Ocean Pollution Monitoring</h1>
        <p>Track water quality and pollution levels in real-time</p>
      </div>

      <div className="pollution-dashboard">
        <div className="pollution-stats">
          <div className="stat-card">
            <h3>🧪 Water Quality Index</h3>
            <div className="stat-value good">85/100</div>
            <p>Good quality water</p>
          </div>
          <div className="stat-card">
            <h3>🛢️ Oil Spills Detected</h3>
            <div className="stat-value warning">3</div>
            <p>Minor incidents this month</p>
          </div>
          <div className="stat-card">
            <h3>🗑️ Plastic Debris</h3>
            <div className="stat-value danger">High</div>
            <p>Above normal levels</p>
          </div>
          <div className="stat-card">
            <h3>⚗️ Chemical Pollutants</h3>
            <div className="stat-value good">Low</div>
            <p>Within safe limits</p>
          </div>
        </div>

        <div className="pollution-map">
          <h3>🗺️ Pollution Hotspots</h3>
          <div className="map-placeholder">
            <p>Interactive pollution map will be displayed here</p>
            <p>Showing real-time pollution data from monitoring stations</p>
          </div>
        </div>

        <div className="recent-alerts">
          <h3>🚨 Recent Pollution Alerts</h3>
          <div className="alert-list">
            <div className="alert-item warning">
              <span className="alert-time">2 hours ago</span>
              <span className="alert-message">Elevated plastic debris detected near Station NY001</span>
            </div>
            <div className="alert-item info">
              <span className="alert-time">6 hours ago</span>
              <span className="alert-message">Water quality improved at Station CA003</span>
            </div>
            <div className="alert-item danger">
              <span className="alert-time">1 day ago</span>
              <span className="alert-message">Oil spill reported near Gulf Coast Station TX002</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pollution;
