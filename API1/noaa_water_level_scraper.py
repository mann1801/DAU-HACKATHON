import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import os
from typing import Optional, Dict, List
import json

class NOAOWaterLevelScraper:
    """
    A web scraper for NOAA water level data.
    """
    
    BASE_URL = "https://tidesandcurrents.noaa.gov/waterlevels.html"
    DATA_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    
    def __init__(self, station_id: str = "8724580"):
        """
        Initialize the scraper with a default station ID (Miami Beach, FL).
        You can find station IDs at: https://tidesandcurrents.noaa.gov/stations.html
        """
        self.station_id = station_id
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_station_info(self) -> Dict:
        """Get basic information about the station."""
        params = {
            'station': self.station_id,
            'product': 'water_level',
            'application': 'web_services',
            'format': 'json',
            'units': 'metric'
        }
        
        try:
            response = self.session.get(f"{self.DATA_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching station info: {e}")
            return {}
    
    def get_water_level_data(self, 
                           begin_date: str = None, 
                           end_date: str = None,
                           product: str = 'water_level',
                           time_zone: str = 'gmt',
                           units: str = 'metric',
                           interval: str = None) -> pd.DataFrame:
        """
        Fetch water level data for the specified date range.
        
        Args:
            begin_date: Start date in yyyyMMdd format (default: 1 day ago)
            end_date: End date in yyyyMMdd format (default: today)
            product: Type of data to fetch (water_level, predictions, etc.)
            time_zone: Time zone for the data (gmt, lst, lst_ldt)
            units: Units for the data (metric, english)
            
        Returns:
            pandas.DataFrame: DataFrame containing the water level data
        """
        # Set default dates if not provided
        if not begin_date or not end_date:
            today = datetime.utcnow()
            if not end_date:
                end_date = today.strftime('%Y%m%d')
            if not begin_date:
                begin_date = (today - pd.Timedelta(days=1)).strftime('%Y%m%d')
        
        params = {
            'begin_date': begin_date,
            'end_date': end_date,
            'station': self.station_id,
            'product': product,
            'application': 'web_services',
            'format': 'json',
            'time_zone': time_zone,
            'units': units,
            'datum': 'MLLW',  # Mean Lower Low Water
            'interval': interval,  # Can be 'h' (hourly), 'hilo' (high/low), or None (6-min data)
            'application': 'web_services'
        }
        
        try:
            response = self.session.get(self.DATA_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data:
                df = pd.DataFrame(data['data'])
                # Convert string dates to datetime
                if 't' in df.columns:
                    df['time'] = pd.to_datetime(df['t'])
                    df = df.drop('t', axis=1)
                return df
            else:
                print("No data available for the specified parameters.")
                return pd.DataFrame()
                
        except Exception as e:
            print(f"Error fetching water level data: {e}")
            return pd.DataFrame()
    
    def get_available_stations(self, state: Optional[str] = None) -> pd.DataFrame:
        """
        Get a list of available water level stations.
        
        Args:
            state: Optional state abbreviation to filter stations
            
        Returns:
            pandas.DataFrame: DataFrame containing station information
        """
        try:
            # This is a simplified approach - in practice, you might need to scrape the stations page
            # or use a known list of stations
            stations_url = "https://tidesandcurrents.noaa.gov/stations.html"
            response = self.session.get(stations_url)
            response.raise_for_status()
            
            # Note: This is a placeholder. In a real implementation, you would parse the HTML
            # to extract station information. The actual implementation would depend on the page structure.
            print("Note: Implement station list parsing based on the current NOAA website structure")
            return pd.DataFrame()
            
        except Exception as e:
            print(f"Error fetching station list: {e}")
            return pd.DataFrame()

# Example usage
if __name__ == "__main__":
    # Initialize scraper with a station ID (Miami Beach, FL)
    scraper = NOAOWaterLevelScraper(station_id="8724580")
    
    # Get station info
    print("Fetching station info...")
    station_info = scraper.get_station_info()
    print(f"Station Info: {json.dumps(station_info, indent=2) if station_info else 'Not available'}")
    
    # Get water level data for the last 7 days
    print("\nFetching water level data...")
    end_date = datetime.utcnow().strftime('%Y%m%d')
    begin_date = (datetime.utcnow() - pd.Timedelta(days=7)).strftime('%Y%m%d')
    
    water_data = scraper.get_water_level_data(
        begin_date=begin_date,
        end_date=end_date,
        product='water_level',
        time_zone='gmt',
        units='metric'
    )
    
    if not water_data.empty:
        print("\nWater Level Data:")
        print(water_data.head())
        
        # Save to CSV
        output_file = f"water_level_data_{begin_date}_to_{end_date}.csv"
        water_data.to_csv(output_file, index=False)
        print(f"\nData saved to {output_file}")
    else:
        print("No water level data available for the specified parameters.")



# import requests
# from bs4 import BeautifulSoup
# import pandas as pd
# from datetime import datetime
# import os
# from typing import Optional, Dict, List
# import json

# class NOAOWaterLevelScraper:
#     """
#     A web scraper for NOAA water level data.
#     """
    
#     BASE_URL = "https://tidesandcurrents.noaa.gov/waterlevels.html"
#     DATA_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    
#     def __init__(self, station_id: str = "8724580"):
#         """
#         Initialize the scraper with a default station ID (Miami Beach, FL).
#         You can find station IDs at: https://tidesandcurrents.noaa.gov/stations.html
#         """
#         self.station_id = station_id
#         self.session = requests.Session()
#         self.session.headers.update({
#             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
#         })
    
#     def get_station_info(self) -> Dict:
#         """Get basic information about the station."""
#         params = {
#             'station': self.station_id,
#             'product': 'water_level',
#             'application': 'web_services',
#             'format': 'json',
#             'units': 'metric'
#         }
        
#         try:
#             response = self.session.get(f"{self.DATA_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}")
#             response.raise_for_status()
#             return response.json()
#         except Exception as e:
#             print(f"Error fetching station info: {e}")
#             return {}
    
#     def get_water_level_data(self, 
#                            begin_date: str = None, 
#                            end_date: str = None,
#                            product: str = 'water_level',
#                            time_zone: str = 'gmt',
#                            units: str = 'metric',
#                            interval: str = None) -> pd.DataFrame:
#         """
#         Fetch water level data for the specified date range.
        
#         Args:
#             begin_date: Start date in yyyyMMdd format (default: 1 day ago)
#             end_date: End date in yyyyMMdd format (default: today)
#             product: Type of data to fetch (water_level, predictions, etc.)
#             time_zone: Time zone for the data (gmt, lst, lst_ldt)
#             units: Units for the data (metric, english)
            
#         Returns:
#             pandas.DataFrame: DataFrame containing the water level data
#         """
#         # Set default dates if not provided
#         if not begin_date or not end_date:
#             today = datetime.utcnow()
#             if not end_date:
#                 end_date = today.strftime('%Y%m%d')
#             if not begin_date:
#                 begin_date = (today - pd.Timedelta(days=1)).strftime('%Y%m%d')
        
#         params = {
#             'begin_date': begin_date,
#             'end_date': end_date,
#             'station': self.station_id,
#             'product': product,
#             'application': 'web_services',
#             'format': 'json',
#             'time_zone': time_zone,
#             'units': units,
#             'datum': 'MLLW',  # Mean Lower Low Water
#             'interval': interval,  # Can be 'h' (hourly), 'hilo' (high/low), or None (6-min data)
#             'application': 'web_services'
#         }
        
#         try:
#             response = self.session.get(self.DATA_URL, params=params)
#             response.raise_for_status()
#             data = response.json()
            
#             if 'data' in data:
#                 df = pd.DataFrame(data['data'])
#                 # Convert string dates to datetime
#                 if 't' in df.columns:
#                     df['time'] = pd.to_datetime(df['t'])
#                     df = df.drop('t', axis=1)
#                 return df
#             else:
#                 print("No data available for the specified parameters.")
#                 return pd.DataFrame()
                
#         except Exception as e:
#             print(f"Error fetching water level data: {e}")
#             return pd.DataFrame()
    
#     def get_available_stations(self, state: Optional[str] = None) -> pd.DataFrame:
#         """
#         Get a list of available water level stations.
        
#         Args:
#             state: Optional state abbreviation to filter stations
            
#         Returns:
#             pandas.DataFrame: DataFrame containing station information
#         """
#         try:
#             # This is a simplified approach - in practice, you might need to scrape the stations page
#             # or use a known list of stations
#             stations_url = "https://tidesandcurrents.noaa.gov/stations.html"
#             response = self.session.get(stations_url)
#             response.raise_for_status()
            
#             # Note: This is a placeholder. In a real implementation, you would parse the HTML
#             # to extract station information. The actual implementation would depend on the page structure.
#             print("Note: Implement station list parsing based on the current NOAA website structure")
#             return pd.DataFrame()
            
#         except Exception as e:
#             print(f"Error fetching station list: {e}")
#             return pd.DataFrame()

# # Example usage
# if __name__ == "__main__":
#     # Initialize scraper with a station ID (Miami Beach, FL)
#     scraper = NOAOWaterLevelScraper(station_id="8724580")
    
#     # Get station info
#     print("Fetching station info...")
#     station_info = scraper.get_station_info()
#     print(f"Station Info: {json.dumps(station_info, indent=2) if station_info else 'Not available'}")
    
#     # Get water level data for the last 7 days
#     print("\nFetching water level data...")
#     end_date = datetime.utcnow().strftime('%Y%m%d')
#     begin_date = (datetime.utcnow() - pd.Timedelta(days=7)).strftime('%Y%m%d')
    
#     water_data = scraper.get_water_level_data(
#         begin_date=begin_date,
#         end_date=end_date,
#         product='water_level',
#         time_zone='gmt',
#         units='metric'
#     )
    
#     if not water_data.empty:
#         print("\nWater Level Data:")
#         print(water_data.head())
        
#         # Save to CSV
#         output_file = f"water_level_data_{begin_date}_to_{end_date}.csv"
#         water_data.to_csv(output_file, index=False)
#         print(f"\nData saved to {output_file}")
#     else:
#         print("No water level data available for the specified parameters.")
