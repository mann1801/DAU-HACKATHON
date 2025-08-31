#!/usr/bin/env python3
"""
Test script to demonstrate cyclone visualization with sample data.
"""

from cyclone_visualization import CycloneVisualizer, plot_storm_history
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import os

def create_sample_storm():
    """Create sample storm data for testing."""
    # Current time
    now = datetime.utcnow()
    
    # Sample storm data
    storm = {
        'storm_name': 'SAMPLE',
        'storm_id': 'AL012025',
        'timestamp': now.isoformat() + 'Z',
        'position': {
            'lat': 25.5,
            'lon': -75.0
        },
        'intensity': {
            'category': 'Category 3',
            'wind_speed_knots': 105,
            'wind_speed_mph': 121,
            'pressure_mb': 960
        },
        'movement': {
            'direction': 'WNW',
            'speed_knots': 12,
            'speed_mph': 14
        },
        'forecast': [
            {
                'timestamp': (now + timedelta(hours=6)).isoformat() + 'Z',
                'lat': 26.0,
                'lon': -76.5,
                'wind_speed_knots': 110,
                'pressure_mb': 955
            },
            {
                'timestamp': (now + timedelta(hours=12)).isoformat() + 'Z',
                'lat': 26.5,
                'lon': -78.0,
                'wind_speed_knots': 115,
                'pressure_mb': 950
            },
            {
                'timestamp': (now + timedelta(hours=24)).isoformat() + 'Z',
                'lat': 27.0,
                'lon': -80.0,
                'wind_speed_knots': 120,
                'pressure_mb': 945
            },
            {
                'timestamp': (now + timedelta(hours=36)).isoformat() + 'Z',
                'lat': 27.5,
                'lon': -82.0,
                'wind_speed_knots': 125,
                'pressure_mb': 940
            },
            {
                'timestamp': (now + timedelta(hours=48)).isoformat() + 'Z',
                'lat': 28.0,
                'lon': -84.0,
                'wind_speed_knots': 130,
                'pressure_mb': 935
            }
        ]
    }
    
    # Create historical data (past positions)
    history = []
    for i in range(6, 0, -1):
        history.append({
            'timestamp': (now - timedelta(hours=i*6)).isoformat() + 'Z',
            'position': {
                'lat': 25.5 - (6-i)*0.2,
                'lon': -75.0 + (6-i)*0.5
            },
            'intensity': {
                'category': 'Category ' + str(max(1, 3 - (6-i)//2)),
                'wind_speed_knots': 105 - (6-i)*5,
                'pressure_mb': 960 + (6-i)*2
            }
        })
    
    return storm, history

def main():
    # Create output directory
    output_dir = 'output'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Generate sample data
    storm, history = create_sample_storm()
    
    # 1. Create map with storm track and forecast
    print("🔄 Creating storm track visualization...")
    viz = CycloneVisualizer(bbox=[-90, -70, 20, 35])
    viz.create_map(title="Sample Storm Track")
    viz.plot_storm(storm, show_forecast=True)
    viz.plot_wind_swath(storm)
    viz.add_legend()
    
    # Save the plot
    map_filename = os.path.join(output_dir, 'sample_storm_track.png')
    viz.save_plot(map_filename, dpi=150)
    print(f"✅ Saved map to {os.path.abspath(map_filename)}")
    
    # 2. Create historical intensity plot
    print("\n🔄 Creating historical intensity plot...")
    hist_fig = plot_storm_history(history, title="Sample Storm History")
    if hist_fig:
        hist_filename = os.path.join(output_dir, 'sample_storm_history.png')
        hist_fig.savefig(hist_filename, dpi=150, bbox_inches='tight')
        plt.close(hist_fig)
        print(f"✅ Saved history plot to {os.path.abspath(hist_filename)}")
    
    print("\n🎉 Visualization test complete!")
    print(f"Check the '{output_dir}' directory for output files.")

if __name__ == "__main__":
    main()
