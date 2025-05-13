import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DocumentView from './pages/DocumentView';
import IndexPage from './pages/IndexPage';
import NotFound from './pages/NotFound';
import SingleLevelDoc from './pages/SingleLevelDoc';

function App() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <Sidebar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      <div className="content">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/:category/:subcategory/:filename" element={<DocumentView />} />
          <Route path="/:category/:filename" element={<SingleLevelDoc />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {showBackToTop && (
        <button 
          className="back-to-top visible" 
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12H9V20H15V12H20L12 4Z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App; 