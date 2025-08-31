/**
 * Geolocation Service for Cyclone Monitoring System
 * Provides location-based functionality for finding nearest monitoring stations
 */

class GeolocationService {
  constructor() {
    this.userLocation = null;
    this.watchId = null;
    this.isWatching = false;
  }

  /**
   * Get user's current position
   * @returns {Promise<{lat: number, lon: number}>}
   */
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Start watching user's position for continuous updates
   * @param {Function} callback - Called when position changes
   */
  startWatching(callback) {
    if (!navigator.geolocation || this.isWatching) {
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // 1 minute
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.userLocation = location;
        callback(location);
      },
      (error) => {
        console.warn('Geolocation watch error:', error.message);
      },
      options
    );

    this.isWatching = true;
  }

  /**
   * Stop watching user's position
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees 
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearest monitoring stations to user's location
   * @param {Object} stations - Dictionary of stations
   * @param {number} limit - Maximum number of stations to return
   * @returns {Array} Sorted array of nearest stations with distances
   */
  findNearestStations(stations, limit = 5) {
    if (!this.userLocation || !stations) {
      return [];
    }

    const stationsWithDistance = Object.entries(stations).map(([id, station]) => {
      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lon,
        station.lat,
        station.lon
      );

      return {
        id,
        ...station,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });

    // Sort by distance and return top results
    return stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  /**
   * Get user's approximate location info (city, country) using reverse geocoding
   * @returns {Promise<Object>} Location information
   */
  async getReverseGeocode() {
    if (!this.userLocation) {
      throw new Error('User location not available');
    }

    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.userLocation.lat}&longitude=${this.userLocation.lon}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      return {
        city: data.city || data.locality || 'Unknown',
        country: data.countryName || 'Unknown',
        region: data.principalSubdivision || '',
        countryCode: data.countryCode || ''
      };
    } catch (error) {
      console.warn('Reverse geocoding error:', error);
      return {
        city: 'Unknown',
        country: 'Unknown',
        region: '',
        countryCode: ''
      };
    }
  }

  /**
   * Check if geolocation is supported and available
   * @returns {boolean}
   */
  isSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Get cached user location
   * @returns {Object|null}
   */
  getCachedLocation() {
    return this.userLocation;
  }

  /**
   * Clear cached location data
   */
  clearLocation() {
    this.userLocation = null;
    this.stopWatching();
  }
}

// Create singleton instance
const geolocationService = new GeolocationService();

export default geolocationService;
