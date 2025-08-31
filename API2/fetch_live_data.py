#!/usr/bin/env python3
"""
NOAA Live Cyclone Data Fetcher

This script monitors active tropical cyclones and provides alerts based on NOAA data.
It fetches real-time cyclone data from NOAA's National Hurricane Center
and processes it for use in the cyclone alert system.
"""

# Monitoring stations with their coordinates - Global Network (50+ stations)
STATIONS = {
    # United States (10 stations)
    'MIA': {'name': 'Miami', 'lat': 25.7617, 'lon': -80.1918, 'country': 'USA'},
    'TPA': {'name': 'Tampa', 'lat': 27.9506, 'lon': -82.4572, 'country': 'USA'},
    'JAX': {'name': 'Jacksonville', 'lat': 30.3322, 'lon': -81.6557, 'country': 'USA'},
    'MSY': {'name': 'New Orleans', 'lat': 29.9511, 'lon': -90.0715, 'country': 'USA'},
    'HOU': {'name': 'Houston', 'lat': 29.7604, 'lon': -95.3698, 'country': 'USA'},
    'CHS': {'name': 'Charleston', 'lat': 32.7765, 'lon': -79.9311, 'country': 'USA'},
    'ORF': {'name': 'Norfolk', 'lat': 36.8508, 'lon': -76.2859, 'country': 'USA'},
    'NYC': {'name': 'New York', 'lat': 40.7128, 'lon': -74.0060, 'country': 'USA'},
    'BOS': {'name': 'Boston', 'lat': 42.3601, 'lon': -71.0589, 'country': 'USA'},
    'SJU': {'name': 'San Juan', 'lat': 18.4655, 'lon': -66.1057, 'country': 'USA'},
    
    # India (12 stations)
    'MUM': {'name': 'Mumbai', 'lat': 19.0760, 'lon': 72.8777, 'country': 'India'},
    'CHE': {'name': 'Chennai', 'lat': 13.0827, 'lon': 80.2707, 'country': 'India'},
    'KOL': {'name': 'Kolkata', 'lat': 22.5726, 'lon': 88.3639, 'country': 'India'},
    'COK': {'name': 'Kochi', 'lat': 9.9312, 'lon': 76.2673, 'country': 'India'},
    'VIS': {'name': 'Visakhapatnam', 'lat': 17.6868, 'lon': 83.2185, 'country': 'India'},
    'GOA': {'name': 'Goa', 'lat': 15.2993, 'lon': 74.1240, 'country': 'India'},
    'PBL': {'name': 'Port Blair', 'lat': 11.6234, 'lon': 92.7265, 'country': 'India'},
    'KAN': {'name': 'Kandla', 'lat': 23.0333, 'lon': 70.2167, 'country': 'India'},
    'TUT': {'name': 'Tuticorin', 'lat': 8.8047, 'lon': 78.1348, 'country': 'India'},
    'PAR': {'name': 'Paradip', 'lat': 20.2648, 'lon': 86.6109, 'country': 'India'},
    'MAN': {'name': 'Mangalore', 'lat': 12.9141, 'lon': 74.8560, 'country': 'India'},
    'KAK': {'name': 'Kakinada', 'lat': 16.9891, 'lon': 82.2475, 'country': 'India'},
    
    # China (8 stations)
    'SHA': {'name': 'Shanghai', 'lat': 31.2304, 'lon': 121.4737, 'country': 'China'},
    'HKG': {'name': 'Hong Kong', 'lat': 22.3193, 'lon': 114.1694, 'country': 'China'},
    'GUA': {'name': 'Guangzhou', 'lat': 23.1291, 'lon': 113.2644, 'country': 'China'},
    'SHE': {'name': 'Shenzhen', 'lat': 22.5431, 'lon': 114.0579, 'country': 'China'},
    'TIA': {'name': 'Tianjin', 'lat': 39.3434, 'lon': 117.3616, 'country': 'China'},
    'DAL': {'name': 'Dalian', 'lat': 38.9140, 'lon': 121.6147, 'country': 'China'},
    'QIN': {'name': 'Qingdao', 'lat': 36.0986, 'lon': 120.3719, 'country': 'China'},
    'XIA': {'name': 'Xiamen', 'lat': 24.4798, 'lon': 118.0819, 'country': 'China'},
    
    # Japan (6 stations)
    'TOK': {'name': 'Tokyo', 'lat': 35.6762, 'lon': 139.6503, 'country': 'Japan'},
    'OSA': {'name': 'Osaka', 'lat': 34.6937, 'lon': 135.5023, 'country': 'Japan'},
    'YOK': {'name': 'Yokohama', 'lat': 35.4437, 'lon': 139.6380, 'country': 'Japan'},
    'KOB': {'name': 'Kobe', 'lat': 34.6901, 'lon': 135.1956, 'country': 'Japan'},
    'NAG': {'name': 'Nagoya', 'lat': 35.1815, 'lon': 136.9066, 'country': 'Japan'},
    'FUK': {'name': 'Fukuoka', 'lat': 33.5904, 'lon': 130.4017, 'country': 'Japan'},
    
    # Southeast Asia (8 stations)
    'SIN': {'name': 'Singapore', 'lat': 1.3521, 'lon': 103.8198, 'country': 'Singapore'},
    'BAN': {'name': 'Bangkok', 'lat': 13.7563, 'lon': 100.5018, 'country': 'Thailand'},
    'MNL': {'name': 'Manila', 'lat': 14.5995, 'lon': 120.9842, 'country': 'Philippines'},
    'JAK': {'name': 'Jakarta', 'lat': -6.2088, 'lon': 106.8456, 'country': 'Indonesia'},
    'KUL': {'name': 'Kuala Lumpur', 'lat': 3.1390, 'lon': 101.6869, 'country': 'Malaysia'},
    'HAN': {'name': 'Hanoi', 'lat': 21.0285, 'lon': 105.8542, 'country': 'Vietnam'},
    'HCM': {'name': 'Ho Chi Minh City', 'lat': 10.8231, 'lon': 106.6297, 'country': 'Vietnam'},
    'CEB': {'name': 'Cebu', 'lat': 10.3157, 'lon': 123.8854, 'country': 'Philippines'},
    
    # Europe (10 stations)
    'LON': {'name': 'London', 'lat': 51.5074, 'lon': -0.1278, 'country': 'UK'},
    'AMS': {'name': 'Amsterdam', 'lat': 52.3676, 'lon': 4.9041, 'country': 'Netherlands'},
    'HAM': {'name': 'Hamburg', 'lat': 53.5511, 'lon': 9.9937, 'country': 'Germany'},
    'MAR': {'name': 'Marseille', 'lat': 43.2965, 'lon': 5.3698, 'country': 'France'},
    'BAR': {'name': 'Barcelona', 'lat': 41.3851, 'lon': 2.1734, 'country': 'Spain'},
    'ROM': {'name': 'Rome', 'lat': 41.9028, 'lon': 12.4964, 'country': 'Italy'},
    'ATH': {'name': 'Athens', 'lat': 37.9838, 'lon': 23.7275, 'country': 'Greece'},
    'IST': {'name': 'Istanbul', 'lat': 41.0082, 'lon': 28.9784, 'country': 'Turkey'},
    'LIS': {'name': 'Lisbon', 'lat': 38.7223, 'lon': -9.1393, 'country': 'Portugal'},
    'STO': {'name': 'Stockholm', 'lat': 59.3293, 'lon': 18.0686, 'country': 'Sweden'},
    
    # Middle East & Others (6 stations)
    'DUB': {'name': 'Dubai', 'lat': 25.2048, 'lon': 55.2708, 'country': 'UAE'},
    'DOH': {'name': 'Doha', 'lat': 25.2854, 'lon': 51.5310, 'country': 'Qatar'},
    'KUW': {'name': 'Kuwait City', 'lat': 29.3759, 'lon': 47.9774, 'country': 'Kuwait'},
    'MUS': {'name': 'Muscat', 'lat': 23.5859, 'lon': 58.4059, 'country': 'Oman'},
    'JED': {'name': 'Jeddah', 'lat': 21.4858, 'lon': 39.1925, 'country': 'Saudi Arabia'},
    'DAM': {'name': 'Dammam', 'lat': 26.4207, 'lon': 50.0888, 'country': 'Saudi Arabia'},
}

