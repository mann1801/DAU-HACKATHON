import React, { useState, useEffect } from 'react';
import AlertCard from '../AlertCard';
import StormMap from '../StormMap';
import StationMonitor from '../StationMonitor';
import NotificationSystem from '../NotificationSystem';
import { dataService } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import './Cyclone.css';

// Mock data for development - replace with actual API calls
const mockStormData = [
  {
    storm_id: 'AL012025',
    storm_name: 'FRANKLIN',
    category: 'Category 3',
    alert_level: 'danger',
    emoji: '🚨',
    current_position: {
      lat: 25.5,
      lon: -75.0,
      timestamp: '2025-08-31T07:30:00Z'
    },
    wind_speed_knots: 105,
    wind_speed_mph: 121,
    pressure_mb: 960,
    movement: {
      speed_knots: 12,
      direction_cardinal: 'WNW'
    },
    nearest_station: {
      station_id: 'MIA',
      station_name: 'Miami',
      distance_km: 85.2
    },
    warnings: [
      {
        type: 'high_wind',
        message: 'Dangerous winds of 105 knots (121.0 mph)'
      },
      {
        type: 'proximity_warning',
        message: 'Storm is 85.2 km from Miami'
      }
    ]
  },
  {
    storm_id: 'AL022025',
    storm_name: 'GERT',
    category: 'Tropical Storm',
    alert_level: 'warning',
    emoji: '⚠️',
    current_position: {
      lat: 28.2,
      lon: -82.5,
      timestamp: '2025-08-31T07:30:00Z'
    },
    wind_speed_knots: 45,
    wind_speed_mph: 52,
    pressure_mb: 995,
    movement: {
      speed_knots: 8,
      direction_cardinal: 'N'
    },
    nearest_station: {
      station_id: 'TPA',
      station_name: 'Tampa',
      distance_km: 25.8
    },
    warnings: [
      {
        type: 'proximity_warning',
        message: 'Storm is 25.8 km from Tampa'
      }
    ]
  }
];

const mockStations = {
  // United States
  'MIA': { name: 'Miami', lat: 25.7617, lon: -80.1918, status: 'danger', country: 'USA' },
  'TPA': { name: 'Tampa', lat: 27.9506, lon: -82.4572, status: 'warning', country: 'USA' },
  'JAX': { name: 'Jacksonville', lat: 30.3322, lon: -81.6557, status: 'active', country: 'USA' },
  'MSY': { name: 'New Orleans', lat: 29.9511, lon: -90.0715, status: 'active', country: 'USA' },
  'HOU': { name: 'Houston', lat: 29.7604, lon: -95.3698, status: 'active', country: 'USA' },
  'CHS': { name: 'Charleston', lat: 32.7765, lon: -79.9311, status: 'active', country: 'USA' },
  'ORF': { name: 'Norfolk', lat: 36.8508, lon: -76.2859, status: 'active', country: 'USA' },
  'NYC': { name: 'New York', lat: 40.7128, lon: -74.0060, status: 'active', country: 'USA' },
  'BOS': { name: 'Boston', lat: 42.3601, lon: -71.0589, status: 'active', country: 'USA' },
  'SJU': { name: 'San Juan', lat: 18.4655, lon: -66.1057, status: 'active', country: 'USA' }
};

