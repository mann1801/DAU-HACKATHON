#!/usr/bin/env python3
"""
Cyclone Alert System

This script integrates with the NOAA Cyclone Scraper to fetch real-time
cyclone data and generate appropriate alerts based on storm characteristics.
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from geopy.distance import geodesic
from noaa_cyclone_scraper import NOAACycloneScraper, STATIONS

class CycloneAlertSystem:
    """System for generating cyclone alerts based on NOAA data."""
    
    # Wind speed thresholds (in knots) for different alert levels
    ALERT_THRESHOLDS = {
        'tropical_depression': {'min': 0, 'max': 33, 'level': 'info', 'emoji': 'ℹ️'},
        'tropical_storm': {'min': 34, 'max': 63, 'level': 'warning', 'emoji': '⚠️'},
        'category_1': {'min': 64, 'max': 82, 'level': 'warning', 'emoji': '⚠️'},
        'category_2': {'min': 83, 'max': 95, 'level': 'danger', 'emoji': '🚨'},
        'category_3': {'min': 96, 'max': 112, 'level': 'danger', 'emoji': '🚨'},
        'category_4': {'min': 113, 'max': 136, 'level': 'critical', 'emoji': '🔥'},
        'category_5': {'min': 137, 'max': 200, 'level': 'critical', 'emoji': '🔥'},
    }
    
    def __init__(self, stations: Dict = None):
        """Initialize the alert system with station data."""
        self.scraper = NOAACycloneScraper(stations)
        self.stations = stations or STATIONS
    
    def get_storm_category(self, wind_speed_knots: float) -> Dict:
        """Determine the storm category based on wind speed."""
        if wind_speed_knots is None:
            return {'category': 'unknown', 'level': 'info', 'emoji': '❓'}
            
        for category, threshold in self.ALERT_THRESHOLDS.items():
            if threshold['min'] <= wind_speed_knots <= threshold['max']:
                return {
                    'category': category,
                    'level': threshold['level'],
                    'emoji': threshold['emoji']
                }
        return {'category': 'unknown', 'level': 'info', 'emoji': '❓'}
    
    def find_nearest_station(self, lat: float, lon: float) -> Tuple[str, float]:
        """Find the nearest station to the given coordinates."""
        if lat is None or lon is None:
            return None, None
            
        min_distance = float('inf')
        nearest_station = None
        
        for station_id, station in self.stations.items():
            dist = geodesic((lat, lon), (station['lat'], station['lon'])).kilometers
            if dist < min_distance:
                min_distance = dist
                nearest_station = station_id
                
        return nearest_station, min_distance
    
    def generate_alert(self, storm_data: Dict) -> Dict:
        """Generate an alert for a given storm."""
        if not storm_data:
            return None
            
        # Get storm category
        wind_speed = storm_data.get('WIND_SPEED')
        category_info = self.get_storm_category(wind_speed)
        
        # Find nearest station
        nearest_station_id, distance_km = self.find_nearest_station(
            storm_data.get('LAT'),
            storm_data.get('LON')
        )
        
        # Format the alert
        alert = {
            'storm_id': storm_data.get('SID', 'UNKNOWN'),
            'storm_name': storm_data.get('NAME', 'UNKNOWN'),
            'timestamp': datetime.utcnow().isoformat(),
            'category': category_info['category'],
            'alert_level': category_info['level'],
            'emoji': category_info['emoji'],
            'current_position': {
                'lat': storm_data.get('LAT'),
                'lon': storm_data.get('LON'),
                'timestamp': storm_data.get('ISO_TIME')
            },
            'wind_speed_knots': wind_speed,
            'wind_speed_mph': wind_speed * 1.15078 if wind_speed else None,
            'pressure_mb': storm_data.get('PRESSURE'),
            'movement': {
                'speed_knots': storm_data.get('STORM_SPEED'),
                'direction_deg': storm_data.get('STORM_DIR'),
                'direction_cardinal': self._degrees_to_cardinal(storm_data.get('STORM_DIR'))
            },
            'nearest_station': {
                'station_id': nearest_station_id,
                'station_name': self.stations.get(nearest_station_id, {}).get('name') if nearest_station_id else None,
                'distance_km': distance_km,
                'station_lat': self.stations.get(nearest_station_id, {}).get('lat') if nearest_station_id else None,
                'station_lon': self.stations.get(nearest_station_id, {}).get('lon') if nearest_station_id else None
            },
            'forecast': storm_data.get('FORECAST', []),
            'warnings': []
        }
        
        # Add specific warnings based on storm characteristics
        if wind_speed and wind_speed >= 64:  # Hurricane force winds
            alert['warnings'].append({
                'type': 'high_wind',
                'message': f"Dangerous winds of {wind_speed} knots ({wind_speed * 1.15078:.1f} mph)"
            })
            
        if alert['nearest_station']['distance_km'] and alert['nearest_station']['distance_km'] < 200:
            alert['warnings'].append({
                'type': 'proximity_warning',
                'message': f"Storm is {alert['nearest_station']['distance_km']:.1f} km from {alert['nearest_station']['station_name']}"
            })
            
        return alert
    
    def _degrees_to_cardinal(self, degrees: float) -> str:
        """Convert degrees to cardinal direction."""
        if degrees is None:
            return None
            
        directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                     "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        return directions[int((degrees % 360) / 22.5) % 16]
    
    def get_active_storm_alerts(self) -> List[Dict]:
        """Get alerts for all active storms."""
        try:
            active_storms = self.scraper.fetch_active_storms()
            return [self.generate_alert(storm) for storm in active_storms if storm]
        except Exception as e:
            print(f"Error fetching active storm alerts: {e}")
            return []

def format_alert_for_display(alert: Dict) -> str:
    """Format an alert as a human-readable string."""
    if not alert:
        return "No active alerts."
        
    emoji = alert.get('emoji', 'ℹ️')
    category = alert['category'].replace('_', ' ').title()
    name = alert['storm_name']
    
    # Position info
    pos = alert['current_position']
    lat = pos.get('lat', 'Unknown')
    lon = pos.get('lon', 'Unknown')
    pos_time = pos.get('timestamp', 'Unknown')
    
    # Wind info
    wind_knots = alert.get('wind_speed_knots', 'Unknown')
    wind_mph = alert.get('wind_speed_mph', 'Unknown')
    
    # Movement info
    move = alert.get('movement', {})
    move_speed = move.get('speed_knots', 'Unknown')
    move_dir = move.get('direction_cardinal', 'Unknown')
    
    # Nearest station info
    station = alert.get('nearest_station', {})
    station_name = station.get('station_name', 'Unknown')
    station_dist = station.get('distance_km', 'Unknown')
    
    # Build the alert message
    lines = [
        f"{emoji} *{category.upper()} ALERT: {name}* {emoji}",
        "",
        f"📍 *Position:* {lat}°N, {lon}°W (as of {pos_time})",
        f"💨 *Winds:* {wind_knots} kt ({wind_mph:.1f} mph)",
        f"↗️ *Movement:* {move_speed} kt toward {move_dir}",
        f"🏙️ *Nearest City:* {station_name} ({station_dist:.1f} km away)",
        "",
        "*WARNINGS:*"
    ]
    
    # Add warnings if any
    for warning in alert.get('warnings', []):
        lines.append(f"• ⚠️ {warning['message']}")
    
    # Add recommended actions based on alert level
    if alert['alert_level'] == 'critical':
        lines.extend([
            "",
            "🚨 *IMMEDIATE ACTION REQUIRED:*",
            "• Follow evacuation orders if issued",
            "• Move to a safe location immediately",
            "• Stay away from windows and exterior walls",
            "• Have emergency supplies ready"
        ])
    elif alert['alert_level'] == 'warning':
        lines.extend([
            "",
            "⚠️ *PREPARE NOW:*",
            "• Review your emergency plan",
            "• Secure outdoor items",
            "• Prepare emergency supplies",
            "• Stay updated on storm progress"
        ])
    else:
        lines.extend([
            "",
            "ℹ️ *ADVISORY:*",
            "• Monitor the storm's progress",
            "• Review your emergency plan",
            "• Stay informed with official updates"
        ])
    
    return "\n".join(lines)

def main():
    """Run the cyclone alert system."""
    print("🚀 Starting Cyclone Alert System...")
    
    alert_system = CycloneAlertSystem()
    
    print("\n🌪️  Fetching active storm data from NOAA...")
    alerts = alert_system.get_active_storm_alerts()
    
    if not alerts:
        print("\n✅ No active tropical cyclones detected.")
        return
    
    print(f"\n⚠️  Found {len(alerts)} active storm{'s' if len(alerts) > 1 else ''}:")
    
    for i, alert in enumerate(alerts, 1):
        print(f"\n{'='*50}")
        print(f"STORM {i} of {len(alerts)}")
        print("="*50)
        print(format_alert_for_display(alert))
    
    print("\nℹ️  Monitoring for updates. Press Ctrl+C to exit.")

if __name__ == "__main__":
    main()
