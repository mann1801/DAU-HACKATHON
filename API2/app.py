#!/usr/bin/env python3
"""
Flask API Backend for Cyclone Monitoring Dashboard

This Flask app provides REST API endpoints for the React frontend
to access real-time cyclone data from the NOAA scraping system.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timezone
import json
import os
import sys

# Import our cyclone monitoring modules
from cyclone_alert_system import CycloneAlertSystem, format_alert_for_display
from fetch_live_data import NOAACycloneDataFetcher, fetch_live_cyclone_data, STATIONS
from noaa_cyclone_scraper import NOAACycloneScraper

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize the cyclone systems
alert_system = CycloneAlertSystem()
data_fetcher = NOAACycloneDataFetcher()
scraper = NOAACycloneScraper()

@app.route('/api/cyclone/active-storms', methods=['GET'])
def get_active_storms():
    """Get all active tropical cyclones with alert information."""
    try:
        # Get active storm alerts from our alert system
        alerts = alert_system.get_active_storm_alerts()
        
        if not alerts:
            return jsonify([])
        
        # Format alerts for frontend consumption
        formatted_alerts = []
        for alert in alerts:
            if alert:  # Skip None alerts
                formatted_alerts.append(alert)
        
        return jsonify(formatted_alerts)
        
    except Exception as e:
        print(f"Error in get_active_storms: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/stations', methods=['GET'])
def get_stations():
    """Get all monitoring stations with their current status."""
    try:
        # Get active storms to determine station threat levels
        alerts = alert_system.get_active_storm_alerts()
        
        # Calculate station statuses based on nearby storms
        station_data = {}
        for station_id, station in STATIONS.items():
            status = 'active'  # Default status
            
            # Check if any storms are near this station
            for alert in alerts:
                if (alert and alert.get('nearest_station', {}).get('station_id') == station_id):
                    distance = alert.get('nearest_station', {}).get('distance_km', float('inf'))
                    alert_level = alert.get('alert_level', 'info')
                    
                    # Determine status based on storm proximity and severity
                    if alert_level in ['critical', 'danger'] and distance < 100:
                        status = 'danger'
                    elif alert_level == 'warning' and distance < 150:
                        status = 'warning'
                    elif distance < 200:
                        status = 'warning'
            
            station_data[station_id] = {
                'name': station['name'],
                'lat': station['lat'],
                'lon': station['lon'],
                'status': status
            }
        
        return jsonify(station_data)
        
    except Exception as e:
        print(f"Error in get_stations: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/storm/<storm_id>', methods=['GET'])
def get_storm_details(storm_id):
    """Get detailed information for a specific storm."""
    try:
        alerts = alert_system.get_active_storm_alerts()
        
        # Find the requested storm
        for alert in alerts:
            if alert and alert.get('storm_id') == storm_id:
                return jsonify(alert)
        
        return jsonify({'error': 'Storm not found'}), 404
        
    except Exception as e:
        print(f"Error in get_storm_details: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/storm/<storm_id>/forecast', methods=['GET'])
def get_storm_forecast(storm_id):
    """Get forecast data for a specific storm."""
    try:
        alerts = alert_system.get_active_storm_alerts()
        
        # Find the requested storm and return its forecast
        for alert in alerts:
            if alert and alert.get('storm_id') == storm_id:
                forecast = alert.get('forecast', [])
                return jsonify({
                    'storm_id': storm_id,
                    'forecast': forecast,
                    'forecast_points': len(forecast)
                })
        
        return jsonify({'error': 'Storm not found'}), 404
        
    except Exception as e:
        print(f"Error in get_storm_forecast: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/station/<station_id>/alerts', methods=['GET'])
def get_station_alerts(station_id):
    """Get alerts affecting a specific monitoring station."""
    try:
        if station_id not in STATIONS:
            return jsonify({'error': 'Station not found'}), 404
        
        alerts = alert_system.get_active_storm_alerts()
        station_alerts = []
        
        # Find storms affecting this station
        for alert in alerts:
            if (alert and alert.get('nearest_station', {}).get('station_id') == station_id):
                station_alerts.append(alert)
        
        return jsonify({
            'station_id': station_id,
            'station_name': STATIONS[station_id]['name'],
            'alerts': station_alerts,
            'alert_count': len(station_alerts)
        })
        
    except Exception as e:
        print(f"Error in get_station_alerts: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/status', methods=['GET'])
def get_system_status():
    """Get overall system status and health information."""
    try:
        alerts = alert_system.get_active_storm_alerts()
        
        # Calculate system statistics
        total_storms = len(alerts)
        critical_storms = len([a for a in alerts if a and a.get('alert_level') == 'critical'])
        danger_storms = len([a for a in alerts if a and a.get('alert_level') == 'danger'])
        warning_storms = len([a for a in alerts if a and a.get('alert_level') == 'warning'])
        
        # Calculate station statuses
        stations_at_risk = 0
        for station_id in STATIONS:
            for alert in alerts:
                if (alert and alert.get('nearest_station', {}).get('station_id') == station_id):
                    distance = alert.get('nearest_station', {}).get('distance_km', float('inf'))
                    if distance < 200:
                        stations_at_risk += 1
                        break
        
        return jsonify({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'system_status': 'operational',
            'data_source': 'NOAA National Hurricane Center',
            'last_update': datetime.now(timezone.utc).isoformat(),
            'statistics': {
                'total_storms': total_storms,
                'critical_storms': critical_storms,
                'danger_storms': danger_storms,
                'warning_storms': warning_storms,
                'total_stations': len(STATIONS),
                'stations_at_risk': stations_at_risk
            },
            'monitoring_area': 'Atlantic Basin',
            'update_frequency': '5 minutes'
        })
        
    except Exception as e:
        print(f"Error in get_system_status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/refresh', methods=['POST'])
def refresh_data():
    """Manually trigger a data refresh."""
    try:
        # Clear any cached data
        data_fetcher.cache.clear()
        
        # Fetch fresh data
        alerts = alert_system.get_active_storm_alerts()
        
        return jsonify({
            'status': 'success',
            'message': 'Data refreshed successfully',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'storm_count': len(alerts)
        })
        
    except Exception as e:
        print(f"Error in refresh_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/cyclone/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'service': 'Cyclone Monitoring API'
    })

@app.route('/', methods=['GET'])
def index():
    """API documentation endpoint."""
    return jsonify({
        'service': 'Cyclone Monitoring API',
        'version': '1.0.0',
        'description': 'Real-time tropical cyclone monitoring and alert system',
        'endpoints': {
            '/api/cyclone/active-storms': 'GET - Fetch all active tropical cyclones',
            '/api/cyclone/stations': 'GET - Get monitoring station data',
            '/api/cyclone/storm/<id>': 'GET - Get details for specific storm',
            '/api/cyclone/storm/<id>/forecast': 'GET - Get forecast for specific storm',
            '/api/cyclone/station/<id>/alerts': 'GET - Get alerts for specific station',
            '/api/cyclone/status': 'GET - Get system status and statistics',
            '/api/cyclone/refresh': 'POST - Manually refresh data',
            '/api/cyclone/health': 'GET - Health check'
        },
        'data_source': 'NOAA National Hurricane Center',
        'update_frequency': '5 minutes'
    })

if __name__ == '__main__':
    print("🌪️  Starting Cyclone Monitoring API Server...")
    print(f"📡 Monitoring {len(STATIONS)} stations")
    print("🚀 Server starting on http://localhost:5000")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
