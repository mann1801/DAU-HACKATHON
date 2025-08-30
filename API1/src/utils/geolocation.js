// Geolocation utilities for finding nearest NOAA stations

export const stations = [
  // Northeast Coast
  { 
    id: '8410140', 
    name: 'Eastport, ME', 
    location: 'Maine',
    lat: 44.9030,
    lon: -66.9820
  },
  { 
    id: '8413320', 
    name: 'Bar Harbor, ME', 
    location: 'Maine',
    lat: 44.3914,
    lon: -68.2047
  },
  { 
    id: '8418150', 
    name: 'Portland, ME', 
    location: 'Maine',
    lat: 43.6567,
    lon: -70.2467
  },
  { 
    id: '8423898', 
    name: 'Fort Point, NH', 
    location: 'New Hampshire',
    lat: 43.0717,
    lon: -70.7342
  },
  { 
    id: '8443970', 
    name: 'Boston, MA', 
    location: 'Boston Harbor',
    lat: 42.3539,
    lon: -71.0522
  },
  { 
    id: '8447930', 
    name: 'Woods Hole, MA', 
    location: 'Massachusetts',
    lat: 41.5236,
    lon: -70.6719
  },
  { 
    id: '8452660', 
    name: 'Newport, RI', 
    location: 'Rhode Island',
    lat: 41.5043,
    lon: -71.3261
  },
  { 
    id: '8461490', 
    name: 'New London, CT', 
    location: 'Connecticut',
    lat: 41.3581,
    lon: -72.0889
  },
  { 
    id: '8465705', 
    name: 'New Haven, CT', 
    location: 'Connecticut',
    lat: 41.2833,
    lon: -72.9081
  },
  { 
    id: '8516945', 
    name: 'Kings Point, NY', 
    location: 'Long Island Sound',
    lat: 40.8100,
    lon: -73.7644
  },
  { 
    id: '8518750', 
    name: 'The Battery, NY', 
    location: 'New York Harbor',
    lat: 40.7002,
    lon: -74.0142
  },
  { 
    id: '8510560', 
    name: 'Montauk, NY', 
    location: 'Long Island',
    lat: 41.0483,
    lon: -71.9600
  },
  { 
    id: '8531680', 
    name: 'Sandy Hook, NJ', 
    location: 'New Jersey',
    lat: 40.4675,
    lon: -74.0089
  },
  { 
    id: '8534720', 
    name: 'Atlantic City, NJ', 
    location: 'New Jersey',
    lat: 39.3547,
    lon: -74.4181
  },
  
  // Mid-Atlantic
  { 
    id: '8545240', 
    name: 'Philadelphia, PA', 
    location: 'Pennsylvania',
    lat: 39.9333,
    lon: -75.1417
  },
  { 
    id: '8557380', 
    name: 'Lewes, DE', 
    location: 'Delaware',
    lat: 38.7817,
    lon: -75.1200
  },
  { 
    id: '8570283', 
    name: 'Ocean City, MD', 
    location: 'Maryland',
    lat: 38.3281,
    lon: -75.0919
  },
  { 
    id: '8594900', 
    name: 'Baltimore, MD', 
    location: 'Maryland',
    lat: 39.2667,
    lon: -76.5781
  },
  { 
    id: '8638610', 
    name: 'Sewells Point, VA', 
    location: 'Virginia',
    lat: 36.9467,
    lon: -76.3300
  },
  { 
    id: '8651370', 
    name: 'Duck, NC', 
    location: 'North Carolina',
    lat: 36.1833,
    lon: -75.7467
  },
  { 
    id: '8658120', 
    name: 'Wilmington, NC', 
    location: 'North Carolina',
    lat: 34.2275,
    lon: -77.9533
  },
  
  // Southeast Coast
  { 
    id: '8665530', 
    name: 'Charleston, SC', 
    location: 'South Carolina',
    lat: 32.7817,
    lon: -79.9250
  },
  { 
    id: '8670870', 
    name: 'Fort Pulaski, GA', 
    location: 'Georgia',
    lat: 32.0333,
    lon: -80.9017
  },
  { 
    id: '8720218', 
    name: 'Mayport, FL', 
    location: 'Florida',
    lat: 30.3983,
    lon: -81.4283
  },
  { 
    id: '8721604', 
    name: 'Daytona Beach, FL', 
    location: 'Florida',
    lat: 29.2283,
    lon: -80.9283
  },
  { 
    id: '8724580', 
    name: 'Key West, FL', 
    location: 'Florida',
    lat: 24.5550,
    lon: -81.8081
  },
  { 
    id: '8723214', 
    name: 'Virginia Key, FL', 
    location: 'Florida',
    lat: 25.7317,
    lon: -80.1617
  },
  
  // Gulf Coast
  { 
    id: '8726520', 
    name: 'St. Petersburg, FL', 
    location: 'Florida',
    lat: 27.7617,
    lon: -82.6267
  },
  { 
    id: '8729108', 
    name: 'Naples, FL', 
    location: 'Florida',
    lat: 26.1317,
    lon: -81.8067
  },
  { 
    id: '8760922', 
    name: 'Pensacola, FL', 
    location: 'Florida',
    lat: 30.4033,
    lon: -87.2117
  },
  { 
    id: '8761724', 
    name: 'Grand Isle, LA', 
    location: 'Louisiana',
    lat: 29.2633,
    lon: -89.9567
  },
  { 
    id: '8770570', 
    name: 'Sabine Pass North, TX', 
    location: 'Texas',
    lat: 29.7283,
    lon: -93.8700
  },
  { 
    id: '8771450', 
    name: 'Galveston Pier 21, TX', 
    location: 'Texas',
    lat: 29.3100,
    lon: -94.7933
  },
  { 
    id: '8775870', 
    name: 'Port Aransas, TX', 
    location: 'Texas',
    lat: 27.8400,
    lon: -97.0717
  },
  { 
    id: '8779770', 
    name: 'Padre Island, TX', 
    location: 'Texas',
    lat: 27.5883,
    lon: -97.2167
  },
  
  // West Coast
  { 
    id: '9410170', 
    name: 'San Diego, CA', 
    location: 'California',
    lat: 32.7142,
    lon: -117.1736
  },
  { 
    id: '9410660', 
    name: 'Los Angeles, CA', 
    location: 'California',
    lat: 33.7197,
    lon: -118.2728
  },
  { 
    id: '9411340', 
    name: 'Santa Barbara, CA', 
    location: 'California',
    lat: 34.4083,
    lon: -119.6883
  },
  { 
    id: '9414290', 
    name: 'San Francisco, CA', 
    location: 'California',
    lat: 37.8067,
    lon: -122.4650
  },
  { 
    id: '9418767', 
    name: 'North Spit, CA', 
    location: 'California',
    lat: 40.7667,
    lon: -124.2117
  },
  { 
    id: '9431647', 
    name: 'Port Orford, OR', 
    location: 'Oregon',
    lat: 42.7383,
    lon: -124.4983
  },
  { 
    id: '9435380', 
    name: 'South Beach, OR', 
    location: 'Oregon',
    lat: 44.6250,
    lon: -124.0433
  },
  { 
    id: '9440910', 
    name: 'Toke Point, WA', 
    location: 'Washington',
    lat: 46.7067,
    lon: -123.9667
  },
  { 
    id: '9447130', 
    name: 'Seattle, WA', 
    location: 'Washington',
    lat: 47.6033,
    lon: -122.3383
  },
  
  // Alaska
  { 
    id: '9450460', 
    name: 'Ketchikan, AK', 
    location: 'Alaska',
    lat: 55.3317,
    lon: -131.6267
  },
  { 
    id: '9452210', 
    name: 'Juneau, AK', 
    location: 'Alaska',
    lat: 58.2983,
    lon: -134.4117
  },
  { 
    id: '9454050', 
    name: 'Skagway, AK', 
    location: 'Alaska',
    lat: 59.4500,
    lon: -135.3267
  },
  { 
    id: '9455920', 
    name: 'Anchorage, AK', 
    location: 'Alaska',
    lat: 61.2383,
    lon: -149.8900
  },
  
  // Hawaii
  { 
    id: '1612340', 
    name: 'Honolulu, HI', 
    location: 'Hawaii',
    lat: 21.3067,
    lon: -157.8667
  },
  { 
    id: '1615680', 
    name: 'Mokuoloe, HI', 
    location: 'Hawaii',
    lat: 21.4333,
    lon: -157.7900
  },
  { 
    id: '1617760', 
    name: 'Maunalua Bay, HI', 
    location: 'Hawaii',
    lat: 21.2717,
    lon: -157.7083
  },
  
  // Great Lakes
  { 
    id: '9063020', 
    name: 'Buffalo, NY', 
    location: 'Lake Erie',
    lat: 42.8767,
    lon: -78.8917
  },
  { 
    id: '9075014', 
    name: 'Sturgeon Bay, WI', 
    location: 'Lake Michigan',
    lat: 44.7950,
    lon: -87.3117
  },
  { 
    id: '9087031', 
    name: 'Milwaukee, WI', 
    location: 'Lake Michigan',
    lat: 43.0267,
    lon: -87.8883
  },
  { 
    id: '9087057', 
    name: 'Calumet Harbor, IL', 
    location: 'Lake Michigan',
    lat: 41.7283,
    lon: -87.5400
  },

  // India - West Coast (Arabian Sea)
  { 
    id: 'IN001', 
    name: 'Mumbai Port', 
    location: 'Maharashtra, India',
    lat: 18.9220,
    lon: 72.8347
  },
  { 
    id: 'IN002', 
    name: 'Kandla Port', 
    location: 'Gujarat, India',
    lat: 23.0333,
    lon: 70.2167
  },
  { 
    id: 'IN003', 
    name: 'Okha Port', 
    location: 'Gujarat, India',
    lat: 22.4667,
    lon: 69.0833
  },
  { 
    id: 'IN004', 
    name: 'Porbandar', 
    location: 'Gujarat, India',
    lat: 21.6417,
    lon: 69.6293
  },
  { 
    id: 'IN005', 
    name: 'Veraval Port', 
    location: 'Gujarat, India',
    lat: 20.9167,
    lon: 70.3667
  },
  { 
    id: 'IN006', 
    name: 'Mormugao Port', 
    location: 'Goa, India',
    lat: 15.4167,
    lon: 73.8000
  },
  { 
    id: 'IN007', 
    name: 'New Mangalore Port', 
    location: 'Karnataka, India',
    lat: 12.9167,
    lon: 74.8333
  },
  { 
    id: 'IN008', 
    name: 'Cochin Port', 
    location: 'Kerala, India',
    lat: 9.9667,
    lon: 76.2667
  },
  { 
    id: 'IN009', 
    name: 'Alappuzha', 
    location: 'Kerala, India',
    lat: 9.4981,
    lon: 76.3388
  },
  { 
    id: 'IN010', 
    name: 'Kollam Port', 
    location: 'Kerala, India',
    lat: 8.8833,
    lon: 76.6000
  },
  { 
    id: 'IN011', 
    name: 'Vizhinjam Port', 
    location: 'Kerala, India',
    lat: 8.3833,
    lon: 76.9833
  },

  // India - East Coast (Bay of Bengal)
  { 
    id: 'IN012', 
    name: 'Kolkata Port', 
    location: 'West Bengal, India',
    lat: 22.5726,
    lon: 88.3639
  },
  { 
    id: 'IN013', 
    name: 'Haldia Port', 
    location: 'West Bengal, India',
    lat: 22.0333,
    lon: 88.1000
  },
  { 
    id: 'IN014', 
    name: 'Paradip Port', 
    location: 'Odisha, India',
    lat: 20.3167,
    lon: 86.6833
  },
  { 
    id: 'IN015', 
    name: 'Visakhapatnam Port', 
    location: 'Andhra Pradesh, India',
    lat: 17.6833,
    lon: 83.2167
  },
  { 
    id: 'IN016', 
    name: 'Kakinada Port', 
    location: 'Andhra Pradesh, India',
    lat: 16.9333,
    lon: 82.2333
  },
  { 
    id: 'IN017', 
    name: 'Chennai Port', 
    location: 'Tamil Nadu, India',
    lat: 13.0827,
    lon: 80.2707
  },
  { 
    id: 'IN018', 
    name: 'Ennore Port', 
    location: 'Tamil Nadu, India',
    lat: 13.2167,
    lon: 80.3333
  },
  { 
    id: 'IN019', 
    name: 'Cuddalore Port', 
    location: 'Tamil Nadu, India',
    lat: 11.7500,
    lon: 79.7667
  },
  { 
    id: 'IN020', 
    name: 'Nagapattinam Port', 
    location: 'Tamil Nadu, India',
    lat: 10.7667,
    lon: 79.8333
  },
  { 
    id: 'IN021', 
    name: 'Tuticorin Port', 
    location: 'Tamil Nadu, India',
    lat: 8.8000,
    lon: 78.1500
  },

  // India - Island Territories
  { 
    id: 'IN022', 
    name: 'Port Blair', 
    location: 'Andaman & Nicobar Islands, India',
    lat: 11.6234,
    lon: 92.7265
  },
  { 
    id: 'IN023', 
    name: 'Kavaratti', 
    location: 'Lakshadweep, India',
    lat: 10.5667,
    lon: 72.6333
  }
];

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Find the nearest station to user's location
export const findNearestStation = (userLat, userLon) => {
  let nearestStation = stations[0];
  let minDistance = calculateDistance(userLat, userLon, stations[0].lat, stations[0].lon);
  
  stations.forEach(station => {
    const distance = calculateDistance(userLat, userLon, station.lat, station.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  });
  
  return {
    station: nearestStation,
    distance: Math.round(minDistance * 10) / 10 // Round to 1 decimal place
  };
};

// Get user's current location
export const getCurrentLocation = () => {
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
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
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
};
