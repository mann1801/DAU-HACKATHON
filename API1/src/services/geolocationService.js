// Geolocation service for live location features
class GeolocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.callbacks = [];
  }

  // Check if geolocation is supported
  isSupported() {
    return 'geolocation' in navigator;
  }

  // Get current position
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          resolve(this.currentPosition);
        },
        (error) => {
          let errorMessage = 'Location access denied';
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
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
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

  // Find nearest stations to current location
  findNearestStations(stations, userLat, userLon, limit = 5) {
    const stationsWithDistance = Object.entries(stations).map(([id, station]) => ({
      id,
      ...station,
      distance: this.calculateDistance(userLat, userLon, station.lat, station.lon)
    }));

    return stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  // Sort stations by distance from user location
  sortStationsByDistance(stations, userLat, userLon) {
    const stationsArray = Object.entries(stations);
    return stationsArray
      .map(([id, station]) => [
        id,
        {
          ...station,
          distance: this.calculateDistance(userLat, userLon, station.lat, station.lon).toFixed(1)
        }
      ])
      .sort(([, a], [, b]) => parseFloat(a.distance) - parseFloat(b.distance))
      .reduce((obj, [id, station]) => {
        obj[id] = station;
        return obj;
      }, {});
  }

  // Reverse geocoding (simplified - in production use a real API)
  async reverseGeocode(lat, lon) {
    // Mock implementation - in production, use Google Maps API or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple approximation based on coordinates
        let city = 'Unknown City';
        let country = 'Unknown Country';

        // US coordinates
        if (lat >= 24 && lat <= 49 && lon >= -125 && lon <= -66) {
          country = 'United States';
          if (lat >= 25 && lat <= 31 && lon >= -85 && lon <= -80) city = 'Florida';
          else if (lat >= 40 && lat <= 45 && lon >= -75 && lon <= -70) city = 'New York';
          else if (lat >= 32 && lat <= 37 && lon >= -120 && lon <= -114) city = 'California';
        }
        // India coordinates
        else if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) {
          country = 'India';
          if (lat >= 18 && lat <= 20 && lon >= 72 && lon <= 73) city = 'Mumbai';
          else if (lat >= 12 && lat <= 14 && lon >= 80 && lon <= 81) city = 'Chennai';
        }

        resolve({ city, country });
      }, 500);
    });
  }
}

export const geolocationService = new GeolocationService();
