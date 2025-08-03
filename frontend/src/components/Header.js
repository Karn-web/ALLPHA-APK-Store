import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt="ALLPHA APK STORE" className="logo-img" />
          <span className="logo-text">ALLPHA APK STORE</span>
        </Link>
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/disclaimer">Disclaimer</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}

export default Header;


