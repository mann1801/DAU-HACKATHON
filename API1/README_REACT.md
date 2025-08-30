# Water Level Dashboard - React App

A modern React dashboard for visualizing NOAA water level data with real-time monitoring and predictions.

## Features

- 🌊 Real-time water level visualization
- 📊 Interactive charts with Chart.js
- 🏖️ Multiple monitoring stations
- 📈 Trend analysis and predictions
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── WaterLevelChart.jsx    # Main chart component
│   ├── StationSelector.jsx    # Station selection UI
│   ├── DataSummary.jsx        # Data statistics display
│   └── *.css                  # Component styles
├── App.jsx                    # Main application component
├── App.css                    # Application styles
├── index.js                   # Entry point
└── index.css                  # Global styles
```

## Components

### App.jsx
Main application component that manages state and data fetching.

### WaterLevelChart.jsx
Interactive line chart displaying water level data over time using Chart.js.

### StationSelector.jsx
Grid-based station selector with multiple NOAA monitoring stations.

### DataSummary.jsx
Statistical summary showing current levels, trends, and status indicators.

## API Integration

The app is designed to connect to your Python API endpoints:
- `/api/water-level/{stationId}` - Fetch water level data for a specific station

Currently uses mock data for development when API is not available.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Deployment

To build for production:
```bash
npm run build
```

This creates a `build` folder with optimized production files.
