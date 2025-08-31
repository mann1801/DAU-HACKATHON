import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import './PollutionMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PollutionMap = ({ stations, selectedStation, userLocation, onStationSelect }) => {
  const mapRef = useRef();

  const createCustomIcon = (station, isSelected) => {
    const color = isSelected ? '#ff4444' : '#4444ff';
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        ">
          🏭
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      className: 'user-marker',
      html: `
        <div style="
          background: #00ff00;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 8px;
        ">
          📍
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const getMapCenter = () => {
    if (selectedStation) {
      return [selectedStation.latitude, selectedStation.longitude];
    }
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    return [40.7128, -74.0060]; // Default to NYC
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  return (
    <div className="pollution-map">
      <h3>🗺️ Global Air Quality Map</h3>
      
      <div className="map-container">
        <MapContainer
          center={getMapCenter()}
          zoom={6}
          style={{ height: '400px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserIcon()}
            >
              <Popup>
                <div className="popup-content">
                  <h4>📍 Your Location</h4>
                  <p>{userLocation.city}, {userLocation.country}</p>
                  <p>Lat: {userLocation.latitude.toFixed(4)}</p>
                  <p>Lon: {userLocation.longitude.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Station Markers */}
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createCustomIcon(station, selectedStation?.id === station.id)}
              eventHandlers={{
                click: () => onStationSelect(station)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{station.name}</h4>
                  <p>{station.city}, {station.country}</p>
                  <p>Station ID: {station.id}</p>
                  <p>Coordinates: {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</p>
                  {station.distance && (
                    <p>Distance: {station.distance.toFixed(1)} km</p>
                  )}
                  <button 
                    className="select-station-btn"
                    onClick={() => onStationSelect(station)}
                  >
                    Select Station
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* AQI Circles around selected station */}
          {selectedStation && (
            <>
              <Circle
                center={[selectedStation.latitude, selectedStation.longitude]}
                radius={50000}
                pathOptions={{
                  color: getAQIColor(100),
                  fillColor: getAQIColor(100),
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
              <Circle
                center={[selectedStation.latitude, selectedStation.longitude]}
                radius={25000}
                pathOptions={{
                  color: getAQIColor(75),
                  fillColor: getAQIColor(75),
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            </>
          )}
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker user">📍</span>
          <span>Your Location</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker station">🏭</span>
          <span>Monitoring Station</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker selected">🏭</span>
          <span>Selected Station</span>
        </div>
      </div>
    </div>
  );
};

export default PollutionMap;