import requests
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Any
import json
import time
import re
import os
from urllib.parse import urljoin

# Import visualization module
from cyclone_visualization import CycloneVisualizer, plot_storm_history

class NOAACycloneDataFetcher:
    """Fetches and processes live cyclone data from NOAA's API."""
    
    BASE_URL = "https://www.nhc.noaa.gov"
    ACTIVE_STORMS_RSS = "https://www.nhc.noaa.gov/gis-at.xml"  # RSS feed for active storms
    STORM_ARCHIVE_BASE = "https://www.nhc.noaa.gov/archive/xgtwo/"  # Base URL for storm data
    ACTIVE_STORMS_JSON = "https://www.nhc.noaa.gov/gtwo.xml"  # Alternative JSON endpoint
    
    def __init__(self, cache_ttl: int = 300):
        """
        Initialize the data fetcher.
        
        Args:
            cache_ttl: Time in seconds to cache API responses (default: 300s/5min)
        """
        self.session = requests.Session()
        self.cache = {}
        self.cache_ttl = cache_ttl
        self.session.headers.update({
            'User-Agent': 'CycloneAlertSystem/1.0',
            'Accept': 'application/json',
        })
    
    def _get_cached_data(self, key: str):
        """Get data from cache if it exists and is not expired."""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.cache_ttl:
                return data
        return None
    
    def _set_cached_data(self, key: str, data):
        """Store data in cache with current timestamp."""
        self.cache[key] = (data, time.time())
    
    def fetch_active_storms(self) -> List[Dict]:
        """Fetch data for all active tropical cyclones using RSS feed."""
        try:
            # Try to get from cache first
            cached = self._get_cached_data('active_storms')
            if cached is not None:
                return cached
                
            print(f"Fetching active storms from {self.ACTIVE_STORMS_RSS}")
            response = self.session.get(self.ACTIVE_STORMS_RSS)
            response.raise_for_status()
            
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.content, 'xml')
            
            # Get the publication date
            pub_date = soup.find('pubDate')
            timestamp = datetime.now(timezone.utc)
            if pub_date and pub_date.text:
                try:
                    from dateutil import parser
                    timestamp = parser.parse(pub_date.text)
                except Exception:
                    pass
            
            # Find all active storms in the RSS feed
            storms = []
            for item in soup.find_all('item'):
                title = item.find('title')
                if not title or not title.text:
                    continue
                    
                # Extract storm name and type from title (e.g., "Tropical Storm Franklin")
                match = re.match(r'(Tropical (?:Storm|Depression|Cyclone)|Hurricane) (\w+)', title.text)
                if not match:
                    continue
                    
                storm_type, storm_name = match.groups()
                
                # Get the detailed forecast URL
                link = item.find('link')
                if not link or not link.text:
                    continue
                    
                # Create a basic storm entry
                storm_data = {
                    'storm_id': f"AL{timestamp.strftime('%y')}{storm_name.upper()}",
                    'storm_name': storm_name,
                    'storm_type': storm_type,
                    'timestamp': timestamp.isoformat(),
                    'advisory_url': link.text,
                    'position': {},
                    'intensity': {},
                    'forecast': []
                }
                
                # Get the detailed forecast
                self._enhance_storm_data(storm_data)
                storms.append(storm_data)
            
            # Cache the result
            self._set_cached_data('active_storms', storms)
            return storms
            
        except Exception as e:
            print(f"Error fetching active storms: {e}")
            return []
    
    def _enhance_storm_data(self, storm_data: Dict) -> None:
        """Enhance storm data with additional information from the advisory page."""
        try:
            if not storm_data.get('advisory_url'):
                return
                
            print(f"Fetching detailed data from {storm_data['advisory_url']}")
            response = self.session.get(storm_data['advisory_url'])
            response.raise_for_status()
            
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the main content div
            content = soup.find('div', {'id': 'content'})
            if not content:
                return
                
            # Look for position information
            for p in content.find_all('p'):
                text = p.get_text().strip()
                
                # Look for position pattern (e.g., "LOCATION...12.5N  45.2W")
                pos_match = re.search(r'LOCATION[. ]+([0-9.]+)N[ ]+([0-9.]+)W', text)
                if pos_match:
                    lat = float(pos_match.group(1))
                    lon = -float(pos_match.group(2))  # Convert to negative for W
                    storm_data['position'] = {'lat': lat, 'lon': lon}
                
                # Look for wind speed pattern (e.g., "MAXIMUM SUSTAINED WINDS...65 MPH")
                wind_match = re.search(r'MAXIMUM SUSTAINED WINDS[. ]+([0-9]+) MPH', text)
                if wind_match:
                    wind_mph = int(wind_match.group(1))
                    wind_knots = wind_mph / 1.15078
                    storm_data['intensity'] = {
                        'wind_speed_knots': wind_knots,
                        'wind_speed_mph': wind_mph,
                        'category': self._get_category(wind_knots)
                    }
                
                # Look for movement pattern (e.g., "PRESENT MOVEMENT...W OR 275 DEGREES AT 12 MPH")
                move_match = re.search(r'PRESENT MOVEMENT[. ]+([A-Z ]+) AT ([0-9]+) MPH', text)
                if move_match:
                    direction = move_match.group(1).strip()
                    speed_mph = int(move_match.group(2))
                    speed_knots = speed_mph / 1.15078
                    storm_data['movement'] = {
                        'direction': direction,
                        'speed_mph': speed_mph,
                        'speed_knots': speed_knots
                    }
            
            # Try to find forecast positions
            forecast = []
            for p in content.find_all('p'):
                text = p.get_text().strip()
                # Look for forecast position (e.g., "FORECAST VALID 01/1200Z 15.5N  50.0W")
                fc_match = re.search(r'FORECAST VALID (\d{2}/\d{4}Z)[ ]+([0-9.]+)N[ ]+([0-9.]+)W', text)
                if fc_match:
                    fc_date, lat, lon = fc_match.groups()
                    forecast.append({
                        'timestamp': self._parse_forecast_date(fc_date, storm_data.get('timestamp')),
                        'lat': float(lat),
                        'lon': -float(lon)  # Convert to negative for W
                    })
            
            if forecast:
                storm_data['forecast'] = forecast
                
        except Exception as e:
            print(f"Error enhancing storm data: {e}")
    
    def _process_storm_data(self, storm_data: Dict) -> Dict:
        """Process raw storm data into a standardized format."""
        try:
            # Extract position and intensity data
            current = storm_data.get('current', {})
            forecast = storm_data.get('forecast', [])
            
            # Convert to our standard format
            processed = {
                'id': storm_data.get('id'),
                'name': storm_data.get('name', 'UNKNOWN').strip(),
                'basin': storm_data.get('basin', 'UNKNOWN'),
                'timestamp': current.get('time'),
                'position': {
                    'lat': current.get('lat'),
                    'lon': current.get('lon'),
                },
                'intensity': {
                    'category': current.get('intensity', {}).get('category', 'UNKNOWN'),
                    'wind_speed_knots': current.get('intensity', {}).get('windSpeed'),
                    'wind_gust_knots': current.get('intensity', {}).get('gustSpeed'),
                    'pressure_mb': current.get('intensity', {}).get('pressure'),
                },
                'movement': {
                    'speed_knots': current.get('movement', {}).get('speed'),
                    'direction_deg': current.get('movement', {}).get('direction'),
                },
                'forecast': []
            }
            
            # Process forecast data if available
            for fc in forecast[:5]:  # Limit to next 5 forecast points
                processed['forecast'].append({
                    'timestamp': fc.get('time'),
                    'lat': fc.get('lat'),
                    'lon': fc.get('lon'),
                    'wind_speed_knots': fc.get('intensity', {}).get('windSpeed'),
                    'category': fc.get('intensity', {}).get('category', 'UNKNOWN'),
                })
            
            return processed
            
        except Exception as e:
            print(f"Error processing storm data: {e}")
            return {}
    
    def _get_category(self, wind_speed_knots: float) -> str:
        """Convert wind speed to Saffir-Simpson category."""
        if wind_speed_knots >= 137:
            return 'Category 5'
        elif wind_speed_knots >= 113:
            return 'Category 4'
        elif wind_speed_knots >= 96:
            return 'Category 3'
        elif wind_speed_knots >= 83:
            return 'Category 2'
        elif wind_speed_knots >= 64:
            return 'Category 1'
        elif wind_speed_knots >= 34:
            return 'Tropical Storm'
        elif wind_speed_knots > 0:
            return 'Tropical Depression'
        return 'Unknown'

    def _parse_forecast_date(self, date_str: str, base_date_str: str = None) -> str:
        """Parse forecast date string (e.g., '01/1200Z') into ISO format."""
        try:
            # Get current date components
            now = datetime.now(timezone.utc)
            if base_date_str:
                try:
                    base_date = datetime.fromisoformat(base_date_str.replace('Z', '+00:00'))
                    if base_date.tzinfo is None:
                        base_date = base_date.replace(tzinfo=timezone.utc)
                    now = base_date
                except (ValueError, AttributeError):
                    pass
            
            # Parse the forecast date (format: MM/DDHHMM)
            month = int(date_str[0:2])
            day = int(date_str[3:5])
            hour = int(date_str[5:7])
            minute = int(date_str[7:9]) if len(date_str) > 7 else 0
            
            # Create the forecast datetime
            fc_date = now.replace(month=month, day=day, hour=hour, minute=minute, second=0, microsecond=0)
            
            # Handle year boundary
            if fc_date < now - timedelta(days=180):
                fc_date = fc_date.replace(year=now.year + 1)
            
            return fc_date.isoformat()
            
        except Exception as e:
            print(f"Error parsing forecast date '{date_str}': {e}")
            return datetime.now(timezone.utc).isoformat()

