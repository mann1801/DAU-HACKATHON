import requests
import pandas as pd
from datetime import datetime, timedelta

def fetch_live_air_quality(latitude=40.71, longitude=-74.00, past_days=2):
    """
    Fetch recent hourly air quality for given lat/lon from the local API3 FastAPI service.
    """
    print(f"Fetching air quality for lat={latitude}, lon={longitude}, past_days={past_days}...")
    try:
        resp = requests.get(
            "http://127.0.0.1:8001/api/air-quality/hourly",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "past_days": past_days,
                "hourly": "pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,european_aqi"
            },
            timeout=20,
        )
        if resp.status_code != 200:
            print("Error:", resp.status_code, resp.text)
            return pd.DataFrame()
        payload = resp.json()
        if payload.get("status") != "success" or not payload.get("data"):
            print("No data available or unexpected response:", payload)
            return pd.DataFrame()
        df = pd.DataFrame(payload["data"]) if isinstance(payload["data"], list) else pd.DataFrame()
        if "time" in df.columns:
            df["time"] = pd.to_datetime(df["time"])  # ensure datetime
        return df
    except Exception as e:
        print("Exception:", e)
        return pd.DataFrame()

if __name__ == "__main__":
    df = fetch_live_air_quality()
    if not df.empty:
        # Show last 48 rows summary
        cols = [c for c in ["time","pm2_5","pm10","european_aqi"] if c in df.columns]
        print(df[cols].tail(48).to_string(index=False))
        if "pm2_5" in df:
            print("\nPM2.5 stats (last 48): min=%.2f max=%.2f avg=%.2f" % (
                df["pm2_5"].tail(48).min(), df["pm2_5"].tail(48).max(), df["pm2_5"].tail(48).mean()
            ))
    else:
        print("No data.")
