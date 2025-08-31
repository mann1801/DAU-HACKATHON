from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from pydantic import BaseModel
from air_quality_scraper import OpenMeteoAirQualityScraper
import uvicorn

app = FastAPI(
    title="Open-Meteo Air Quality API",
    description="API for accessing air quality data (PM2.5, PM10, O3, NO2, SO2, CO, UV, AQI) from Open-Meteo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default: New York City
scraper = OpenMeteoAirQualityScraper(latitude=40.7128, longitude=-74.0060)

class HourlyQuery(BaseModel):
    latitude: float
    longitude: float
    hourly: Optional[str] = None  # csv string
    start_date: Optional[str] = None  # YYYY-MM-DD
    end_date: Optional[str] = None
    past_days: Optional[int] = None
    forecast_days: Optional[int] = None
    timezone: Optional[str] = "auto"

class CurrentQuery(BaseModel):
    latitude: float
    longitude: float
    current: Optional[str] = None  # csv string
    timezone: Optional[str] = "auto"

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Open-Meteo Air Quality API",
        "endpoints": {
            "hourly": "/api/air-quality/hourly",
            "current": "/api/air-quality/current",
        },
        "docs": "https://open-meteo.com/en/docs/air-quality-api",
    }

@app.get("/api/air-quality/hourly")
async def get_hourly_air_quality(
    latitude: float,
    longitude: float,
    hourly: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    past_days: Optional[int] = None,
    forecast_days: Optional[int] = None,
    timezone: Optional[str] = "auto",
):
    try:
        scraper.latitude = latitude
        scraper.longitude = longitude
        scraper.timezone = timezone or scraper.timezone
        hourly_vars = [v.strip() for v in hourly.split(",")] if hourly else None
        df = scraper.get_hourly(
            hourly=hourly_vars,
            start_date=start_date,
            end_date=end_date,
            past_days=past_days,
            forecast_days=forecast_days,
            timezone=timezone,
        )
        if df.empty:
            return {"status": "success", "data": [], "metadata": {"count": 0}}
        return {
            "status": "success",
            "data": df.to_dict(orient="records"),
            "metadata": {
                "latitude": latitude,
                "longitude": longitude,
                "count": len(df),
                "time_range": {
                    "start": df["time"].min().isoformat() if "time" in df else None,
                    "end": df["time"].max().isoformat() if "time" in df else None,
                },
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/air-quality/current")
async def get_current_air_quality(
    latitude: float,
    longitude: float,
    current: Optional[str] = None,
    timezone: Optional[str] = "auto",
):
    try:
        scraper.latitude = latitude
        scraper.longitude = longitude
        scraper.timezone = timezone or scraper.timezone
        current_vars = [v.strip() for v in current.split(",")] if current else None
        data = scraper.get_current(current=current_vars, timezone=timezone)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