def fetch_live_cyclone_data(station_id: str = None, days: int = 7) -> pd.DataFrame:
    """
    Fetch live cyclone data from NOAA's API.
    
    Args:
        station_id: Optional station ID to filter by proximity
        days: Number of days of forecast to include (default: 7)
        
    Returns:
        pandas.DataFrame: DataFrame containing cyclone data
    """
    fetcher = NOAACycloneDataFetcher()
    storms = fetcher.fetch_active_storms()
    
    if not storms:
        print("No active tropical cyclones found.")
        return pd.DataFrame()
    
    # Convert to DataFrame
    rows = []
    for storm in storms:
        row = {
            'storm_id': storm.get('id'),
            'storm_name': storm.get('name'),
            'basin': storm.get('basin'),
            'timestamp': storm.get('timestamp'),
            'lat': storm.get('position', {}).get('lat'),
            'lon': storm.get('position', {}).get('lon'),
            'category': storm.get('intensity', {}).get('category'),
            'wind_speed_knots': storm.get('intensity', {}).get('wind_speed_knots'),
            'wind_gust_knots': storm.get('intensity', {}).get('wind_gust_knots'),
            'pressure_mb': storm.get('intensity', {}).get('pressure_mb'),
            'movement_speed': storm.get('movement', {}).get('speed_knots'),
            'movement_direction': storm.get('movement', {}).get('direction_deg'),
            'forecast_points': len(storm.get('forecast', [])),
        }
        rows.append(row)
    
    df = pd.DataFrame(rows)
    
    # Add derived columns
    if not df.empty:
        df['wind_speed_mph'] = df['wind_speed_knots'] * 1.15078
        df['wind_gust_mph'] = df['wind_gust_knots'] * 1.15078
        df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    return df

