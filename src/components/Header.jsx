import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          PhotoDoc
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="#privacy" className="nav-link">Privacy</a>
          <a href="#terms" className="nav-link">Terms</a>
          <a href="#login" className="nav-link">Log In</a>
          <a href="#signup" className="nav-link sign-up-text">Sign Up</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
