import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAlerts([
        { id: 1, type: 'cyclone', location: 'Bay of Bengal', severity: 'high', time: '2 hours ago' },
        { id: 2, type: 'pollution', location: 'New Delhi', severity: 'medium', time: '5 hours ago' },
        { id: 3, type: 'sea-level', location: 'Mumbai Coast', severity: 'low', time: '1 day ago' }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="threat-alert-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Global Threat <span className="highlight">Alert System</span>
          </h1>
          <p className="hero-subtitle">
            Real-time monitoring and alerts for environmental threats including cyclones, pollution, and sea level changes
          </p>
          <button className="cta-button">
            View Threat Map
            <span className="button-icon">→</span>
          </button>
        </div>
        <div className="hero-visual">
          <div className="floating-element element-1">🌪</div>
          <div className="floating-element element-2">🌊</div>
          <div className="floating-element element-3">🏭</div>
          <div className="globe-container">
            <div className="globe"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">🌪</div>
          <h3 className="stat-number">12</h3>
          <p className="stat-label">Active Cyclones</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <h3 className="stat-number">47</h3>
          <p className="stat-label">Pollution Alerts</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌊</div>
          <h3 className="stat-number">9</h3>
          <p className="stat-label">Sea Level Warnings</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <h3 className="stat-number">384</h3>
          <p className="stat-label">Monitoring Stations</p>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="alerts-section">
        <h2 className="section-title">Recent Threat Alerts</h2>
        <div className="alerts-container">
          {isLoading ? (
            <div className="loading-alerts">Loading alerts...</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.type} ${alert.severity}`}>
                <div className="alert-header">
                  <div className="alert-type">{alert.type}</div>
                  <div className={`severity-indicator ${alert.severity}`}>{alert.severity}</div>
                </div>
                <div className="alert-content">
                  <h3 className="alert-location">{alert.location}</h3>
                  <p className="alert-time">{alert.time}</p>
                </div>
                <div className="alert-actions">
                  <button className="details-button">View Details</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Monitoring Capabilities</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌪</div>
            <h3>Cyclone Tracking</h3>
            <p>Real-time monitoring of tropical storms and cyclones with predictive path modeling.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏭</div>
            <h3>Pollution Levels</h3>
            <p>Air and water quality monitoring with alert systems for dangerous pollution levels.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌊</div>
            <h3>Sea Level Changes</h3>
            <p>Coastal monitoring with alerts for abnormal sea level fluctuations and tsunami warnings.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Stay Informed About Environmental Threats</h2>
          <p>Subscribe to our alert system for real-time notifications</p>
          <div className="cta-buttons">
            <button className="primary-button">Create Account</button>
            <button className="secondary-button">View Demo</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;