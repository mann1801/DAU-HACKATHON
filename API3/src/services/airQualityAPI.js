const API_BASE_URL = 'http://localhost:8000';

// Global monitoring stations for air quality
const MONITORING_STATIONS = [
  // Major US Cities
  { id: 'US001', name: 'New York City', latitude: 40.7128, longitude: -74.0060, country: 'United States', city: 'New York' },
  { id: 'US002', name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, country: 'United States', city: 'Los Angeles' },
  { id: 'US003', name: 'Chicago', latitude: 41.8781, longitude: -87.6298, country: 'United States', city: 'Chicago' },
  { id: 'US004', name: 'Houston', latitude: 29.7604, longitude: -95.3698, country: 'United States', city: 'Houston' },
  { id: 'US005', name: 'Phoenix', latitude: 33.4484, longitude: -112.0740, country: 'United States', city: 'Phoenix' },
  { id: 'US006', name: 'Philadelphia', latitude: 39.9526, longitude: -75.1652, country: 'United States', city: 'Philadelphia' },
  { id: 'US007', name: 'San Antonio', latitude: 29.4241, longitude: -98.4936, country: 'United States', city: 'San Antonio' },
  { id: 'US008', name: 'San Diego', latitude: 32.7157, longitude: -117.1611, country: 'United States', city: 'San Diego' },
  { id: 'US009', name: 'Dallas', latitude: 32.7767, longitude: -96.7970, country: 'United States', city: 'Dallas' },
  { id: 'US010', name: 'San Jose', latitude: 37.3382, longitude: -121.8863, country: 'United States', city: 'San Jose' },

  // Major Indian Cities
  { id: 'IN001', name: 'Delhi', latitude: 28.7041, longitude: 77.1025, country: 'India', city: 'Delhi' },
  { id: 'IN002', name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country: 'India', city: 'Mumbai' },
  { id: 'IN003', name: 'Bangalore', latitude: 12.9716, longitude: 77.5946, country: 'India', city: 'Bangalore' },
  { id: 'IN004', name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, country: 'India', city: 'Kolkata' },
  { id: 'IN005', name: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India', city: 'Chennai' },
  { id: 'IN006', name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, country: 'India', city: 'Hyderabad' },
  { id: 'IN007', name: 'Pune', latitude: 18.5204, longitude: 73.8567, country: 'India', city: 'Pune' },
  { id: 'IN008', name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, country: 'India', city: 'Ahmedabad' },

  // Major Chinese Cities
  { id: 'CN001', name: 'Beijing', latitude: 39.9042, longitude: 116.4074, country: 'China', city: 'Beijing' },
  { id: 'CN002', name: 'Shanghai', latitude: 31.2304, longitude: 121.4737, country: 'China', city: 'Shanghai' },
  { id: 'CN003', name: 'Guangzhou', latitude: 23.1291, longitude: 113.2644, country: 'China', city: 'Guangzhou' },
  { id: 'CN004', name: 'Shenzhen', latitude: 22.3193, longitude: 114.1694, country: 'China', city: 'Shenzhen' },

  // European Cities
  { id: 'EU001', name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', city: 'London' },
  { id: 'EU002', name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', city: 'Paris' },
  { id: 'EU003', name: 'Berlin', latitude: 52.5200, longitude: 13.4050, country: 'Germany', city: 'Berlin' },
  { id: 'EU004', name: 'Madrid', latitude: 40.4168, longitude: -3.7038, country: 'Spain', city: 'Madrid' },
  { id: 'EU005', name: 'Rome', latitude: 41.9028, longitude: 12.4964, country: 'Italy', city: 'Rome' },

  // Other Major Cities
  { id: 'JP001', name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', city: 'Tokyo' },
  { id: 'BR001', name: 'São Paulo', latitude: -23.5505, longitude: -46.6333, country: 'Brazil', city: 'São Paulo' },
  { id: 'AU001', name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', city: 'Sydney' },
  { id: 'CA001', name: 'Toronto', latitude: 43.6532, longitude: -79.3832, country: 'Canada', city: 'Toronto' },
  { id: 'MX001', name: 'Mexico City', latitude: 19.4326, longitude: -99.1332, country: 'Mexico', city: 'Mexico City' }
];

class AirQualityAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getCurrentAirQuality(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/air-quality/current?latitude=${latitude}&longitude=${longitude}`
      );
      if (!response.ok) throw new Error('API request failed');
      return await response.json();
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      return this.getMockCurrentData(latitude, longitude);
    }
  }

  async getHourlyAirQuality(latitude, longitude, pastDays = 2) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/air-quality/hourly?latitude=${latitude}&longitude=${longitude}&past_days=${pastDays}`
      );
      if (!response.ok) throw new Error('API request failed');
      return await response.json();
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
      return this.getMockHourlyData(latitude, longitude);
    }
  }

  getMockCurrentData(latitude, longitude) {
    const station = this.findNearestStation(latitude, longitude);
    const baseValues = this.getBaseValuesForLocation(station);
    
    return {
      status: 'success',
      data: {
        time: new Date().toISOString(),
        pm2_5: baseValues.pm2_5 + (Math.random() - 0.5) * 5,
        pm10: baseValues.pm10 + (Math.random() - 0.5) * 8,
        carbon_monoxide: baseValues.co + (Math.random() - 0.5) * 0.2,
        nitrogen_dioxide: baseValues.no2 + (Math.random() - 0.5) * 10,
        sulphur_dioxide: baseValues.so2 + (Math.random() - 0.5) * 5,
        ozone: baseValues.o3 + (Math.random() - 0.5) * 20,
        uv_index: Math.max(0, 3 + (Math.random() - 0.5) * 6),
        european_aqi: baseValues.aqi + Math.floor((Math.random() - 0.5) * 20)
      }
    };
  }

  getMockHourlyData(latitude, longitude) {
    const station = this.findNearestStation(latitude, longitude);
    const baseValues = this.getBaseValuesForLocation(station);
    const data = [];
    const now = new Date();

    for (let i = 0; i < 48; i++) {
      const time = new Date(now.getTime() - (47 - i) * 60 * 60 * 1000);
      const hourFactor = Math.sin((i % 24) * Math.PI / 12); // Daily cycle
      
      data.push({
        time: time.toISOString(),
        pm2_5: Math.max(0, baseValues.pm2_5 + hourFactor * 5 + (Math.random() - 0.5) * 3),
        pm10: Math.max(0, baseValues.pm10 + hourFactor * 8 + (Math.random() - 0.5) * 5),
        carbon_monoxide: Math.max(0, baseValues.co + hourFactor * 0.1 + (Math.random() - 0.5) * 0.1),
        nitrogen_dioxide: Math.max(0, baseValues.no2 + hourFactor * 8 + (Math.random() - 0.5) * 5),
        sulphur_dioxide: Math.max(0, baseValues.so2 + hourFactor * 3 + (Math.random() - 0.5) * 2),
        ozone: Math.max(0, baseValues.o3 + hourFactor * 15 + (Math.random() - 0.5) * 10),
        uv_index: Math.max(0, 3 + Math.sin((i % 24) * Math.PI / 12) * 5),
        european_aqi: Math.max(0, Math.min(500, baseValues.aqi + hourFactor * 15 + (Math.random() - 0.5) * 10))
      });
    }

    return {
      status: 'success',
      data: data,
      metadata: {
        latitude,
        longitude,
        count: data.length,
        station: station.name
      }
    };
  }

  findNearestStation(latitude, longitude) {
    let nearest = MONITORING_STATIONS[0];
    let minDistance = this.calculateDistance(latitude, longitude, nearest.latitude, nearest.longitude);

    for (const station of MONITORING_STATIONS) {
      const distance = this.calculateDistance(latitude, longitude, station.latitude, station.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = station;
      }
    }

    return { ...nearest, distance: minDistance };
  }

  getBaseValuesForLocation(station) {
    // Different pollution levels based on region/country
    const pollutionProfiles = {
      'India': { pm2_5: 45, pm10: 75, co: 1.2, no2: 35, so2: 15, o3: 45, aqi: 120 },
      'China': { pm2_5: 35, pm10: 60, co: 1.0, no2: 40, so2: 20, o3: 50, aqi: 110 },
      'United States': { pm2_5: 12, pm10: 20, co: 0.4, no2: 20, so2: 5, o3: 65, aqi: 45 },
      'United Kingdom': { pm2_5: 15, pm10: 25, co: 0.5, no2: 25, so2: 8, o3: 55, aqi: 50 },
      'France': { pm2_5: 14, pm10: 22, co: 0.4, no2: 22, so2: 6, o3: 60, aqi: 48 },
      'Germany': { pm2_5: 13, pm10: 21, co: 0.4, no2: 24, so2: 7, o3: 58, aqi: 47 },
      'Spain': { pm2_5: 16, pm10: 28, co: 0.5, no2: 26, so2: 9, o3: 62, aqi: 52 },
      'Italy': { pm2_5: 18, pm10: 30, co: 0.6, no2: 28, so2: 10, o3: 58, aqi: 55 },
      'Japan': { pm2_5: 11, pm10: 18, co: 0.3, no2: 18, so2: 4, o3: 52, aqi: 42 },
      'Brazil': { pm2_5: 20, pm10: 35, co: 0.8, no2: 30, so2: 12, o3: 48, aqi: 65 },
      'Australia': { pm2_5: 8, pm10: 15, co: 0.3, no2: 15, so2: 3, o3: 55, aqi: 35 },
      'Canada': { pm2_5: 10, pm10: 17, co: 0.3, no2: 17, so2: 4, o3: 58, aqi: 38 },
      'Mexico': { pm2_5: 25, pm10: 45, co: 1.1, no2: 32, so2: 14, o3: 42, aqi: 85 }
    };

    return pollutionProfiles[station.country] || pollutionProfiles['United States'];
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  getMonitoringStations() {
    return MONITORING_STATIONS;
  }
}

export default AirQualityAPI;
export { MONITORING_STATIONS };
