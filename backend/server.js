const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { marked } = require('marked');
const fs = require('fs');

// Load environment variables with explicit path
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
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
  },
  hasSummary: {
    type: Boolean,
    default: false
  }
});

const Document = mongoose.model('Document', documentSchema);

// Routes

// Get the index document
app.get('/api/documents/index.html', async (req, res) => {
  try {
    const document = await Document.findOne({ path: 'index.html' });
    
    if (!document) {
      return res.status(404).json({ message: 'Index document not found' });
    }
    
    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all categories and their subcategories for navigation
app.get('/api/navigation', async (req, res) => {
  try {
    // Exclude the index.html document from navigation
    const documents = await Document.find({ path: { $ne: 'index.html' } }).select('category subcategory path title');
    
    const navigation = {};
    documents.forEach(doc => {
      if (!doc.category) return; // Skip documents without a category
      
      if (!navigation[doc.category]) {
        navigation[doc.category] = {};
      }
      
      // Handle documents without a subcategory
      if (!doc.subcategory) {
        if (!navigation[doc.category]['']) {
          navigation[doc.category][''] = [];
        }
        navigation[doc.category][''].push({
          path: doc.path,
          title: doc.title || doc.path.split('/').pop().replace('.html', '')
        });
        return;
      }
      
      // Handle regular documents with subcategories
      if (!navigation[doc.category][doc.subcategory]) {
        navigation[doc.category][doc.subcategory] = [];
      }
      navigation[doc.category][doc.subcategory].push({
        path: doc.path,
        title: doc.title || doc.path.split('/').pop().replace('.html', '')
      });
    });
    
    res.json(navigation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific document by path (with subcategory)
app.get('/api/documents/:category/:subcategory/:filename', async (req, res) => {
  try {
    const path = `${req.params.category}/${req.params.subcategory}/${req.params.filename}`;
    const document = await Document.findOne({ path });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific document by path (without subcategory)
app.get('/api/documents/:category/:filename', async (req, res) => {
  try {
    const path = `${req.params.category}/${req.params.filename}`;
    const document = await Document.findOne({ path });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new document
app.post('/api/documents', async (req, res) => {
  try {
    const { title, category, subcategory, content } = req.body;
    
    // Create the path
    const filename = title.replace(/\s+/g, '') + '.html';
    const docPath = `${category}/${subcategory}/${filename}`;
    
    // Convert markdown to HTML
    const htmlContent = marked(content);
    
    const newDocument = new Document({
      title,
      category,
      subcategory,
      content: htmlContent,
      path: docPath
    });
    
    const savedDocument = await newDocument.save();
    res.status(201).json(savedDocument);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 