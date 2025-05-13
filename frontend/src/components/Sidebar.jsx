import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ darkMode, toggleDarkMode }) => {
  const [navigation, setNavigation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const sidebarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await axios.get('/api/navigation');
        setNavigation(response.data);
        
        // Initialize expanded state for categories
        const initialExpanded = {};
        Object.keys(response.data).forEach(category => {
          initialExpanded[category] = true; // Start with all categories expanded
        });
        setExpandedCategories(initialExpanded);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load navigation');
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.classList.contains('menu-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleSubcategory = (key) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (loading) return <div className="sidebar">Loading navigation...</div>;
  if (error) return <div className="sidebar">Error: {error}</div>;

  return (
    <>
      <button 
        className="menu-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
      
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={toggleSidebar} aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="sidebar-header">
          <h1>Knowledge Base</h1>
          <button 
            className="dark-mode-toggle" 
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M16 12C16 14.209 14.209 16 12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 12.9 16.5 12.9C13.52 12.9 11.1 10.48 11.1 7.5C11.1 5.69 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="category-list">
            <li className="home-link">
              <Link to="/">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Home
              </Link>
            </li>
            {Object.keys(navigation).map(category => (
              <li key={category} className="category">
                <div 
                  className="category-header" 
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>
                  <span className={`toggle-icon ${expandedCategories[category] ? 'open' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                
                {expandedCategories[category] && (
                  <div className="subcategories">
                    {/* Render documents without subcategories directly under the category */}
                    {navigation[category][''] && (
                      <ul className="documents direct-documents">
                        {navigation[category][''].map(doc => (
                          <li key={doc.path}>
                            <Link 
                              to={`/${doc.path}`}
                              className={location.pathname === `/${doc.path}` ? 'active' : ''}
                            >
                              {doc.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Render documents with subcategories */}
                    {Object.keys(navigation[category])
                      .filter(subcategory => subcategory !== '')
                      .map(subcategory => {
                        const subcategoryKey = `${category}-${subcategory}`;
                        const isExpanded = expandedSubcategories[subcategoryKey] !== false; // Default to expanded
                        
                        return (
                          <div key={subcategoryKey} className="subcategory">
                            <div 
                              className="subcategory-header"
                              onClick={() => toggleSubcategory(subcategoryKey)}
                            >
                              <span>{subcategory}</span>
                              <span className={`toggle-icon ${isExpanded ? 'open' : ''}`}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            </div>
                            
                            {isExpanded && (
                              <ul className="documents">
                                {navigation[category][subcategory].map(doc => (
                                  <li key={doc.path}>
                                    <Link 
                                      to={`/${doc.path}`}
                                      className={location.pathname === `/${doc.path}` ? 'active' : ''}
                                    >
                                      {doc.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 