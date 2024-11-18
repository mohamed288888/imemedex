// Footer.js
import React from 'react';
import { FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-socials">
        <a href="https://t.me/imeme_official1/" className="social-link" target="_blank" rel="noopener noreferrer">
          <FaTelegramPlane />
        </a>
        <a href="https://x.com/imeme1448179" className="social-link" target="_blank" rel="noopener noreferrer">
          <FaTwitter />
        </a>
      </div>
      <div className="footer-bottom">
        &copy; 2024 IMEME. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
