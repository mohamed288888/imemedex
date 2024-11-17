// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '../App.css'; // استيراد التنسيق

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // تبديل حالة القائمة
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // إغلاق القائمة عند اختيار صفحة
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      {/* الشعار */}
      <div className="brand-logo">
        <img src="/logo.png" alt="Logo" className="logo" />
        <span>IMEME</span>
      </div>

      {/* زر القائمة القابلة للطي (الهامبرغر) */}
      <div className="menu-toggle" onClick={toggleMenu}>
        &#9776;
      </div>

      {/* قائمة التنقل */}
      <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}>Swap</Link>
        <Link to="/tokenomics" className="nav-link" onClick={closeMenu}>Tokenomics</Link>
        <Link to="/roadmap" className="nav-link" onClick={closeMenu}>Roadmap</Link>
        <Link to="/faq" className="nav-link" onClick={closeMenu}>FAQ</Link>
      </nav>

      {/* زر المحفظة */}
      <div className="wallet-button">
        <WalletMultiButton />
      </div>
    </header>
  );
};

export default Header;
