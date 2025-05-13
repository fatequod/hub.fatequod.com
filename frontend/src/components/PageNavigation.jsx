import React, { useEffect, useState } from 'react';
import './PageNavigation.css';

const PageNavigation = ({ documentContent }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!documentContent) return;

    try {
      // Parse document content to identify headings
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = documentContent;
      
      // Find all heading elements
      const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Function to generate an ID from heading text
      const generateIdFromText = (text) => {
        return text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim() || 'section';
      };
      
      // Build an array of heading data
      const headingsData = [];
      headingElements.forEach((heading, index) => {
        // Skip AI summary headings
        const text = heading.textContent.trim();
        if (text.toLowerCase() === 'summary' || 
            text.toLowerCase() === 'summarized by ai') {
          return;
        }
        
        // Get the heading level
        const level = parseInt(heading.tagName.charAt(1)) || 1;
        
        // Get or create an ID for the heading
        let id = heading.id;
        if (!id) {
          id = generateIdFromText(text) || `heading-${index}`;
          heading.id = id;
        }
        
        // Only add headings with content
        if (text) {
          headingsData.push({ id, text, level, index });
        }
      });
      
      // Add IDs to actual document headings
      setTimeout(() => {
        const documentHeadings = document.querySelectorAll('.document-content h1, .document-content h2, .document-content h3, .document-content h4, .document-content h5, .document-content h6');
        
        headingsData.forEach(heading => {
          if (documentHeadings[heading.index] && !documentHeadings[heading.index].id) {
            documentHeadings[heading.index].id = heading.id;
          }
        });
      }, 100);
      
      setHeadings(headingsData);
    } catch (error) {
      console.error('Error processing navigation:', error);
    }
  }, [documentContent]);

  // Add smooth scrolling to anchor links and tracking of active section
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, null, `#${targetId}`);
          setActiveId(targetId);
        }
      }
    };
    
    const nav = document.querySelector('.page-navigation-list');
    if (nav) {
      nav.addEventListener('click', handleClick);
      return () => nav.removeEventListener('click', handleClick);
    }
  }, [headings]);

  // Track scroll position to update active section
  useEffect(() => {
    if (!headings.length) return;

    const headingElements = headings.map(heading => ({
      id: heading.id,
      element: document.getElementById(heading.id)
    })).filter(item => item.element);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add offset to account for fixed headers

      // Find the section that is currently in view
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const { id, element } = headingElements[i];
        if (element.offsetTop <= scrollPosition) {
          setActiveId(id);
          return;
        }
      }

      // If no section is active, set the first one as active
      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial active section
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Don't show navigation if no headings or just one heading
  if (!headings.length || headings.length === 1) {
    return null;
  }

  return (
    <div className="page-navigation">
      <div className="page-navigation-inner">
        <h3>On this page</h3>
        <nav>
          <ul className="page-navigation-list">
            {headings.map((heading, index) => (
              <li 
                key={index} 
                className={`heading-level-${heading.level}`}
              >
                <a 
                  href={`#${heading.id}`}
                  className={activeId === heading.id ? 'active' : ''}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default PageNavigation; 