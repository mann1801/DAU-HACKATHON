import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="page-content">
      <div className="hero-section">
        <h1>📞 Contact Us</h1>
        <p>Get in touch with our ocean monitoring team</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h3>📍 Contact Information</h3>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>info@oceanmonitor.gov</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <div>
                <strong>Phone</strong>
                <p>+1 (555) 123-WAVE</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🏢</span>
              <div>
                <strong>Address</strong>
                <p>NOAA Ocean Monitoring Center<br/>
                1401 Constitution Ave NW<br/>
                Washington, DC 20230</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕐</span>
              <div>
                <strong>Hours</strong>
                <p>24/7 Emergency Monitoring<br/>
                Office: Mon-Fri 8AM-6PM EST</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h3>💬 Send us a Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a topic</option>
                <option value="water-level">Water Level Data</option>
                <option value="pollution">Pollution Report</option>
                <option value="cyclone">Storm Information</option>
                <option value="technical">Technical Support</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please describe your inquiry or report..."
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">
              📤 Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
