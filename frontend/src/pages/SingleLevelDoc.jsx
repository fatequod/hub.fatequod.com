import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import * as marked from 'marked';
import DOMPurify from 'dompurify';
import PageNavigation from '../components/PageNavigation';
import './DocumentView.css';

const SingleLevelDoc = () => {
  const { category, filename } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const path = `${category}/${filename}`;
        const response = await axios.get(`/api/documents/${category}/${filename}`);
        setDocData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document');
        setErrorDetails({
          path: `${category}/${filename}`,
          status: err.response?.status
        });
        setLoading(false);
      }
    };

    if (category && filename) {
      fetchDocument();
    }
  }, [category, filename]);

  // Add copy code button to code blocks
  useEffect(() => {
    if (!docData) return;

    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.document-content pre code');
      
      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentNode;
        
        // Skip if we've already added a button
        if (pre.parentNode.classList.contains('code-block-wrapper')) {
          return;
        }
        
        // Create a wrapper for the pre element and code block header
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        // Create the header with language indicator and copy button
        const header = document.createElement('div');
        header.className = 'code-block-header';
        
        // Try to detect language from class
        let language = 'code';
        codeBlock.classList.forEach(cls => {
          if (cls.startsWith('language-')) {
            language = cls.replace('language-', '');
          }
        });
        
        // Add language display
        const langDisplay = document.createElement('span');
        langDisplay.textContent = language;
        header.appendChild(langDisplay);
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H6V19C6 20.1046 6.89543 21 8 21H20C21.1046 21 22 20.1046 22 19V7C22 5.89543 21.1046 5 20 5H18V4C18 3.44772 17.5523 3 17 3H16ZM16 5V7H8C6.89543 7 6 7.89543 6 9V15H5V5H16ZM8 9H20V19H8V9Z" 
              stroke="currentColor" strokeWidth="1" fill="currentColor"/>
          </svg>
          Copy
        `;
        
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(codeBlock.textContent)
            .then(() => {
              copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                </svg>
                Copied!
              `;
              setTimeout(() => {
                copyButton.innerHTML = `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H6V19C6 20.1046 6.89543 21 8 21H20C21.1046 21 22 20.1046 22 19V7C22 5.89543 21.1046 5 20 5H18V4C18 3.44772 17.5523 3 17 3H16ZM16 5V7H8C6.89543 7 6 7.89543 6 9V15H5V5H16ZM8 9H20V19H8V9Z" 
                      stroke="currentColor" strokeWidth="1" fill="currentColor"/>
                  </svg>
                  Copy
                `;
              }, 2000);
            })
            .catch(err => {
              console.error('Failed to copy code', err);
              copyButton.textContent = 'Error!';
            });
        });
        
        header.appendChild(copyButton);
        
        // Insert the header and pre element into the wrapper
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
      });
    };
    
    // Run after the content has been rendered
    setTimeout(addCopyButtons, 100);
  }, [docData]);

  // Handle hash navigation
  useEffect(() => {
    if (docData && docData.content) {
      // Scroll to the correct section if there's a hash in the URL
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash) {
          const targetElement = window.document.getElementById(hash.substring(1));
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 300);
    }
  }, [docData]);

  const renderContent = () => {
    if (!docData || !docData.content) return null;
    
    // Configure marked options
    marked.marked.setOptions({
      highlight: function(code, lang) {
        return code;
      }
    });
    
    // Convert markdown to HTML
    const rawHtml = marked.marked.parse(docData.content);
    
    // Sanitize HTML to prevent XSS attacks
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target']
    });
    
    return { __html: sanitizedHtml };
  };

  if (loading) {
    return (
      <div className="document-container">
        <div className="loading">Loading document...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="document-container">
        <div className="error-container">
          <h2>Error Loading Document</h2>
          <p>{error}</p>
          {errorDetails && (
            <div className="debug-info">
              Path: {errorDetails.path}<br />
              Status: {errorDetails.status}
            </div>
          )}
          <Link to="/">
            <button className="home-button">Go to Home</button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!docData) return <div className="document-container">Document not found</div>;

  return (
    <div className="main-content">
      <div className="document-container">
        {docData && (
          <>
            <div className="document-header">
              <div className="document-breadcrumbs">
                <Link to="/" className="home-link">Home</Link>
                <span className="separator">/</span>
                <span className="folder">{category}</span>
                <span className="separator">/</span>
                <span className="current">{docData.title}</span>
              </div>
              <h1>{docData.title}</h1>
              <div className="document-meta">
                {docData.lastModified && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Last updated: {new Date(docData.lastModified || docData.updatedAt).toLocaleDateString()}
                  </span>
                )}
                {docData.author && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Author: {docData.author}
                  </span>
                )}
              </div>
            </div>
            <div 
              className="document-content"
              dangerouslySetInnerHTML={renderContent()}
            />
          </>
        )}
      </div>
      {docData && <PageNavigation documentContent={docData.content} />}
    </div>
  );
};

export default SingleLevelDoc; 