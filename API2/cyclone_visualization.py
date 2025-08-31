#!/usr/bin/env python3
"""
Cyclone Visualization Module

This module provides visualization capabilities for the cyclone alert system,
including storm tracks, forecast paths, and intensity plots.
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from datetime import datetime
import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import matplotlib.patches as mpatches
import matplotlib.colors as mcolors

# Color scheme for different storm categories
STORM_CATEGORIES = {
    'Tropical Depression': {'color': '#00bfff', 'level': 0},
    'Tropical Storm': {'color': '#00ff00', 'level': 1},
    'Category 1': {'color': '#ffff00', 'level': 2},
    'Category 2': {'color': '#ffa500', 'level': 3},
    'Category 3': {'color': '#ff4500', 'level': 4},
    'Category 4': {'color': '#ff0000', 'level': 5},
    'Category 5': {'color': '#8b00ff', 'level': 6},
    'Unknown': {'color': '#808080', 'level': -1}
}

class CycloneVisualizer:
    """Class for visualizing cyclone data and forecasts."""
    
    def __init__(self, bbox=None):
        """
        Initialize the visualizer with an optional bounding box.
        
        Args:
            bbox: Optional bounding box [min_lon, max_lon, min_lat, max_lat]
        """
        self.bbox = bbox or [-100, -50, 10, 50]  # Default to Atlantic basin
        self.projection = ccrs.PlateCarree()
        self.fig = None
        self.ax = None
    
    def create_map(self, title="Active Tropical Cyclones"):
        """Create a map with coastlines and other features."""
        self.fig, self.ax = plt.subplots(
            figsize=(12, 8),
            subplot_kw={'projection': ccrs.PlateCarree()}
        )
        
        # Add map features
        self.ax.add_feature(cfeature.LAND)
        self.ax.add_feature(cfeature.OCEAN)
        self.ax.add_feature(cfeature.COASTLINE)
        self.ax.add_feature(cfeature.BORDERS, linestyle=':')
        self.ax.add_feature(cfeature.STATES, linestyle=':')
        
        # Add gridlines and labels
        self.ax.gridlines(draw_labels=True, linewidth=0.5, color='gray', alpha=0.5)
        
        # Set the map bounds
        self.ax.set_extent(self.bbox, crs=self.projection)
        
        # Add title
        self.ax.set_title(
            f"{title}\n{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            fontsize=14, pad=20
        )
        
        return self.fig, self.ax
    
    def plot_storm(self, storm_data: Dict, show_forecast: bool = True):
        """
        Plot a single storm's track and forecast.
        
        Args:
            storm_data: Dictionary containing storm data
            show_forecast: Whether to show forecast track
        """
        if not self.ax:
            self.create_map()
        
        # Extract storm data
        storm_name = storm_data.get('storm_name', 'UNKNOWN')
        category = storm_data.get('intensity', {}).get('category', 'Unknown')
        
        # Get current position
        pos = storm_data.get('position', {})
        lat, lon = pos.get('lat'), pos.get('lon')
        
        if lat is None or lon is None:
            print(f"Warning: No position data for {storm_name}")
            return
        
        # Get color based on storm category
        cat_info = STORM_CATEGORIES.get(category, STORM_CATEGORIES['Unknown'])
        color = cat_info['color']
        
        # Plot current position
        self.ax.plot(
            lon, lat, 'o',
            color=color,
            markersize=12,
            markeredgecolor='black',
            transform=self.projection,
            zorder=10
        )
        
        # Add storm name and category
        name_text = f"{storm_name} ({category})"
        self.ax.text(
            lon + 0.5, lat + 0.5, name_text,
            fontsize=10, fontweight='bold',
            bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'),
            transform=self.projection,
            zorder=11
        )
        
        # Plot forecast track if available
        if show_forecast and 'forecast' in storm_data and storm_data['forecast']:
            forecast = storm_data['forecast']
            if len(forecast) > 1:
                # Extract forecast positions
                lons = [lon] + [p.get('lon') for p in forecast]
                lats = [lat] + [p.get('lat') for p in forecast]
                
                # Plot forecast line
                self.ax.plot(
                    lons, lats, '--',
                    color=color,
                    linewidth=2,
                    alpha=0.7,
                    transform=self.projection,
                    zorder=5
                )
                
                # Add forecast points
                for i, point in enumerate(forecast, 1):
                    self.ax.plot(
                        point.get('lon'), point.get('lat'),
                        'o',
                        color=color,
                        markersize=8,
                        alpha=0.7,
                        transform=self.projection,
                        zorder=6
                    )
                    
                    # Add forecast time if available
                    if 'timestamp' in point:
                        try:
                            time_str = datetime.fromisoformat(point['timestamp']).strftime('%m/%d %HZ')
                            self.ax.text(
                                point.get('lon') + 0.2, point.get('lat') - 0.2, time_str,
                                fontsize=8,
                                bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'),
                                transform=self.projection,
                                zorder=11
                            )
                        except (ValueError, KeyError):
                            pass
    
    def add_legend(self):
        """Add a legend for storm categories."""
        if not self.ax:
            return
            
        legend_patches = []
        for cat, info in sorted(STORM_CATEGORIES.items(), key=lambda x: x[1]['level'], reverse=True):
            if cat != 'Unknown':
                patch = mpatches.Patch(color=info['color'], label=cat)
                legend_patches.append(patch)
        
        if legend_patches:
            self.ax.legend(
                handles=legend_patches,
                title='Storm Categories',
                loc='lower right',
                framealpha=1.0
            )
    
    def save_plot(self, filename: str = 'cyclone_track.png', dpi: int = 150):
        """Save the current plot to a file."""
        if self.fig:
            self.fig.savefig(filename, dpi=dpi, bbox_inches='tight')
            print(f"Plot saved to {filename}")
    
    def plot_wind_swath(self, storm_data: Dict):
        """Plot the wind swath for a tropical cyclone."""
        if not self.ax:
            self.create_map()
            
        # This is a simplified version - in a real application, you would use
        # actual wind field data from the forecast models
        pos = storm_data.get('position', {})
        lat, lon = pos.get('lat'), pos.get('lon')
        
        if lat is None or lon is None:
            return
            
        # Create a simple circular wind swath
        # In a real application, you would use actual wind radii data
        wind_speed = storm_data.get('intensity', {}).get('wind_speed_knots', 0)
        if wind_speed < 34:  # Not a tropical storm yet
            return
            
        # Define wind radii (simplified)
        radii = {
            '34': 200,  # 34-kt wind radius in km
            '50': 100,  # 50-kt wind radius in km
            '64': 50    # 64-kt wind radius in km
        }
        
        # Plot wind swaths (from smallest to largest)
        for speed, radius in sorted(radii.items(), key=lambda x: int(x[0]), reverse=True):
            if wind_speed >= int(speed):
                alpha = 0.3 - (0.1 * (int(speed) - 34) / 30)  # Vary opacity
                circle = plt.Circle(
                    (lon, lat), radius / 111,  # Convert km to degrees (approx)
                    color='red',
                    alpha=alpha,
                    transform=self.projection,
                    zorder=1
                )
                self.ax.add_patch(circle)
                
                # Add label
                if speed == '34':
                    self.ax.text(
                        lon + radius/111, lat, f'{speed}+ kt',
                        fontsize=8,
                        bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'),
                        transform=self.projection,
                        zorder=11
                    )

def plot_storm_history(storm_history: List[Dict], title: str = "Storm History"):
    """
    Plot the historical intensity and track of a storm.
    
    Args:
        storm_history: List of storm observations over time
        title: Plot title
    
    Returns:
        matplotlib.figure.Figure: The figure containing the plots
    """
    if not storm_history:
        print("No storm history data to plot")
        return None
    
    # Create figure with subplots
    fig = plt.figure(figsize=(12, 14))
    gs = fig.add_gridspec(2, 1, height_ratios=[2, 1])
    
    # First subplot for intensity
    ax1 = fig.add_subplot(gs[0])
    
    # Extract data
    times = []
    wind_speeds = []
    pressures = []
    lats = []
    lons = []
    
    for obs in storm_history:
        try:
            time_str = obs.get('timestamp')
            if not time_str:
                continue
                
            times.append(pd.to_datetime(time_str))
            wind_speeds.append(obs.get('intensity', {}).get('wind_speed_knots', 0))
            pressures.append(obs.get('intensity', {}).get('pressure_mb', 1013))
            
            pos = obs.get('position', {})
            lats.append(pos.get('lat', 0))
            lons.append(pos.get('lon', 0))
        except (ValueError, AttributeError) as e:
            print(f"Error processing observation: {e}")
    
    if not times:
        print("No valid time data in storm history")
        return None
    
    # Plot intensity (wind speed and pressure)
    ax1b = ax1.twinx()
    
    # Wind speed
    color = 'tab:red'
    ax1.set_xlabel('Time')
    ax1.set_ylabel('Wind Speed (knots)', color=color)
    ax1.plot(times, wind_speeds, color=color, marker='o', label='Wind Speed')
    ax1.tick_params(axis='y', labelcolor=color)
    
    # Pressure
    color = 'tab:blue'
    ax1b.set_ylabel('Pressure (mb)', color=color)
    ax1b.plot(times, pressures, color=color, marker='x', linestyle='--', label='Pressure')
    ax1b.invert_yaxis()  # Lower pressure at top
    ax1b.tick_params(axis='y', labelcolor=color)
    
    # Add storm category areas
    ymin, ymax = ax1.get_ylim()
    for cat, info in STORM_CATEGORIES.items():
        if cat == 'Unknown':
            continue
            
        if cat == 'Tropical Depression':
            ax1.axhspan(0, 34, color=info['color'], alpha=0.1, label=cat)
        elif cat == 'Tropical Storm':
            ax1.axhspan(34, 64, color=info['color'], alpha=0.1, label=cat)
        else:
            # For hurricanes, use the Saffir-Simpson scale
            cat_num = int(cat.split()[-1])
            lower = 64 + (cat_num - 1) * 19
            upper = 64 + (cat_num) * 19 if cat_num < 5 else 1000
            ax1.axhspan(lower, upper, color=info['color'], alpha=0.1, label=cat)
    
    ax1.set_ylim(ymin, ymax)
    ax1.set_title(f"{title} - Intensity")
    
    # Add legend
    handles1, labels1 = ax1.get_legend_handles_labels()
    handles2, labels2 = ax1b.get_legend_handles_labels()
    ax1.legend(handles1 + handles2, labels1 + labels2, loc='upper left')
    
    # Plot track if we have valid coordinates
    if any(lats) and any(lons):
        # Create second subplot with Cartopy projection
        ax2 = fig.add_subplot(gs[1], projection=ccrs.PlateCarree())
        
        # Add map features
        ax2.add_feature(cfeature.LAND, facecolor='lightgray')
        ax2.add_feature(cfeature.OCEAN, facecolor='lightblue')
        ax2.add_feature(cfeature.COASTLINE)
        ax2.add_feature(cfeature.BORDERS, linestyle=':')
        ax2.add_feature(cfeature.STATES, linestyle=':')
        
        # Plot the track
        ax2.plot(lons, lats, 'k-', linewidth=2, label='Track', transform=ccrs.PlateCarree())
        ax2.plot(lons[0], lats[0], 'go', markersize=8, label='Start', transform=ccrs.PlateCarree())
        ax2.plot(lons[-1], lats[-1], 'ro', markersize=8, label='Current', transform=ccrs.PlateCarree())
        
        # Add grid lines and labels
        gl = ax2.gridlines(draw_labels=True, linewidth=0.5, color='gray', alpha=0.5)
        gl.top_labels = False
        gl.right_labels = False
        
        # Set the map bounds with some padding
        min_lon, max_lon = min(lons), max(lons)
        min_lat, max_lat = min(lats), max(lats)
        padding = 5  # degrees
        ax2.set_extent([
            min_lon - padding, 
            max_lon + padding, 
            min_lat - padding, 
            max_lat + padding
        ])
        
        ax2.set_title('Storm Track')
        ax2.legend(loc='lower right')
    
    plt.tight_layout()
    return fig

# Example usage
if __name__ == "__main__":
    # Example storm data
    sample_storm = {
        'storm_name': 'SAMPLE',
        'storm_id': 'AL012025',
        'timestamp': '2025-08-30T12:00:00Z',
        'position': {'lat': 25.5, 'lon': -75.0},
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
            {'timestamp': '2025-08-30T18:00:00Z', 'lat': 26.0, 'lon': -76.5},
            {'timestamp': '2025-08-31T06:00:00Z', 'lat': 26.5, 'lon': -78.0},
            {'timestamp': '2025-08-31T18:00:00Z', 'lat': 27.0, 'lon': -79.5},
            {'timestamp': '2025-09-01T06:00:00Z', 'lat': 27.5, 'lon': -81.0},
            {'timestamp': '2025-09-01T18:00:00Z', 'lat': 28.0, 'lon': -82.5}
        ]
    }
    
    # Create visualization
    viz = CycloneVisualizer(bbox=[-100, -60, 15, 45])
    viz.create_map()
    viz.plot_storm(sample_storm)
    viz.add_legend()
    viz.save_plot('sample_cyclone_track.png')
    
    # Show the plot
    plt.show()
