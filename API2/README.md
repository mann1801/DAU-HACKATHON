# Cyclone Monitoring Dashboard

A comprehensive real-time tropical cyclone monitoring and alert system with React frontend and Python backend.

## Features

- **Real-time Storm Tracking** - Live data from NOAA National Hurricane Center
- **Interactive Storm Map** - Leaflet-based visualization with storm positions and wind radii
- **Categorized Alerts** - Saffir-Simpson scale classification with appropriate warning levels
- **Station Monitoring** - 10 coastal monitoring stations with proximity alerts
- **Storm Intensity Charts** - Historical wind speed and pressure trends
- **Responsive Design** - Mobile and desktop optimized interface

## System Architecture

### Backend (Python)
- `cyclone_alert_system.py` - Main alert generation system
- `noaa_cyclone_scraper.py` - NOAA website scraper
- `fetch_live_data.py` - Enhanced data fetcher with caching
- `cyclone_visualization.py` - Storm track and intensity visualizations
- `app.py` - Flask REST API server

### Frontend (React)
- `App.jsx` - Main dashboard application
- `AlertCard.jsx` - Storm alert display cards
- `StormMap.jsx` - Interactive Leaflet map component
- `StationMonitor.jsx` - Monitoring station status display
- `StormIntensityChart.jsx` - Chart.js intensity visualizations
- `api.js` - API service layer

## Quick Start

### Backend Setup
```bash
cd API2
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd API2
npm install
npm start
```

## API Endpoints

- `GET /api/cyclone/active-storms` - Fetch all active storms
- `GET /api/cyclone/stations` - Get monitoring station data
- `GET /api/cyclone/storm/<id>` - Get specific storm details
- `GET /api/cyclone/station/<id>/alerts` - Get station-specific alerts
- `GET /api/cyclone/status` - System status and statistics

## Monitoring Stations

- **MIA** - Miami, FL
- **TPA** - Tampa, FL  
- **JAX** - Jacksonville, FL
- **MSY** - New Orleans, LA
- **HOU** - Houston, TX
- **CHS** - Charleston, SC
- **ORF** - Norfolk, VA
- **NYC** - New York, NY
- **BOS** - Boston, MA
- **SJU** - San Juan, PR

## Storm Categories

- **Tropical Depression** - Winds < 34 kt
- **Tropical Storm** - Winds 34-63 kt
- **Category 1 Hurricane** - Winds 64-82 kt
- **Category 2 Hurricane** - Winds 83-95 kt
- **Category 3 Hurricane** - Winds 96-112 kt
- **Category 4 Hurricane** - Winds 113-136 kt
- **Category 5 Hurricane** - Winds 137+ kt

## Data Sources

- NOAA National Hurricane Center RSS feeds
- Real-time storm advisory pages
- Automated 5-minute update intervals

## Development

The system uses mock data in development mode and switches to live NOAA data in production. All components are designed to handle both scenarios seamlessly.
