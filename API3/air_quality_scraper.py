import requests
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime


class OpenMeteoAirQualityScraper:
    """
    Scraper/wrapper for Open-Meteo Air Quality API
    Docs: https://open-meteo.com/en/docs/air-quality-api
    """

    BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

    def __init__(self,
                 latitude: float = 40.7128,
                 longitude: float = -74.0060,
                 timezone: str = "auto"):
        self.latitude = latitude
        self.longitude = longitude
        self.timezone = timezone
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; API3-AirQuality/1.0)"
        })

    @staticmethod
    def _default_hourly() -> List[str]:
        return [
            "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide",
            "sulphur_dioxide", "ozone", "uv_index", "uv_index_clear_sky",
            "european_aqi"
        ]

    @staticmethod
    def _default_current() -> List[str]:
        # Open-Meteo supports current variables as well
        return [
            "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide",
            "sulphur_dioxide", "ozone", "uv_index", "uv_index_clear_sky",
            "european_aqi"
        ]

    def get_hourly(self,
                   hourly: Optional[List[str]] = None,
                   start_date: Optional[str] = None,
                   end_date: Optional[str] = None,
                   past_days: Optional[int] = None,
                   forecast_days: Optional[int] = None,
                   timezone: Optional[str] = None) -> pd.DataFrame:
        """
        Fetch hourly air quality data and return as DataFrame with a 'time' column.
        Dates must be in YYYY-MM-DD format if provided.
        """
        params: Dict[str, Any] = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": timezone or self.timezone,
            "hourly": ",".join(hourly or self._default_hourly()),
        }
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        if past_days is not None:
            params["past_days"] = past_days
        if forecast_days is not None:
            params["forecast_days"] = forecast_days

        resp = self.session.get(self.BASE_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        if "hourly" not in data or not data["hourly"]:
            return pd.DataFrame()

        hourly_obj = data["hourly"]
        times = hourly_obj.get("time", [])
        df = pd.DataFrame({"time": pd.to_datetime(times)})

        for var, series in hourly_obj.items():
            if var == "time":
                continue
            df[var] = series

        return df

    def get_current(self,
                    current: Optional[List[str]] = None,
                    timezone: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch current air quality metrics. Returns a JSON-like dict with values and time.
        """
        params: Dict[str, Any] = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": timezone or self.timezone,
            "current": ",".join(current or self._default_current()),
        }

        resp = self.session.get(self.BASE_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        # Some responses use `current` while others may embed current values differently if unsupported.
        return data.get("current", data)


if __name__ == "__main__":
    scraper = OpenMeteoAirQualityScraper(latitude=40.71, longitude=-74.0)
    df = scraper.get_hourly(past_days=2)
    print(df.head())
    cur = scraper.get_current()
    print(cur)
