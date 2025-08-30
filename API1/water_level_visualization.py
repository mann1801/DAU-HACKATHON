import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import requests
import seaborn as sns
from matplotlib.ticker import MaxNLocator

# Set the style for better-looking plots
sns.set(style="whitegrid")

def fetch_water_level_data(station_id="8724580", days=7):
    """Fetch water level data from the NOAA API."""
    end_date = datetime.utcnow()
    begin_date = end_date - timedelta(days=days)
    
    params = {
        'begin_date': begin_date.strftime('%Y%m%d'),
        'end_date': end_date.strftime('%Y%m%d'),
        'station': station_id,
        'product': 'water_level',
        'application': 'web_services',
        'format': 'json',
        'time_zone': 'gmt',
        'units': 'metric',
        'datum': 'MLLW'
    }
    
    try:
        response = requests.get(
            "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
            params=params
        )
        response.raise_for_status()
        data = response.json()
        
        if 'data' in data and data['data']:
            df = pd.DataFrame(data['data'])
            df['time'] = pd.to_datetime(df['t'])
            df['v'] = pd.to_numeric(df['v'])
            df = df[['time', 'v', 's', 'q']].dropna()
            return df
        else:
            print("No data available for the specified parameters.")
            return pd.DataFrame()
            
    except Exception as e:
        print(f"Error fetching data: {e}")
        return pd.DataFrame()

def plot_water_levels(df, station_id):
    """Create and save water level visualization."""
    if df.empty:
        print("No data to plot.")
        return
    
    plt.figure(figsize=(15, 8))
    
    # Plot the water levels
    plt.plot(df['time'], df['v'], 
             label='Water Level', 
             color='#1f77b4', 
             linewidth=2)
    
    # Add horizontal line for mean water level
    mean_level = df['v'].mean()
    plt.axhline(y=mean_level, 
                color='r', 
                linestyle='--', 
                label=f'Mean Level: {mean_level:.2f} m')
    
    # Calculate and plot 24-hour moving average
    df['24h_ma'] = df['v'].rolling(window=24, min_periods=1).mean()
    plt.plot(df['time'], df['24h_ma'], 
             label='24h Moving Avg', 
             color='#ff7f0e', 
             linestyle='-', 
             linewidth=2)
    
    # Highlight high and low tides
    max_idx = df['v'].idxmax()
    min_idx = df['v'].idxmin()
    
    plt.scatter(df.loc[max_idx, 'time'], df.loc[max_idx, 'v'], 
                color='red', 
                s=100, 
                zorder=5, 
                label=f'Max: {df.loc[max_idx, "v"]:.2f}m')
    
    plt.scatter(df.loc[min_idx, 'time'], df.loc[min_idx, 'v'], 
                color='green', 
                s=100, 
                zorder=5, 
                label=f'Min: {df.loc[min_idx, "v"]:.2f}m')
    
    # Format the plot
    plt.title(f'Water Level at Station {station_id}\n{df["time"].min().strftime("%Y-%m-%d")} to {df["time"].max().strftime("%Y-%m-%d")}', 
              fontsize=14, 
              pad=20)
    plt.xlabel('Date and Time', fontsize=12)
    plt.ylabel('Water Level (meters, MLLW)', fontsize=12)
    
    # Format x-axis to show dates nicely
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d\n%H:%M'))
    plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())
    plt.gcf().autofmt_xdate()
    
    # Add grid and legend
    plt.grid(True, alpha=0.3)
    plt.legend(loc='upper right')
    
    # Add some padding
    plt.tight_layout()
    
    # Save the plot
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"water_level_{station_id}_{timestamp}.png"
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Plot saved as {filename}")
    
    # Show the plot
    plt.show()

def main():
    # Get user input or use defaults
    station_id = input("Enter station ID (default 8724580 for Miami Beach): ") or "8724580"
    days = int(input("Enter number of days of data to fetch (default 7): ") or "7")
    
    print(f"\nFetching water level data for station {station_id}...")
    water_data = fetch_water_level_data(station_id, days)
    
    if not water_data.empty:
        print(f"Successfully fetched {len(water_data)} data points.")
        plot_water_levels(water_data, station_id)
    else:
        print("No data available to plot.")

if __name__ == "__main__":
    main()
