from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from noaa_water_level_scraper import NOAOWaterLevelScraper
import uvicorn
import os

app = FastAPI(
    title="NOAA Water Level API",
    description="API for accessing NOAA water level data",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the scraper with a default station (Miami Beach, FL)
scraper = NOAOWaterLevelScraper(station_id="8724580")

class WaterLevelResponse(BaseModel):
    status: str
    data: List[Dict[str, Any]]
    metadata: Dict[str, Any]

@app.get("/")
async def root():
    return {
        "message": "Welcome to the NOAA Water Level API",
        "endpoints": {
            "get_station_info": "/api/station/{station_id}",
            "get_water_level": "/api/water-level/{station_id}",
            "get_available_stations": "/api/stations"
        }
    }

@app.get("/api/station/{station_id}", response_model=Dict[str, Any])
async def get_station_info(station_id: str):
    """
    Get information about a specific station.
    """
    scraper.station_id = station_id
    info = scraper.get_station_info()
    if not info:
        raise HTTPException(status_code=404, detail="Station not found or data unavailable")
    return info

@app.get("/api/water-level/{station_id}", response_model=WaterLevelResponse)
async def get_water_level(
    station_id: str,
    begin_date: str = None,
    end_date: str = None,
    product: str = 'water_level',
    time_zone: str = 'gmt',
    units: str = 'metric'
):
    """
    Get water level data for a specific station.
    
    Args:
        station_id: NOAA station ID
        begin_date: Start date in yyyyMMdd format (default: 1 day ago)
        end_date: End date in yyyyMMdd format (default: today)
        product: Type of data (water_level, predictions, etc.)
        time_zone: Time zone (gmt, lst, lst_ldt)
        units: Units (metric, english)
    """
    try:
        scraper.station_id = station_id
        df = scraper.get_water_level_data(
            begin_date=begin_date,
            end_date=end_date,
            product=product,
            time_zone=time_zone,
            units=units
        )
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data available for the specified parameters")
        
        return {
            "status": "success",
            "data": df.to_dict(orient='records'),
            "metadata": {
                "station_id": station_id,
                "record_count": len(df),
                "time_range": {
                    "start": df['time'].min(),
                    "end": df['time'].max()
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stations")
async def get_available_stations(state: str = None):
    """
    Get a list of available water level stations.
    
    Args:
        state: Optional state abbreviation to filter stations
    """
    try:
        df = scraper.get_available_stations(state=state)
        if df.empty:
            return {"status": "success", "data": [], "message": "Station list not implemented yet"}
        return {"status": "success", "data": df.to_dict(orient='records')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
