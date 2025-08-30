import requests
from datetime import datetime, timedelta
import pandas as pd

def fetch_live_water_level(station_id="8724580", days=31):
    """
    Fetch live water level data for the specified station.
    
    Args:
        station_id (str): NOAA station ID (default: "8724580" for Miami Beach, FL)
        days (int): Number of days of data to fetch (default: 31)
    """
    # Calculate date range
    end_date = datetime.utcnow()
    begin_date = end_date - timedelta(days=days)
    
    # Format dates for API
    begin_str = begin_date.strftime('%Y%m%d %H:%M')
    end_str = end_date.strftime('%Y%m%d %H:%M')
    
    print(f"Fetching data for station {station_id} from {begin_str} to {end_str}...")
    
    try:
        # Make API request
        response = requests.get(
            f"http://127.0.0.1:8000/api/water-level/{station_id}",
            params={
                'begin_date': begin_date.strftime('%Y%m%d'),
                'end_date': end_date.strftime('%Y%m%d'),
                'time_zone': 'gmt',
                'units': 'metric'
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success' and data['data']:
                # Convert to DataFrame for better display
                df = pd.DataFrame(data['data'])
                
                # Convert timestamp to readable format
                if 'time' in df.columns:
                    df['time'] = pd.to_datetime(df['time'])
                
                # Clean and sort data
                df = df.dropna(subset=['v', 'time'])
                df['v'] = pd.to_numeric(df['v'], errors='coerce')
                df = df.sort_values('time')
                
                # Remove any potential duplicates
                df = df.drop_duplicates(subset=['time'])
                
                print(f"\nLatest {min(len(df), 200)} Water Level Data Points:")
                print("-" * 70)
                print(df[['time', 'v', 's', 'q']].tail(200).to_string(index=False))
                
                # Calculate statistics
                water_levels = df['v']
                avg_level = water_levels.mean()
                max_level = water_levels.max()
                min_level = water_levels.min()
                current_level = water_levels.iloc[-1]
                
                print("\n" + "="*50)
                print("WATER LEVEL STATISTICS")
                print("="*50)
                print(f"Current Water Level: {current_level:.3f} meters")
                print(f"Minimum Level: {min_level:.3f} meters")
                print(f"Maximum Level: {max_level:.3f} meters")
                print(f"Average Level: {avg_level:.3f} meters")
                
                # Alert system
                threshold = avg_level + (avg_level * 0.1)  # 10% above average
                if current_level > threshold:
                    print("\n" + "!"*50)
                    print(f"ALERT: Water level is {current_level/avg_level*100-100:.1f}% above average!")
                    print(f"Current: {current_level:.3f}m | Average: {avg_level:.3f}m")
                    print("!"*50)
                
                # Print highest and lowest points
                max_row = df[df['v'] == max_level].iloc[0]
                min_row = df[df['v'] == min_level].iloc[0]
                
                print("\n" + "-"*50)
                print(f"HIGHEST LEVEL: {max_level:.3f}m at {max_row['time']}")
                print(f"LOWEST LEVEL: {min_level:.3f}m at {min_row['time']}")
                print("-"*50)
                
                return df
            else:
                print("No data available or error in response.")
                print(f"Response: {data}")
        else:
            print(f"Error fetching data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    # Example: Fetch last 31 days of data for Miami Beach (8724580)
    fetch_live_water_level(station_id="8724580", days=31)
