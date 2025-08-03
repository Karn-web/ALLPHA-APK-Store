import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} ALLPHA APK Store. All rights reserved.</p>
      <div className="footer-links">
        <Link to="/privacy-policy">Privacy Policy</Link> | 
        <Link to="/terms"> Terms & Conditions</Link> | 
        <Link to="/disclaimer"> Disclaimer</Link>
      </div>
    </footer>
  );
}

export default Footer;
