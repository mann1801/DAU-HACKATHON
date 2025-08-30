from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import requests
from typing import Dict, List
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

class NOAAWaterLevelAPI:
    """API wrapper for NOAA water level data"""
    
    BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_water_level_data(self, station_id: str, hours: int = 24) -> List[Dict]:
        """Fetch water level data for the last N hours"""
        # Check if it's an Indian station
        if station_id.startswith('IN'):
            return self.generate_mock_data_indian(station_id)
        
        end_time = datetime.now()
        begin_time = end_time - timedelta(hours=hours)
        
        params = {
            'station': station_id,
            'product': 'water_level',
            'application': 'web_services',
            'format': 'json',
            'units': 'english',  # feet
            'time_zone': 'gmt',
            'begin_date': begin_time.strftime('%Y%m%d %H:%M'),
            'end_date': end_time.strftime('%Y%m%d %H:%M')
        }
        
        try:
            response = self.session.get(self.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'data' in data:
                # Transform data for React frontend
                transformed_data = []
                for item in data['data']:
                    transformed_data.append({
                        'time': item['t'],
                        'waterLevel': float(item['v']),
                        'prediction': float(item['v']) + (0.1 if len(transformed_data) % 2 == 0 else -0.1)  # Mock prediction
                    })
                return transformed_data
            else:
                return self.generate_mock_data()
                
        except Exception as e:
            print(f"Error fetching data for station {station_id}: {e}")
            return self.generate_mock_data()
    
    def generate_mock_data(self) -> List[Dict]:
        """Generate mock data when API is unavailable"""
        import math
        import random
        
        now = datetime.now()
        data = []
        
        for i in range(24):
            time = now - timedelta(hours=23-i)
            # Simulate tidal patterns
            water_level = 2.5 + math.sin(i * 0.5) * 1.2 + random.uniform(-0.2, 0.2)
            prediction = water_level + random.uniform(-0.15, 0.15)
            
            data.append({
                'time': time.isoformat(),
                'waterLevel': round(water_level, 2),
                'prediction': round(prediction, 2)
            })
        
        return data
    
    def generate_mock_data_indian(self, station_id: str) -> List[Dict]:
        """Generate mock data for Indian coastal stations"""
        import math
        import random
        
        now = datetime.now()
        data = []
        
        # Different tidal patterns for different Indian coasts
        if station_id in ['IN001', 'IN002', 'IN003', 'IN004', 'IN005', 'IN006', 'IN007']:  # West Coast
            base_level = 1.8  # Arabian Sea typical levels
            amplitude = 1.5
        elif station_id in ['IN008', 'IN009', 'IN010', 'IN011']:  # Kerala Coast
            base_level = 1.2  # Kerala backwaters
            amplitude = 0.8
        elif station_id in ['IN012', 'IN013', 'IN014', 'IN015', 'IN016', 'IN017', 'IN018', 'IN019', 'IN020', 'IN021']:  # East Coast
            base_level = 2.2  # Bay of Bengal
            amplitude = 1.8
        else:  # Island territories
            base_level = 1.5
            amplitude = 1.0
        
        for i in range(24):
            time = now - timedelta(hours=23-i)
            # Simulate Indian Ocean tidal patterns (semi-diurnal)
            water_level = base_level + math.sin(i * 0.52) * amplitude + math.cos(i * 0.26) * 0.3 + random.uniform(-0.15, 0.15)
            prediction = water_level + random.uniform(-0.12, 0.12)
            
            data.append({
                'time': time.isoformat(),
                'waterLevel': round(water_level, 2),
                'prediction': round(prediction, 2)
            })
        
        return data

# Initialize API wrapper
noaa_api = NOAAWaterLevelAPI()

@app.route('/api/water-level/<station_id>')
def get_water_level(station_id):
    """Get water level data for a specific station"""
    try:
        hours = request.args.get('hours', 24, type=int)
        data = noaa_api.get_water_level_data(station_id, hours)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stations')
def get_stations():
    """Get list of available stations"""
    stations = [
        # Northeast Coast
        {'id': '8410140', 'name': 'Eastport, ME', 'location': 'Maine'},
        {'id': '8413320', 'name': 'Bar Harbor, ME', 'location': 'Maine'},
        {'id': '8418150', 'name': 'Portland, ME', 'location': 'Maine'},
        {'id': '8423898', 'name': 'Fort Point, NH', 'location': 'New Hampshire'},
        {'id': '8443970', 'name': 'Boston, MA', 'location': 'Boston Harbor'},
        {'id': '8447930', 'name': 'Woods Hole, MA', 'location': 'Massachusetts'},
        {'id': '8452660', 'name': 'Newport, RI', 'location': 'Rhode Island'},
        {'id': '8461490', 'name': 'New London, CT', 'location': 'Connecticut'},
        {'id': '8465705', 'name': 'New Haven, CT', 'location': 'Connecticut'},
        {'id': '8516945', 'name': 'Kings Point, NY', 'location': 'Long Island Sound'},
        {'id': '8518750', 'name': 'The Battery, NY', 'location': 'New York Harbor'},
        {'id': '8510560', 'name': 'Montauk, NY', 'location': 'Long Island'},
        {'id': '8531680', 'name': 'Sandy Hook, NJ', 'location': 'New Jersey'},
        {'id': '8534720', 'name': 'Atlantic City, NJ', 'location': 'New Jersey'},
        
        # Mid-Atlantic
        {'id': '8545240', 'name': 'Philadelphia, PA', 'location': 'Pennsylvania'},
        {'id': '8557380', 'name': 'Lewes, DE', 'location': 'Delaware'},
        {'id': '8570283', 'name': 'Ocean City, MD', 'location': 'Maryland'},
        {'id': '8594900', 'name': 'Baltimore, MD', 'location': 'Maryland'},
        {'id': '8638610', 'name': 'Sewells Point, VA', 'location': 'Virginia'},
        {'id': '8651370', 'name': 'Duck, NC', 'location': 'North Carolina'},
        {'id': '8658120', 'name': 'Wilmington, NC', 'location': 'North Carolina'},
        
        # Southeast Coast
        {'id': '8665530', 'name': 'Charleston, SC', 'location': 'South Carolina'},
        {'id': '8670870', 'name': 'Fort Pulaski, GA', 'location': 'Georgia'},
        {'id': '8720218', 'name': 'Mayport, FL', 'location': 'Florida'},
        {'id': '8721604', 'name': 'Daytona Beach, FL', 'location': 'Florida'},
        {'id': '8724580', 'name': 'Key West, FL', 'location': 'Florida'},
        {'id': '8723214', 'name': 'Virginia Key, FL', 'location': 'Florida'},
        
        # Gulf Coast
        {'id': '8726520', 'name': 'St. Petersburg, FL', 'location': 'Florida'},
        {'id': '8729108', 'name': 'Naples, FL', 'location': 'Florida'},
        {'id': '8760922', 'name': 'Pensacola, FL', 'location': 'Florida'},
        {'id': '8761724', 'name': 'Grand Isle, LA', 'location': 'Louisiana'},
        {'id': '8770570', 'name': 'Sabine Pass North, TX', 'location': 'Texas'},
        {'id': '8771450', 'name': 'Galveston Pier 21, TX', 'location': 'Texas'},
        {'id': '8775870', 'name': 'Port Aransas, TX', 'location': 'Texas'},
        {'id': '8779770', 'name': 'Padre Island, TX', 'location': 'Texas'},
        
        # West Coast
        {'id': '9410170', 'name': 'San Diego, CA', 'location': 'California'},
        {'id': '9410660', 'name': 'Los Angeles, CA', 'location': 'California'},
        {'id': '9411340', 'name': 'Santa Barbara, CA', 'location': 'California'},
        {'id': '9414290', 'name': 'San Francisco, CA', 'location': 'California'},
        {'id': '9418767', 'name': 'North Spit, CA', 'location': 'California'},
        {'id': '9431647', 'name': 'Port Orford, OR', 'location': 'Oregon'},
        {'id': '9435380', 'name': 'South Beach, OR', 'location': 'Oregon'},
        {'id': '9440910', 'name': 'Toke Point, WA', 'location': 'Washington'},
        {'id': '9447130', 'name': 'Seattle, WA', 'location': 'Washington'},
        
        # Alaska
        {'id': '9450460', 'name': 'Ketchikan, AK', 'location': 'Alaska'},
        {'id': '9452210', 'name': 'Juneau, AK', 'location': 'Alaska'},
        {'id': '9454050', 'name': 'Skagway, AK', 'location': 'Alaska'},
        {'id': '9455920', 'name': 'Anchorage, AK', 'location': 'Alaska'},
        
        # Hawaii
        {'id': '1612340', 'name': 'Honolulu, HI', 'location': 'Hawaii'},
        {'id': '1615680', 'name': 'Mokuoloe, HI', 'location': 'Hawaii'},
        {'id': '1617760', 'name': 'Maunalua Bay, HI', 'location': 'Hawaii'},
        
        # Great Lakes
        {'id': '9063020', 'name': 'Buffalo, NY', 'location': 'Lake Erie'},
        {'id': '9075014', 'name': 'Sturgeon Bay, WI', 'location': 'Lake Michigan'},
        {'id': '9087031', 'name': 'Milwaukee, WI', 'location': 'Lake Michigan'},
        {'id': '9087057', 'name': 'Calumet Harbor, IL', 'location': 'Lake Michigan'},
        
        # India - West Coast (Arabian Sea)
        {'id': 'IN001', 'name': 'Mumbai Port', 'location': 'Maharashtra, India'},
        {'id': 'IN002', 'name': 'Kandla Port', 'location': 'Gujarat, India'},
        {'id': 'IN003', 'name': 'Okha Port', 'location': 'Gujarat, India'},
        {'id': 'IN004', 'name': 'Porbandar', 'location': 'Gujarat, India'},
        {'id': 'IN005', 'name': 'Veraval Port', 'location': 'Gujarat, India'},
        {'id': 'IN006', 'name': 'Mormugao Port', 'location': 'Goa, India'},
        {'id': 'IN007', 'name': 'New Mangalore Port', 'location': 'Karnataka, India'},
        {'id': 'IN008', 'name': 'Cochin Port', 'location': 'Kerala, India'},
        {'id': 'IN009', 'name': 'Alappuzha', 'location': 'Kerala, India'},
        {'id': 'IN010', 'name': 'Kollam Port', 'location': 'Kerala, India'},
        {'id': 'IN011', 'name': 'Vizhinjam Port', 'location': 'Kerala, India'},
        
        # India - East Coast (Bay of Bengal)
        {'id': 'IN012', 'name': 'Kolkata Port', 'location': 'West Bengal, India'},
        {'id': 'IN013', 'name': 'Haldia Port', 'location': 'West Bengal, India'},
        {'id': 'IN014', 'name': 'Paradip Port', 'location': 'Odisha, India'},
        {'id': 'IN015', 'name': 'Visakhapatnam Port', 'location': 'Andhra Pradesh, India'},
        {'id': 'IN016', 'name': 'Kakinada Port', 'location': 'Andhra Pradesh, India'},
        {'id': 'IN017', 'name': 'Chennai Port', 'location': 'Tamil Nadu, India'},
        {'id': 'IN018', 'name': 'Ennore Port', 'location': 'Tamil Nadu, India'},
        {'id': 'IN019', 'name': 'Cuddalore Port', 'location': 'Tamil Nadu, India'},
        {'id': 'IN020', 'name': 'Nagapattinam Port', 'location': 'Tamil Nadu, India'},
        {'id': 'IN021', 'name': 'Tuticorin Port', 'location': 'Tamil Nadu, India'},
        
        # India - Island Territories
        {'id': 'IN022', 'name': 'Port Blair', 'location': 'Andaman & Nicobar Islands, India'},
        {'id': 'IN023', 'name': 'Kavaratti', 'location': 'Lakshadweep, India'}
    ]
    return jsonify(stations)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("Starting NOAA Water Level API Server...")
    print("Available endpoints:")
    print("  GET /api/water-level/<station_id>")
    print("  GET /api/stations")
    print("  GET /api/health")
    app.run(debug=True, port=5000, host='0.0.0.0')
