const fs = require('fs').promises;
const path = require('path');

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

// Function to remove ALL existing heading IDs and duplicates from Markdown file
function cleanupExistingIds(content) {
  // First remove all duplicate heading IDs (matches multiple {#id} patterns)
  let cleanedContent = content.replace(/^(#{1,6}\s+.+?)(\s+{#[\w-]+}){2,}/gm, '$1');
  
  // Remove all remaining heading IDs to start fresh
  cleanedContent = cleanedContent.replace(/^(#{1,6}\s+.+?)\s+{#[\w-]+}/gm, '$1');
  
  // Fix any problematic heading text
  cleanedContent = cleanedContent.replace(/^(#{1,6}\s+)(\[object Object\]|undefined)/gm, '$1Section');
  
  return cleanedContent;
}

// Function to add IDs to Markdown headings
async function addHeadingIds(filePath) {
  try {
    console.log(`Processing file: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf8');
    
    // First clean up any existing IDs and issues
    const cleanedContent = cleanupExistingIds(content);
    
    // Regular expression to find headings in Markdown
    // Match heading lines starting with # (1-6 levels)
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    
    const headingIds = new Map(); // Track used IDs to avoid duplicates
    
    // Process each heading and add an ID
    let processedContent = cleanedContent.replace(headingRegex, (match, hashes, title) => {
      // Skip if it's the summary heading
      if (title.trim().toLowerCase() === 'summarized by ai' || 
          title.trim().toLowerCase() === 'summary') {
        return match;
      }
      
      // Fix problematic title text
      if (title.trim() === 'undefined' || title.includes('[object Object]')) {
        title = 'Section';
      }
      
      // Create ID from title
      let id = title.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars except whitespace and dashes
        .replace(/\s+/g, '-')     // Replace spaces with dashes
        .replace(/^-+|-+$/g, '')  // Remove leading/trailing dashes
        .replace(/-{2,}/g, '-');  // Replace multiple dashes with single dash
      
      // Ensure ID is not empty
      if (!id) {
        id = `section-${hashes.length}-${Date.now().toString(36).substring(-6)}`;
      }
      
      // Handle duplicate IDs
      if (headingIds.has(id)) {
        let count = headingIds.get(id) + 1;
        headingIds.set(id, count);
        id = `${id}-${count}`;
      } else {
        headingIds.set(id, 1);
      }
      
      // Return heading with ID
      return `${hashes} ${title} {#${id}}`;
    });
    
    // Only write the file if changes were made
    if (processedContent !== content) {
      await fs.writeFile(filePath, processedContent, 'utf8');
      console.log(`Added heading IDs to: ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed for: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function to process all Markdown files
async function processMarkdownFiles() {
  try {
    console.log('Starting to add heading IDs to Markdown files...');
    const contentDir = path.resolve(__dirname, '..', 'content');
    console.log('Content directory:', contentDir);
    
    // Find all markdown files
    const markdownFiles = await scanDirectory(contentDir);
    console.log(`Found ${markdownFiles.length} markdown files to process.`);
    
    let modifiedCount = 0;
    
    // Process each file
    for (const filePath of markdownFiles) {
      const modified = await addHeadingIds(filePath);
      if (modified) modifiedCount++;
    }
    
    console.log(`Added heading IDs to ${modifiedCount} markdown files.`);
    return true;
  } catch (error) {
    console.error('Process failed:', error);
    process.exit(1);
  }
}

// Run the process
processMarkdownFiles().then(() => {
  console.log('Process completed successfully.');
  process.exit(0);
}); 