def visualize_storms(storms_data, output_dir='output'):
    """Visualize active storms and save plots."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Create a map with all storms
    viz = CycloneVisualizer(bbox=[-100, -50, 10, 45])
    viz.create_map(title="Active Tropical Cyclones")
    
    for storm in storms_data:
        viz.plot_storm(storm)
    
    viz.add_legend()
    map_filename = os.path.join(output_dir, 'active_cyclones.png')
    viz.save_plot(map_filename)
    
    # Create individual storm plots
    for storm in storms_data:
        storm_name = storm.get('storm_name', 'UNKNOWN').replace(' ', '_').upper()
        storm_id = storm.get('storm_id', 'UNKNOWN')
        
        # Create map for this storm
        viz = CycloneVisualizer()
        viz.create_map(title=f"{storm_name} ({storm_id}) Track")
        viz.plot_storm(storm, show_forecast=True)
        viz.plot_wind_swath(storm)
        viz.add_legend()
        
        # Save the plot
        storm_filename = os.path.join(output_dir, f"{storm_id}_{storm_name}_track.png")
        viz.save_plot(storm_filename)
    
    print(f"\n📊 Visualizations saved to {os.path.abspath(output_dir)}/")

def main():
    """Run the cyclone data fetcher and display results."""
    print("🌪️  Fetching live cyclone data from NOAA...")
    
    # Show monitoring stations
    print("\n📡 Monitoring stations:")
    for station_id, info in STATIONS.items():
        print(f"   • {station_id}: {info['name']} ({info['lat']}°N, {info['lon']}°W)")
    
    # Fetch data
    print("\n🔄 Fetching active storms...")
    df = fetch_live_cyclone_data()
    
    if df.empty:
        print("\n✅ No active tropical cyclones detected within monitoring area.")
        return
    
    # Convert DataFrame to list of dicts for visualization
    storms_data = []
    for _, row in df.iterrows():
        storm = {
            'storm_name': row.get('storm_name', 'UNKNOWN'),
            'storm_id': row.get('storm_id', 'UNKNOWN'),
            'timestamp': row.get('timestamp'),
            'position': {
                'lat': row.get('lat'),
                'lon': row.get('lon')
            },
            'intensity': {
                'category': row.get('category', 'Unknown'),
                'wind_speed_knots': row.get('wind_speed_knots'),
                'wind_speed_mph': row.get('wind_speed_mph'),
                'pressure_mb': row.get('pressure_mb')
            },
            'movement': {
                'direction': row.get('movement_direction'),
                'speed_knots': row.get('movement_speed'),
                'speed_mph': row.get('movement_speed') * 1.15078 if pd.notnull(row.get('movement_speed')) else None
            },
            'forecast': []  # Add forecast data if available
        }
        storms_data.append(storm)
    
    # Generate visualizations
    visualize_storms(storms_data)
    
    # Display storm information
    print("\n🌊 Active Tropical Cyclones:")
    print("-" * 80)
    
    # Display summary
    print(f"\nFound {len(df)} active tropical cyclones:")
    print("-" * 80)
    
    for _, row in df.iterrows():
        print(f"{row['storm_name']} ({row['storm_id']}): {row['category']} at {row['lat']}°N, {row['lon']}°W")
        print(f"  Wind: {row['wind_speed_knots']} kt ({row['wind_speed_mph']:.1f} mph), "
              f"Gusts: {row['wind_gust_knots']} kt ({row['wind_gust_mph']:.1f} mph), "
              f"Pressure: {row['pressure_mb']} mb")
        print(f"  Movement: {row['movement_direction']}° at {row['movement_speed']} kt")
        print(f"  Last update: {row['timestamp']}")
        print()
    
    print(f"\n📊 Visualizations have been saved to the 'output' directory.")

if __name__ == "__main__":
    main()
