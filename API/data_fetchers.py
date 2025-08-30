# ======================================================
# data_fetchers.py
# Centralized file for all external data ingestion
# ======================================================

import requests
import pandas as pd
import geopandas as gpd
import os

# -----------------------------------------------
# 1. SATELLITE DATA (NASA MODIS, ESA Copernicus, ISRO Bhuvan)
# -----------------------------------------------

def fetch_nasa_modis():
    """
    Simulated fetch for NASA MODIS satellite data.
    In real use, requires Earthdata login and APIs.
    """
    data = {
        "location": ["Bay of Bengal", "Arabian Sea"],
        "chlorophyll": [1.2, 0.8],
        "sea_surface_temp": [29.5, 27.8]
    }
    return pd.DataFrame(data)


def fetch_esa_copernicus():
    """
    Simulated fetch for ESA Copernicus data.
    """
    data = {
        "location": ["Goa Coast", "Chennai Coast"],
        "wave_height": [2.3, 1.7],
        "salinity": [35.1, 34.8]
    }
    return pd.DataFrame(data)


def fetch_isro_bhuvan():
    """
    Simulated fetch for ISRO Bhuvan datasets.
    """
    data = {
        "location": ["Mumbai Coast", "Kerala Coast"],
        "erosion_rate": [0.3, 0.5],
        "land_cover_change": ["High", "Medium"]
    }
    return pd.DataFrame(data)


# -----------------------------------------------
# 2. WEATHER DATA (IMD / NOAA / OpenWeatherMap)
# -----------------------------------------------

def fetch_weather_data():
    """
    Simulated fetch for weather datasets.
    Replace with actual API calls to IMD/NOAA/OWM.
    """
    data = {
        "location": ["Mumbai", "Kolkata"],
        "temperature": [32, 30],
        "humidity": [78, 82],
        "wind_speed": [15, 20]
    }
    return pd.DataFrame(data)


# -----------------------------------------------
# 3. OCEAN & TIDE DATA
# -----------------------------------------------

def fetch_ocean_data():
    """
    Simulated fetch for ocean tide/sea-level datasets.
    """
    data = {
        "station": ["Vizag", "Paradip"],
        "tide_level": [3.2, 2.7],
        "sea_level_rise_rate": [4.1, 3.8]
    }
    return pd.DataFrame(data)


# -----------------------------------------------
# 4. POLLUTION DATA (CPCB / Sentinel-5P)
# -----------------------------------------------

def fetch_pollution_data():
    """
    Simulated fetch for marine/coastal pollution datasets.
    """
    data = {
        "location": ["Mumbai", "Chennai"],
        "oil_spill_index": [0.2, 0.4],
        "plastic_density": [120, 180]
    }
    return pd.DataFrame(data)


# -----------------------------------------------
# 5. ILLEGAL ACTIVITY DATA (AIS / Satellite)
# -----------------------------------------------

def fetch_illegal_activity_data():
    """
    Simulated fetch for illegal coastal activity data.
    """
    data = {
        "region": ["Andaman", "Lakshadweep"],
        "illegal_fishing": [True, False],
        "ship_intrusion": [2, 0]
    }
    return pd.DataFrame(data)


# ======================================================
# MASTER FETCH FUNCTION
# ======================================================

def fetch_all_sources():
    """
    Runs all data fetchers and returns them in a dictionary.
    """
    return {
        "nasa_modis": fetch_nasa_modis(),
        "esa_copernicus": fetch_esa_copernicus(),
        "isro_bhuvan": fetch_isro_bhuvan(),
        "weather": fetch_weather_data(),
        "ocean": fetch_ocean_data(),
        "pollution": fetch_pollution_data(),
        "illegal_activity": fetch_illegal_activity_data()
    }
