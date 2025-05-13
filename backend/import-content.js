const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error:', err);
    process.exit(1);
  });

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

// Function to recursively scan directories and find .md files
async function scanDirectory(dir) {
  let files = [];
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const subDirFiles = await scanDirectory(fullPath);
      files = files.concat(subDirFiles);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to extract category and subcategory from file path
function extractMetadata(filePath) {
  // Normalize path for consistent processing
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Get relative path from the content directory
  const contentDirPath = path.resolve(__dirname, '..', 'content').replace(/\\/g, '/');
  const relativePath = normalizedPath.replace(contentDirPath + '/', '');
  
  // Special case for index.md in the root directory
  if (relativePath === 'index.md') {
    return {
      title: 'Home',
      category: '',
      subcategory: '',
      path: 'index.html',
    };
  }
  
  // Parse path components
  const pathParts = relativePath.split('/');
  
  // Handle files directly under a category folder (no subcategory)
  if (pathParts.length === 2) {
    const category = pathParts[0];
    const filename = pathParts[1];
    const title = path.basename(filename, '.md');
    const htmlPath = `${category}/${title}.html`;
    
    return {
      title,
      category,
      subcategory: '', // Empty subcategory
      path: htmlPath,
    };
  }
  
  // Handle the regular case with category/subcategory/file
  if (pathParts.length >= 3) {
    const category = pathParts[0];
    const subcategory = pathParts[1];
    const filename = pathParts[2];
    const title = path.basename(filename, '.md');
    const htmlPath = `${category}/${subcategory}/${title}.html`;
    
    return {
      category,
      subcategory,
      title,
      path: htmlPath,
    };
  }
  
  console.warn('File not in expected path structure:', filePath);
  return null;
}

// Remove {#custom-id} patterns from markdown before processing
function cleanMarkdown(markdown) {
  // Replace any {#custom-id} patterns in headings
  return markdown.replace(/^(#+.*?)({#[\w-]+})(.*)$/gm, '$1$3');
}

// Function to import a markdown file to MongoDB
async function importMarkdownFile(filePath) {
  try {
    const metadata = extractMetadata(filePath);
    if (!metadata) return null;
    
    // Read the markdown content
    const markdownContent = await fs.readFile(filePath, 'utf8');
    
    // Clean the markdown to remove custom ID patterns
    const cleanedMarkdown = cleanMarkdown(markdownContent);
    
    // Reset marked settings for each file
    marked.setOptions({
      headerIds: true,
      mangle: false
    });
    
    // Convert markdown to HTML with default settings
    const htmlContent = marked.parse(cleanedMarkdown);
    
    // Check if document already exists
    const existingDoc = await Document.findOne({ path: metadata.path });
    
    if (existingDoc) {
      // Update existing document
      existingDoc.content = htmlContent;
      existingDoc.title = metadata.title;
      existingDoc.category = metadata.category;
      existingDoc.subcategory = metadata.subcategory;
      existingDoc.updatedAt = new Date();
      await existingDoc.save();
      console.log(`Updated document: ${metadata.path}`);
      return existingDoc;
    } else {
      // Create new document
      const doc = new Document({
        title: metadata.title,
        category: metadata.category,
        subcategory: metadata.subcategory,
        content: htmlContent,
        path: metadata.path
      });
      
      await doc.save();
      console.log(`Imported new document: ${metadata.path}`);
      return doc;
    }
  } catch (error) {
    console.error(`Error importing file ${filePath}:`, error);
    return null;
  }
}

// Main import function
async function importContent() {
  try {
    console.log('Starting content import...');
    const contentDir = path.resolve(__dirname, '..', 'content');
    console.log('Content directory:', contentDir);
    
    // Find all markdown files
    const markdownFiles = await scanDirectory(contentDir);
    console.log(`Found ${markdownFiles.length} markdown files to import.`);
    
    // Extract paths that should exist in the database
    const validPaths = [];
    for (const file of markdownFiles) {
      const metadata = extractMetadata(file);
      if (metadata) {
        validPaths.push(metadata.path);
      }
    }
    
    // Find documents in the database that don't exist in the content directory
    const documentsInDb = await Document.find();
    const documentsToDelete = documentsInDb.filter(doc => !validPaths.includes(doc.path));
    
    // Delete documents that don't exist in the content directory
    if (documentsToDelete.length > 0) {
      console.log(`Found ${documentsToDelete.length} documents to delete from the database.`);
      for (const doc of documentsToDelete) {
        await Document.deleteOne({ _id: doc._id });
        console.log(`Deleted document: ${doc.path}`);
      }
    } else {
      console.log('No documents to delete from the database.');
    }
    
    // Import each file
    const results = [];
    for (const file of markdownFiles) {
      const result = await importMarkdownFile(file);
      if (result) results.push(result);
    }
    
    console.log(`Successfully imported ${results.length} documents.`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    return results;
  } catch (error) {
    console.error('Import failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the import
importContent().then(() => {
  console.log('Import process completed successfully.');
  process.exit(0);
}); 