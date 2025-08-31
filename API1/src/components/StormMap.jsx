import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom storm icons based on category
const createStormIcon = (category, emoji) => {
  const getColor = (cat) => {
    if (cat.includes('Category 5')) return '#8b00ff';
    if (cat.includes('Category 4')) return '#ff0000';
    if (cat.includes('Category 3')) return '#ff4500';
    if (cat.includes('Category 2')) return '#ffa500';
    if (cat.includes('Category 1')) return '#ffff00';
    if (cat.includes('Tropical Storm')) return '#00ff00';
    if (cat.includes('Tropical Depression')) return '#00bfff';
    return '#808080';
  };

  return L.divIcon({
    html: `
      <div style="
        background: ${getColor(category)};
        border: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-storm-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Station icon
const createStationIcon = (status) => {
  const getColor = (stat) => {
    if (stat === 'danger') return '#e17055';
    if (stat === 'warning') return '#fdcb6e';
    return '#00b894';
  };

  return L.divIcon({
    html: `
      <div style="
        background: ${getColor(status)};
        border: 2px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-station-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const StormMap = ({ storms, stations }) => {
  const mapRef = useRef();

  // Calculate map bounds to fit all storms and stations
  const calculateBounds = () => {
    const points = [];
    
    // Add storm positions
    storms.forEach(storm => {
      if (storm.current_position.lat && storm.current_position.lon) {
        points.push([storm.current_position.lat, storm.current_position.lon]);
      }
    });
    
    // Add station positions
    Object.values(stations).forEach(station => {
      points.push([station.lat, station.lon]);
    });
    
    if (points.length === 0) {
      // Default bounds for Atlantic basin
      return [[10, -100], [50, -50]];
    }
    
    // Calculate bounds with padding
    const lats = points.map(p => p[0]);
    const lons = points.map(p => p[1]);
    const minLat = Math.min(...lats) - 2;
    const maxLat = Math.max(...lats) + 2;
    const minLon = Math.min(...lons) - 2;
    const maxLon = Math.max(...lons) + 2;
    
    return [[minLat, minLon], [maxLat, maxLon]];
  };

  const bounds = calculateBounds();
  
  // Default center and zoom
  const center = [30, -75]; // Atlantic Ocean
  const zoom = 4;

  useEffect(() => {
    // Fit map to bounds when data changes
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds);
    }
  }, [storms, stations, bounds]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
      className="storm-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Render monitoring stations */}
      {Object.entries(stations).map(([stationId, station]) => (
        <Marker
          key={stationId}
          position={[station.lat, station.lon]}
          icon={createStationIcon(station.status)}
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <h4>📡 {station.name}</h4>
              <p><strong>Station ID:</strong> {stationId}</p>
              <p><strong>Coordinates:</strong> {station.lat.toFixed(2)}°N, {Math.abs(station.lon).toFixed(2)}°W</p>
              <p><strong>Status:</strong> 
                <span style={{
                  color: station.status === 'danger' ? '#e17055' : 
                        station.status === 'warning' ? '#fdcb6e' : '#00b894',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>
                  {station.status}
                </span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render active storms */}
      {storms.map((storm) => {
        const lat = storm.current_position.lat;
        const lon = storm.current_position.lon;
        
        if (!lat || !lon) return null;

        return (
          <div key={storm.storm_id}>
            {/* Storm marker */}
            <Marker
              position={[lat, lon]}
              icon={createStormIcon(storm.category, storm.emoji)}
            >
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {storm.emoji} {storm.storm_name}
                  </h3>
                  <p><strong>Category:</strong> {storm.category}</p>
                  <p><strong>Position:</strong> {lat.toFixed(1)}°N, {Math.abs(lon).toFixed(1)}°W</p>
                  <p><strong>Wind Speed:</strong> {storm.wind_speed_knots} kt ({storm.wind_speed_mph?.toFixed(0)} mph)</p>
                  <p><strong>Pressure:</strong> {storm.pressure_mb} mb</p>
                  <p><strong>Movement:</strong> {storm.movement.direction_cardinal} at {storm.movement.speed_knots} kt</p>
                  <p><strong>Nearest Station:</strong> {storm.nearest_station.station_name} ({storm.nearest_station.distance_km?.toFixed(1)} km)</p>
                  
                  {storm.warnings && storm.warnings.length > 0 && (
                    <div style={{ marginTop: '10px', padding: '8px', background: '#fff3cd', borderRadius: '4px' }}>
                      <strong>⚠️ Warnings:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {storm.warnings.map((warning, idx) => (
                          <li key={idx} style={{ fontSize: '0.9em' }}>{warning.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Wind radius circles */}
            {storm.wind_speed_knots >= 34 && (
              <>
                {/* 34-kt wind radius */}
                <Circle
                  center={[lat, lon]}
                  radius={200000} // 200 km in meters
                  pathOptions={{
                    color: '#ff6b6b',
                    fillColor: '#ff6b6b',
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
                
                {/* 50-kt wind radius */}
                {storm.wind_speed_knots >= 50 && (
                  <Circle
                    center={[lat, lon]}
                    radius={100000} // 100 km in meters
                    pathOptions={{
                      color: '#ffa502',
                      fillColor: '#ffa502',
                      fillOpacity: 0.15,
                      weight: 2
                    }}
                  />
                )}
                
                {/* 64-kt wind radius (hurricane force) */}
                {storm.wind_speed_knots >= 64 && (
                  <Circle
                    center={[lat, lon]}
                    radius={50000} // 50 km in meters
                    pathOptions={{
                      color: '#ff4757',
                      fillColor: '#ff4757',
                      fillOpacity: 0.2,
                      weight: 3
                    }}
                  />
                )}
              </>
            )}

            {/* Connection line to nearest station */}
            {storm.nearest_station && stations[storm.nearest_station.station_id] && (
              <Polyline
                positions={[
                  [lat, lon],
                  [stations[storm.nearest_station.station_id].lat, stations[storm.nearest_station.station_id].lon]
                ]}
                pathOptions={{
                  color: '#667eea',
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '5, 10'
                }}
              />
            )}
          </div>
        );
      })}
    </MapContainer>
  );
};

export default StormMap;
