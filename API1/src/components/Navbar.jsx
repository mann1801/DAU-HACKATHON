import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ activeSection, onSectionChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'pollution', label: 'Pollution', icon: '🏭' },
    { id: 'sea_level', label: 'Sea Level', icon: '🌊' },
    { id: 'cyclone', label: 'Cyclone', icon: '🌪️' },
    { id: 'contact', label: 'Contact', icon: '📞' }
  ];

  const handleNavClick = (sectionId) => {
    onSectionChange(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">🌊</span>
          <span className="brand-text">Alert Monitor</span>
        </div>

        {/* Mobile menu button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation items */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li key={item.id} className="navbar-item">
              <button
                className={`navbar-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
