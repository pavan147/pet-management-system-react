import React from "react";
import { Link } from "react-router-dom";
import "./common.css";
import {
  isPetOwnerUser,
  isUserLoggedIn,
} from "../../services/VeterinaryRegistrationService";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isAuth = isUserLoggedIn();
  const isPetOwner = isPetOwnerUser();

  return (
    <footer className="modern-footer">
      <div className="container-fluid">
        <div className="footer-content">
          <div className="footer-section">
            <h5 className="footer-title">🐾 PetCare Pro</h5>
            <p className="footer-text">Your trusted pet management and healthcare partner.</p>
          </div>

          <div className="footer-section">
            <h6 className="footer-subtitle">Quick Links</h6>
            <ul className="footer-links">
              {isAuth && <li><Link to="/">📊 Dashboard</Link></li>}
              {isAuth && <li><Link to="/book-appointment">📅 Book Appointment</Link></li>}
              {isAuth && !isPetOwner && <li><Link to="/add-pet">🐕 Add Pet</Link></li>}
            </ul>
          </div>

          <div className="footer-section">
            <h6 className="footer-subtitle">Support</h6>
            <ul className="footer-links">
              <li><a href="#">📧 Contact Us</a></li>
              <li><a href="#">❓ FAQ</a></li>
              <li><a href="#">📋 Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h6 className="footer-subtitle">Follow Us</h6>
            <div className="social-links">
              <a href="#" className="social-link">👍 Facebook</a>
              <a href="#" className="social-link">🐦 Twitter</a>
              <a href="#" className="social-link">📸 Instagram</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} PetCare Pro. All rights reserved. | Made with ❤️ for pet lovers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;