import React, { useState, useEffect } from 'react';
import CycloneDashboard from './components/CycloneDashboard';
import StormMap from './components/StormMap';
import StationMonitor from './components/StationMonitor';
import AlertCard from './components/AlertCard';
import { dataService } from './services/api';
import './App.css';

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
  'SJU': { name: 'San Juan', lat: 18.4655, lon: -66.1057, status: 'active', country: 'USA' },
  
  // India
  'MUM': { name: 'Mumbai', lat: 19.0760, lon: 72.8777, status: 'active', country: 'India' },
  'CHE': { name: 'Chennai', lat: 13.0827, lon: 80.2707, status: 'active', country: 'India' },
  'KOL': { name: 'Kolkata', lat: 22.5726, lon: 88.3639, status: 'active', country: 'India' },
  'COK': { name: 'Kochi', lat: 9.9312, lon: 76.2673, status: 'active', country: 'India' },
  'VIS': { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, status: 'active', country: 'India' },
  'GOA': { name: 'Goa', lat: 15.2993, lon: 74.1240, status: 'active', country: 'India' },
  'PBL': { name: 'Port Blair', lat: 11.6234, lon: 92.7265, status: 'active', country: 'India' },
  'KAN': { name: 'Kandla', lat: 23.0333, lon: 70.2167, status: 'active', country: 'India' },
  'TUT': { name: 'Tuticorin', lat: 8.8047, lon: 78.1348, status: 'active', country: 'India' },
  'PAR': { name: 'Paradip', lat: 20.2648, lon: 86.6109, status: 'active', country: 'India' },
  'MAN': { name: 'Mangalore', lat: 12.9141, lon: 74.8560, status: 'active', country: 'India' },
  'KAK': { name: 'Kakinada', lat: 16.9891, lon: 82.2475, status: 'active', country: 'India' },
  
  // China
  'SHA': { name: 'Shanghai', lat: 31.2304, lon: 121.4737, status: 'active', country: 'China' },
  'HKG': { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, status: 'active', country: 'China' },
  'GUA': { name: 'Guangzhou', lat: 23.1291, lon: 113.2644, status: 'active', country: 'China' },
  'SHE': { name: 'Shenzhen', lat: 22.5431, lon: 114.0579, status: 'active', country: 'China' },
  'TIA': { name: 'Tianjin', lat: 39.3434, lon: 117.3616, status: 'active', country: 'China' },
  'DAL': { name: 'Dalian', lat: 38.9140, lon: 121.6147, status: 'active', country: 'China' },
  'QIN': { name: 'Qingdao', lat: 36.0986, lon: 120.3719, status: 'active', country: 'China' },
  'XIA': { name: 'Xiamen', lat: 24.4798, lon: 118.0819, status: 'active', country: 'China' },
  
  // Japan
  'TOK': { name: 'Tokyo', lat: 35.6762, lon: 139.6503, status: 'active', country: 'Japan' },
  'OSA': { name: 'Osaka', lat: 34.6937, lon: 135.5023, status: 'active', country: 'Japan' },
  'YOK': { name: 'Yokohama', lat: 35.4437, lon: 139.6380, status: 'active', country: 'Japan' },
  'KOB': { name: 'Kobe', lat: 34.6901, lon: 135.1956, status: 'active', country: 'Japan' },
  'NAG': { name: 'Nagoya', lat: 35.1815, lon: 136.9066, status: 'active', country: 'Japan' },
  'FUK': { name: 'Fukuoka', lat: 33.5904, lon: 130.4017, status: 'active', country: 'Japan' },
  
  // Southeast Asia
  'SIN': { name: 'Singapore', lat: 1.3521, lon: 103.8198, status: 'active', country: 'Singapore' },
  'BAN': { name: 'Bangkok', lat: 13.7563, lon: 100.5018, status: 'active', country: 'Thailand' },
  'MNL': { name: 'Manila', lat: 14.5995, lon: 120.9842, status: 'active', country: 'Philippines' },
  'JAK': { name: 'Jakarta', lat: -6.2088, lon: 106.8456, status: 'active', country: 'Indonesia' },
  'KUL': { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, status: 'active', country: 'Malaysia' },
  'HAN': { name: 'Hanoi', lat: 21.0285, lon: 105.8542, status: 'active', country: 'Vietnam' },
  'HCM': { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, status: 'active', country: 'Vietnam' },
  'CEB': { name: 'Cebu', lat: 10.3157, lon: 123.8854, status: 'active', country: 'Philippines' },
  
  // Europe
  'LON': { name: 'London', lat: 51.5074, lon: -0.1278, status: 'active', country: 'UK' },
  'AMS': { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, status: 'active', country: 'Netherlands' },
  'HAM': { name: 'Hamburg', lat: 53.5511, lon: 9.9937, status: 'active', country: 'Germany' },
  'MAR': { name: 'Marseille', lat: 43.2965, lon: 5.3698, status: 'active', country: 'France' },
  'BAR': { name: 'Barcelona', lat: 41.3851, lon: 2.1734, status: 'active', country: 'Spain' },
  'ROM': { name: 'Rome', lat: 41.9028, lon: 12.4964, status: 'active', country: 'Italy' },
  'ATH': { name: 'Athens', lat: 37.9838, lon: 23.7275, status: 'active', country: 'Greece' },
  'IST': { name: 'Istanbul', lat: 41.0082, lon: 28.9784, status: 'active', country: 'Turkey' },
  'LIS': { name: 'Lisbon', lat: 38.7223, lon: -9.1393, status: 'active', country: 'Portugal' },
  'STO': { name: 'Stockholm', lat: 59.3293, lon: 18.0686, status: 'active', country: 'Sweden' },
  
  // Middle East & Others
  'DUB': { name: 'Dubai', lat: 25.2048, lon: 55.2708, status: 'active', country: 'UAE' },
  'DOH': { name: 'Doha', lat: 25.2854, lon: 51.5310, status: 'active', country: 'Qatar' },
  'KUW': { name: 'Kuwait City', lat: 29.3759, lon: 47.9774, status: 'active', country: 'Kuwait' },
  'MUS': { name: 'Muscat', lat: 23.5859, lon: 58.4059, status: 'active', country: 'Oman' },
  'JED': { name: 'Jeddah', lat: 21.4858, lon: 39.1925, status: 'active', country: 'Saudi Arabia' },
  'DAM': { name: 'Dammam', lat: 26.4207, lon: 50.0888, status: 'active', country: 'Saudi Arabia' }
};

function App() {
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
    <div className="App">
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
    </div>
  );
}

export default App;
