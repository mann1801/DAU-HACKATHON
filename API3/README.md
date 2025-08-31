# Open-Meteo Air Quality API (API3)

This project provides a Python-based API to fetch air quality (pollution) data using the Open-Meteo Air Quality API.

Docs: https://open-meteo.com/en/docs/air-quality-api

## Features

- Fetch hourly air quality metrics by latitude/longitude
- Optional date range or rolling windows (past_days, forecast_days)
- Current air quality endpoint
- RESTful API with CORS enabled
- Example script to fetch and print recent data
- Optional simple visualization of PM2.5/PM10

## Setup

1. Create/activate a virtual environment (optional) and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the API server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at http://127.0.0.1:8000

## API Endpoints

### Get Hourly Air Quality
```
GET /api/air-quality/hourly
```
Query params:
- `latitude` (float, required)
- `longitude` (float, required)
- `hourly` (csv string, optional; default common pollutants)
- `start_date` (YYYY-MM-DD, optional)
- `end_date` (YYYY-MM-DD, optional)
- `past_days` (int, optional)
- `forecast_days` (int, optional)
- `timezone` (string, default `auto`)

Example:
```
/api/air-quality/hourly?latitude=40.71&longitude=-74.00&past_days=2&hourly=pm2_5,pm10,ozone
```

### Get Current Air Quality
```
GET /api/air-quality/current
```
Query params:
- `latitude` (float, required)
- `longitude` (float, required)
- `current` (csv string, optional; default common pollutants)
- `timezone` (string, default `auto`)

## Example Usage (Script)

Run the example client to print latest 48 hours:
```bash
python fetch_live_data.py
```

## Notes
- Open-Meteo is free and requires no API key.
- Available variables and details: https://open-meteo.com/en/docs/air-quality-api

## License
MIT