const Cyclone = () => {
  const [storms, setStorms] = useState([]);
  const [stations, setStations] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Fetch data from API service
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use the data service (mock in development, real API in production)
        const [stormsData, stationsData] = await Promise.all([
          dataService.getActiveStorms(),
          dataService.getStations()
        ]);
        
        setStorms(stormsData);
        setStations(stationsData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching storm data:', error);
        // Fallback to mock data if API fails
        setStorms(mockStormData);
        setStations(mockStations);
        setLastUpdate(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling for real-time updates (every 5 minutes)
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [stormsData, stationsData] = await Promise.all([
        dataService.getActiveStorms(),
        dataService.getStations()
      ]);
      
      setStorms(stormsData);
      setStations(stationsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">🌪️ Cyclone Monitoring Dashboard</h1>
          <p className="dashboard-subtitle">
            Real-time tropical storm tracking and alerts powered by NOAA data
          </p>
          {lastUpdate && (
            <p className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="dashboard-content">
          <NotificationSystem storms={storms} lastUpdate={lastUpdate} />
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              Fetching latest storm data...
            </div>
          ) : (
            <>
              {/* Active Storm Alerts */}
              <section className="alerts-section">
                <h2 className="section-title">
                  🚨 Active Storm Alerts ({storms.length})
                </h2>
                {storms.length > 0 ? (
                  <div className="alerts-grid">
                    {storms.map((storm) => (
                      <AlertCard key={storm.storm_id} storm={storm} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <div className="empty-state-message">No Active Storms</div>
                    <div className="empty-state-submessage">
                      All monitoring areas are currently clear of tropical cyclones
                    </div>
                  </div>
                )}
              </section>

              {/* Interactive Storm Map */}
              <section className="map-section">
                <h2 className="section-title">
                  🗺️ Storm Tracking Map
                </h2>
                <div className="map-container">
                  <StormMap storms={storms} stations={stations} />
                </div>
              </section>

              {/* Station Monitoring */}
              <section className="stations-section">
                <h2 className="section-title">
                  📡 Monitoring Stations
                </h2>
                <StationMonitor stations={stations} storms={storms} />
              </section>

              {/* Refresh Button */}
              <div className="refresh-section">
                <button 
                  className="refresh-button"
                  onClick={refreshData}
                  disabled={loading}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cyclone-dashboard">
        <div className="current-storms">
          <h3>🌀 Active Storm Systems</h3>
          <div className="storm-list">
            <div className="storm-card active">
              <div className="storm-header">
                <h4>Hurricane Maria</h4>
                <span className="storm-category cat-3">Category 3</span>
              </div>
              <div className="storm-details">
                <p><strong>Location:</strong> 25.4°N, 67.8°W</p>
                <p><strong>Max Winds:</strong> 115 mph</p>
                <p><strong>Movement:</strong> NW at 12 mph</p>
                <p><strong>Pressure:</strong> 960 mb</p>
              </div>
            </div>
            
            <div className="storm-card monitoring">
              <div className="storm-header">
                <h4>Tropical Storm Alex</h4>
                <span className="storm-category tropical">Tropical Storm</span>
              </div>
              <div className="storm-details">
                <p><strong>Location:</strong> 18.2°N, 45.1°W</p>
                <p><strong>Max Winds:</strong> 65 mph</p>
                <p><strong>Movement:</strong> W at 8 mph</p>
                <p><strong>Pressure:</strong> 995 mb</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cyclone-map">
          <h3>🗺️ Storm Tracking Map</h3>
          <div className="map-placeholder">
            <p>Interactive storm tracking map will be displayed here</p>
            <p>Showing storm paths, intensity, and projected trajectories</p>
          </div>
        </div>

        <div className="cyclone-alerts">
          <h3>⚠️ Weather Alerts</h3>
          <div className="alert-list">
            <div className="alert-item danger">
              <span className="alert-time">30 minutes ago</span>
              <span className="alert-message">Hurricane Warning issued for Eastern Seaboard</span>
            </div>
            <div className="alert-item warning">
              <span className="alert-time">2 hours ago</span>
              <span className="alert-message">Tropical Storm Watch for Gulf Coast region</span>
            </div>
            <div className="alert-item info">
              <span className="alert-time">4 hours ago</span>
              <span className="alert-message">Storm surge advisory lifted for Florida Keys</span>
            </div>
          </div>
        </div>

        <div className="forecast-section">
          <h3>📅 5-Day Forecast</h3>
          <div className="forecast-grid">
            <div className="forecast-day">
              <h4>Today</h4>
              <div className="weather-icon">⛈️</div>
              <p>Severe storms</p>
            </div>
            <div className="forecast-day">
              <h4>Tomorrow</h4>
              <div className="weather-icon">🌧️</div>
              <p>Heavy rain</p>
            </div>
            <div className="forecast-day">
              <h4>Day 3</h4>
              <div className="weather-icon">⛅</div>
              <p>Partly cloudy</p>
            </div>
            <div className="forecast-day">
              <h4>Day 4</h4>
              <div className="weather-icon">☀️</div>
              <p>Sunny</p>
            </div>
            <div className="forecast-day">
              <h4>Day 5</h4>
              <div className="weather-icon">🌤️</div>
              <p>Mostly sunny</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cyclone;
