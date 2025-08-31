import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Pollution from './components/pages/Pollution';
import SeaLevel from './components/pages/SeaLevel';
import Cyclone from './components/pages/Cyclone';
import Contact from './components/pages/Contact';
import './App.css';
import './components/pages/Pollution.css';
import './components/pages/Contact.css';
import './components/pages/Cyclone.css';

const App = () => {
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [selectedStation, setSelectedStation] = useState('8518750'); // Default to The Battery, NY
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  const fetchWaterLevelData = async (stationId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Connect to Flask API server
      const response = await fetch(`http://localhost:5000/api/water-level/${stationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch water level data');
      }
      const data = await response.json();
      setWaterLevelData(data);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data if API is unavailable
      const mockData = generateMockData();
      setWaterLevelData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const waterLevel = 2.5 + Math.sin(i * 0.5) * 1.2 + Math.random() * 0.3;
      
      data.push({
        time: time.toISOString(),
        waterLevel: parseFloat(waterLevel.toFixed(2)),
        prediction: parseFloat((waterLevel + Math.random() * 0.2 - 0.1).toFixed(2))
      });
    }
    
    return data;
  };

  useEffect(() => {
    fetchWaterLevelData(selectedStation);
  }, [selectedStation]);

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <Home
            waterLevelData={waterLevelData}
            selectedStation={selectedStation}
            onStationChange={handleStationChange}
            loading={loading}
            error={error}
          />
        );
      case 'pollution':
        return <Pollution />;
      case 'sea_level':
        return (
          <SeaLevel
            waterLevelData={waterLevelData}
            selectedStation={selectedStation}
            onStationChange={handleStationChange}
            loading={loading}
            error={error}
          />
        );
      case 'cyclone':
        return <Cyclone />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <Home
            waterLevelData={waterLevelData}
            selectedStation={selectedStation}
            onStationChange={handleStationChange}
            loading={loading}
            error={error}
          />
        );
    }
  };

  return (
    <div className="app">
      <Navbar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <div className="container">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default App;
