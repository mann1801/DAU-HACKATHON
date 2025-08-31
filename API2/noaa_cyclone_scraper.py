#!/usr/bin/env python3
"""
NOAA Cyclone Data Scraper

This script scrapes cyclone data from NOAA's National Hurricane Center website
and formats it for use with our storm prediction model.
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import time
import re
import json
from typing import Dict, List, Optional, Tuple
from geopy.distance import geodesic

# Global monitoring stations - imported from fetch_live_data
from fetch_live_data import STATIONS

class NOAACycloneScraper:
    """Scraper for NOAA's National Hurricane Center website."""
    
    BASE_URL = "https://www.nhc.noaa.gov"
    ACTIVE_STORMS_URL = f"{BASE_URL}/gtwo.php?basin=atlc&fdays=5"
    
    def __init__(self, stations: Dict = None):
        """
        Initialize the scraper with optional station data.
        
        Args:
            stations: Dictionary of station data with format:
                {
                    'STATION_ID': {'name': 'Station Name', 'lat': float, 'lon': float},
                    ...
                }
        """
        self.session = requests.Session()
        self.stations = stations or STATIONS
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
    
    def fetch_active_storms(self) -> List[Dict]:
        """Fetch data for all active storms."""
        print(f"Fetching active storms from {self.ACTIVE_STORMS_URL}")
        response = self.session.get(self.ACTIVE_STORMS_URL)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        storm_links = soup.select('a[href*="xgtwo"]')
        
        storms = []
        for link in storm_links:
            storm_url = f"{self.BASE_URL}/{link['href']}"
            storm_data = self._parse_storm_page(storm_url)
            if storm_data:
                storms.append(storm_data)
                time.sleep(1)  # Be nice to the server
                
        return storms
    
    def _parse_storm_page(self, url: str) -> Optional[Dict]:
        """Parse data from a single storm's page."""
        try:
            print(f"Fetching storm data from {url}")
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract storm name and ID from the page
            title = soup.find('h2').get_text(strip=True)
            storm_name = re.search(r'^TROPICAL (?:STORM|DEPRESSION|CYCLONE) ([A-Z]+)', title)
            
            if not storm_name:
                print(f"Could not parse storm name from: {title}")
                return None
                
            storm_data = {
                'SID': f"{datetime.now().year}{storm_name.group(1).lower()}",
                'NAME': storm_name.group(1),
                'TIMESTAMP': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                'ISO_TIME': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S+00:00'),
                'LAT': None,
                'LON': None,
                'WMO_WIND': None,
                'WMO_PRES': None,
                'STORM_SPEED': None,
                'STORM_DIR': None,
                'DIST2LAND': None
            }
            
            # Try to extract position and wind speed from the main content
            for row in soup.select('table tr'):
                cells = [cell.get_text(strip=True) for cell in row.select('td, th')]
                if len(cells) >= 2:
                    key = cells[0].upper()
                    value = cells[1]
                    
                    if 'LATITUDE' in key:
                        if 'N' in value or 'S' in value:
                            lat = float(value.split()[0].replace('N', '').replace('S', ''))
                            if 'S' in value:
                                lat = -lat
                            storm_data['LAT'] = lat
                            
                    elif 'LONGITUDE' in key:
                        if 'E' in value or 'W' in value:
                            lon = float(value.split()[0].replace('E', '').replace('W', ''))
                            if 'W' in value:
                                lon = -lon
                            storm_data['LON'] = lon
                            
                    elif 'MAXIMUM SUSTAINED WINDS' in key:
                        if 'KT' in value:
                            wind_speed = float(value.split('KT')[0].strip())
                            storm_data['WMO_WIND'] = wind_speed
                            
                    elif 'MINIMUM CENTRAL PRESSURE' in key:
                        if 'MB' in value:
                            pressure = float(value.split('MB')[0].strip())
                            storm_data['WMO_PRES'] = pressure
            
            return storm_data
            
        except Exception as e:
            print(f"Error parsing storm data: {e}")
            return None
    
    def _find_nearest_station(self, lat: float, lon: float) -> Tuple[str, float]:
        """Find the nearest station to the given coordinates.
        
        Args:
            lat: Latitude of the point
            lon: Longitude of the point
            
        Returns:
            Tuple of (station_id, distance_km)
        """
        if not self.stations:
            return None, None
            
        point = (lat, lon)
        nearest = None
        min_dist = float('inf')
        
        for station_id, station in self.stations.items():
            station_point = (station['lat'], station['lon'])
            dist = geodesic(point, station_point).kilometers
            if dist < min_dist:
                min_dist = dist
                nearest = station_id
                
        return nearest, min_dist

    def get_storm_dataframe(self) -> pd.DataFrame:
        """Get storm data as a pandas DataFrame with station information."""
        storms = self.fetch_active_storms()
        if not storms:
            print("No active storms found")
            return pd.DataFrame()
        
        # Process each storm to add station information
        processed_storms = []
        for storm in storms:
            if storm['LAT'] is not None and storm['LON'] is not None:
                station_id, distance_km = self._find_nearest_station(
                    storm['LAT'], storm['LON']
                )
                storm['NEAREST_STATION'] = station_id
                storm['DISTANCE_TO_STATION_KM'] = distance_km
                
                # Add station details if available
                if station_id and station_id in self.stations:
                    station = self.stations[station_id]
                    storm['STATION_NAME'] = station['name']
                    storm['STATION_LAT'] = station['lat']
                    storm['STATION_LON'] = station['lon']
                
                processed_storms.append(storm)
        
        if not processed_storms:
            return pd.DataFrame()
            
        df = pd.DataFrame(processed_storms)
        
        # Add processing timestamp
        df['PROCESSING_TIMESTAMP'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S+00:00')
        
        # Reorder columns for better readability
        columns_order = [
            'SID', 'NAME', 'TIMESTAMP', 'ISO_TIME', 'LAT', 'LON',
            'NEAREST_STATION', 'STATION_NAME', 'DISTANCE_TO_STATION_KM',
            'STATION_LAT', 'STATION_LON', 'WMO_WIND', 'WMO_PRES',
            'STORM_SPEED', 'STORM_DIR', 'DIST2LAND', 'PROCESSING_TIMESTAMP'
        ]
        
        # Only include columns that exist in the dataframe
        columns_order = [col for col in columns_order if col in df.columns]
        
        return df[columns_order]


def main():
    """Main function to demonstrate the scraper."""
    print("NOAA Cyclone Data Scraper")
    print("=========================")
    
    try:
        scraper = NOAACycloneScraper()
        df = scraper.get_storm_dataframe()
        
        if not df.empty:
            print("\nFetched storm data:")
            print(df[['SID', 'NAME', 'LAT', 'LON', 'WMO_WIND', 'WMO_PRES']].to_string(index=False))
            
            # Save to CSV
            output_file = f"noaa_storm_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(output_file, index=False)
            print(f"\nData saved to {output_file}")
        else:
            print("No storm data available")
            
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
