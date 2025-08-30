import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import requests
import tkinter as tk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.dates as mdates
import seaborn as sns

# Configuration
STATION_ID = "8724580"  # Miami Beach, FL
DAYS = 7                # Number of days of data to fetch

# Set the style for better-looking plots
sns.set(style="whitegrid")
plt.style.use('seaborn-v0_8')

def fetch_water_level_data():
    """Fetch water level data from NOAA API."""
    end_date = datetime.utcnow()
    begin_date = end_date - timedelta(days=DAYS)
    
    params = {
        'begin_date': begin_date.strftime('%Y%m%d'),
        'end_date': end_date.strftime('%Y%m%d'),
        'station': STATION_ID,
        'product': 'water_level',
        'application': 'web_services',
        'format': 'json',
        'time_zone': 'gmt',
        'units': 'metric',
        'datum': 'MLLW'
    }
    
    try:
        response = requests.get("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
                              params=params,
                              timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'data' in data and data['data']:
            df = pd.DataFrame(data['data'])
            df['time'] = pd.to_datetime(df['t'])
            df['water_level'] = pd.to_numeric(df['v'])
            df = df[['time', 'water_level']].dropna()
            return df
            
    except Exception as e:
        print(f"Error fetching data: {e}")
    
    return pd.DataFrame()

def create_visualization(df):
    """Create and display water level visualization in a popup window."""
    if df.empty:
        print("No data available to plot.")
        return False
    
    # Create the main window
    root = tk.Tk()
    root.title(f"Water Level - Station {STATION_ID}")
    root.geometry("1000x700")
    
    # Calculate statistics
    mean_level = df['water_level'].mean()
    max_level = df['water_level'].max()
    min_level = df['water_level'].min()
    current_level = df['water_level'].iloc[-1]
    
    # Create the figure and axis
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Plot water levels
    ax.plot(df['time'], df['water_level'], 
            label='Water Level', 
            color='#1a5276',
            linewidth=2)
    
    # Add reference lines and markers
    ax.axhline(mean_level, color='#e74c3c', linestyle='--', 
               label=f'Mean: {mean_level:.2f}m')
    
    # Add max/min markers
    max_time = df.loc[df['water_level'].idxmax(), 'time']
    min_time = df.loc[df['water_level'].idxmin(), 'time']
    
    ax.scatter(max_time, max_level, color='#e74c3c', s=100, 
               label=f'Max: {max_level:.2f}m')
    ax.scatter(min_time, min_level, color='#27ae60', s=100,
               label=f'Min: {min_level:.2f}m')
    
    # Format the plot
    ax.set_title(f'Water Level at Miami Beach (Station {STATION_ID})\n' 
                f"{df['time'].min().strftime('%b %d')} to {df['time'].max().strftime('%b %d, %Y')}",
                pad=15)
    
    ax.set_xlabel('Date and Time')
    ax.set_ylabel('Water Level (meters, MLLW)')
    
    # Format x-axis
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d\n%H:%M'))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    fig.autofmt_xdate()
    
    # Add grid and legend
    ax.grid(True, alpha=0.3)
    ax.legend()
    
    # Add current level annotation
    ax.annotate(f'Current: {current_level:.2f}m',
                xy=(df['time'].iloc[-1], current_level),
                xytext=(10, 10),
                textcoords='offset points',
                bbox=dict(boxstyle='round,pad=0.5', fc='white', alpha=0.8))
    
    # Create a canvas and add it to the window
    canvas = FigureCanvasTkAgg(fig, master=root)
    canvas.draw()
    canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
    
    # Add a close button
    close_button = tk.Button(root, text="Close", command=root.destroy)
    close_button.pack(pady=10)
    
    # Make the window responsive
    def on_resize(event):
        fig.tight_layout()
        canvas.draw()
    
    root.bind('<Configure>', on_resize)
    
    # Center the window on screen
    window_width = root.winfo_reqwidth()
    window_height = root.winfo_reqheight()
    position_right = int(root.winfo_screenwidth()/2 - window_width/2)
    position_down = int(root.winfo_screenheight()/2 - window_height/2)
    root.geometry(f"+{position_right}+{position_down}")
    
    # Start the GUI event loop
    root.mainloop()
    plt.close(fig)
    return True

def main():
    print(f"Fetching {DAYS} days of water level data for station {STATION_ID}...")
    water_data = fetch_water_level_data()
    
    if not water_data.empty:
        print(f"Successfully fetched {len(water_data)} data points.")
        print("Displaying visualization...")
        create_visualization(water_data)
    else:
        print("No data available to display.")
        # Show error in a message box if no data
        root = tk.Tk()
        root.withdraw()  # Hide the main window
        tk.messagebox.showerror("Error", "No water level data available to display.")
        root.destroy()

if __name__ == "__main__":
    main()
