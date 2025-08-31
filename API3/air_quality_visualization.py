import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import requests
from datetime import datetime

sns.set(style="whitegrid")

API_URL = "http://127.0.0.1:8001/api/air-quality/hourly"

def fetch_hourly(latitude=40.71, longitude=-74.00, past_days=2, hourly_vars=None) -> pd.DataFrame:
    hourly_vars = hourly_vars or ["pm2_5", "pm10", "european_aqi"]
    try:
        resp = requests.get(
            API_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "past_days": past_days,
                "hourly": ",".join(hourly_vars),
            },
            timeout=20,
        )
        resp.raise_for_status()
        payload = resp.json()
        if payload.get("status") != "success" or not payload.get("data"):
            raise RuntimeError("Local API returned no data")
        df = pd.DataFrame(payload["data"]) if isinstance(payload["data"], list) else pd.DataFrame()
        if not df.empty and "time" in df.columns:
            df["time"] = pd.to_datetime(df["time"])
        print("Fetched data from local API on port 8001")
        return df
    except Exception as e:
        print("Local API unavailable, falling back to Open-Meteo:", e)
        # Direct Open-Meteo fallback
        try:
            direct_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
            resp = requests.get(
                direct_url,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "past_days": past_days,
                    "hourly": ",".join(hourly_vars),
                    "timezone": "auto",
                },
                timeout=20,
            )
            resp.raise_for_status()
            data = resp.json()
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])
            if not times:
                return pd.DataFrame()
            df = pd.DataFrame({"time": pd.to_datetime(times)})
            for var in hourly_vars:
                if var in hourly:
                    df[var] = hourly[var]
            print("Fetched data directly from Open-Meteo API")
            return df
        except Exception as e2:
            print("Fallback failed:", e2)
            return pd.DataFrame()


def plot_pm(df: pd.DataFrame, latitude: float, longitude: float):
    if df.empty:
        print("No data to plot.")
        return

    plt.figure(figsize=(14, 7))

    if "pm2_5" in df.columns:
        plt.plot(df["time"], df["pm2_5"], label="PM2.5", linewidth=2)
    if "pm10" in df.columns:
        plt.plot(df["time"], df["pm10"], label="PM10", linewidth=2)

    plt.title(f"PM Concentrations (lat={latitude}, lon={longitude})\n{df['time'].min().date()} to {df['time'].max().date()}")
    plt.xlabel("Time")
    plt.ylabel("Concentration (µg/m³)")
    plt.legend()
    plt.tight_layout()

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = f"air_quality_{latitude}_{longitude}_{ts}.png"
    plt.savefig(out, dpi=300, bbox_inches="tight")
    print("Saved plot:", out)
    # Use non-interactive backend; skip GUI display
    plt.close()


if __name__ == "__main__":
    lat, lon = 40.71, -74.00
    df = fetch_hourly(lat, lon, past_days=2)
    plot_pm(df, lat, lon)
