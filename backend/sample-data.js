const mongoose = require('mongoose');
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');

// Load environment variables manually
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Get MongoDB URI and ensure it's properly encoded
const mongoUri = process.env.MONGODB_URI;
console.log('MONGODB_URI is defined:', !!mongoUri);

// MongoDB Connection
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Document Schema
const documentSchema = new mongoose.Schema({
  title: String,
  category: String,
  subcategory: String,
  content: String,
  path: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

// Sample documents
const sampleDocuments = [
  {
    title: 'Process',
    category: 'Core',
    subcategory: 'Development',
    content: marked(`# Development Process

## Overview

This document outlines our development process from ideation to deployment.

### Steps:

1. **Planning**
   - Define requirements
   - Create user stories
   - Prioritize tasks

2. **Design**
   - Create wireframes
   - Design system architecture
   - Define data models

3. **Implementation**
   - Write code following best practices
   - Regular code reviews
   - Continuous integration

4. **Testing**
   - Unit tests
   - Integration tests
   - User acceptance testing

5. **Deployment**
   - Staging environment testing
   - Production deployment
   - Monitoring

## Best Practices

- Follow the DRY principle
- Write clean, maintainable code
- Document your work
- Test early and often
`),
    path: 'Core/Development/Process.html'
  },
  {
    title: 'Apps',
    category: 'Tools',
    subcategory: 'Software',
    content: marked(`# Software Applications

## Recommended Tools

Below is a list of recommended software applications for various tasks:

### Development

- **Code Editors**
  - Visual Studio Code
  - Sublime Text
  - IntelliJ IDEA

- **Version Control**
  - Git
  - GitHub Desktop
  - GitKraken

### Design

- **UI/UX Design**
  - Figma
  - Adobe XD
  - Sketch

- **Graphics**
  - Adobe Photoshop
  - GIMP
  - Affinity Designer

### Productivity

- **Task Management**
  - Trello
  - Asana
  - Jira

- **Note Taking**
  - Notion
  - Evernote
  - OneNote

## Installation Guidelines

1. Download the application from the official website
2. Follow the installation instructions
3. Configure according to team standards
`),
    path: 'Tools/Software/Apps.html'
  }
];

// Insert sample documents
const insertSampleData = async () => {
  try {
    // Clear existing data
    await Document.deleteMany({});
    
    // Insert new documents
    await Document.insertMany(sampleDocuments);
    
    console.log('Sample data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting sample data:', error);
    process.exit(1);
  }
};

insertSampleData(); 