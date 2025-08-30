# NOAA Water Level API

This project provides a Python-based API to fetch water level data from NOAA's Tides and Currents service.

## Features

- Fetch water level data for any NOAA station
- Get station information
- Filter data by date range
- Support for different time zones and units
- RESTful API interface

## Setup

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the API server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://127.0.0.1:8000`

## API Endpoints

### Get Station Information
```
GET /api/station/{station_id}
```

### Get Water Level Data
```
GET /api/water-level/{station_id}
```

Parameters:
- `begin_date`: Start date in yyyyMMdd format (default: 1 day ago)
- `end_date`: End date in yyyyMMdd format (default: today)
- `product`: Type of data (default: 'water_level')
- `time_zone`: Time zone (default: 'gmt')
- `units`: Units (default: 'metric')

### Get Available Stations
```
GET /api/stations
```

## Example Usage

### Using Python
```python
import requests

# Get station info
response = requests.get("http://127.0.0.1:8000/api/station/8724580")
print(response.json())

# Get water level data for the last 7 days
from datetime import datetime, timedelta

end_date = datetime.utcnow().strftime('%Y%m%d')
begin_date = (datetime.utcnow() - timedelta(days=7)).strftime('%Y%m%d')

response = requests.get(
    f"http://127.0.0.1:8000/api/water-level/8724580",
    params={
        'begin_date': begin_date,
        'end_date': end_date,
        'time_zone': 'gmt',
        'units': 'metric'
    }
)
print(response.json())
```

## Finding Station IDs

You can find NOAA station IDs at: [NOAA Tides & Currents Stations](https://tidesandcurrents.noaa.gov/stations.html)

## License

MIT
