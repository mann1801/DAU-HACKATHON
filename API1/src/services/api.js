// API service for cyclone monitoring data
// Mock data service that can be easily switched to real API endpoints

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
  'KAK': { name: 'Kakinada', lat: 16.9891, lon: 82.2475, status: 'active', country: 'India' }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dataService = {
  async getActiveStorms() {
    await delay(500); // Simulate network delay
    return mockStormData;
  },

  async getStations() {
    await delay(300);
    return mockStations;
  },

  async getSystemStatus() {
    await delay(200);
    return {
      operational: true,
      last_update: new Date().toISOString(),
      active_storms: mockStormData.length,
      monitoring_stations: Object.keys(mockStations).length,
      data_sources: ['NOAA', 'NHC', 'JTWC']
    };
  }
};
