import React from 'react';
import { Link } from 'react-router-dom';
import './DocumentView.css';

const NotFound = () => {
  return (
    <div className="document-container error-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="home-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
        Go to Home Page
      </Link>
    </div>
  );
};

export default NotFound; 