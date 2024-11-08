import React from 'react';
import './Footer.css';

const Footer = ({ children }) => {
  return (
    <footer className="footer">
      {children}
    </footer>
  );
};

export default Footer;