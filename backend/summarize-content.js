const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Document Schema (same as in server.js and import-content.js)
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
  // Adding a field to track if the document has a summary
  hasSummary: {
    type: Boolean,
    default: false
  }
});

const Document = mongoose.model('Document', documentSchema);

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    } else if (item.endsWith('.md') && !item.includes('index.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Modified function to check if a markdown file already has a "Summarized by AI" section specifically
function hasSummarizedByAISection(content) {
  return /^#+\s*Summarized by AI/im.test(content);
}

// Function to check if a markdown file already has any summary section
function hasSummarySection(content) {
  // Check for common summary section headers
  const summaryHeaders = [
    /^#+\s*summary/i,
    /^#+\s*summarized by ai/i,
    /^<summary>/i,
    /^<!-- summary -->/i,
    /^summary:/i,
    /^## TL;DR/i,
    /^## Key Points/i
  ];
  
  return summaryHeaders.some(pattern => pattern.test(content));
}

// Function to generate a summary using OpenAI
async function generateSummary(markdownContent, title) {
  try {
    console.log(`Generating summary for: ${title}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can use gpt-4 for better summaries
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes technical documentation. Create a concise summary that captures the key points of the document in 3-5 bullet points. Focus on practical knowledge and main concepts. Do not include any headings in your response, just the bullet points."
        },
        {
          role: "user",
          content: `Please create a summary for the following document titled "${title}":\n\n${markdownContent}`
        }
      ],
      max_tokens: 500,
      temperature: 0.5,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

// Function to add a summary to the markdown file
async function addSummaryToFile(filePath, summary, forceRegenerate = false) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Only skip if the file has a "Summarized by AI" section and we're not forcing regeneration
    if (hasSummarizedByAISection(content) && !forceRegenerate) {
      console.log(`File already has a "Summarized by AI" section: ${filePath}`);
      return false;
    }
    
    // If the file has a different summary format and we're not forcing, convert it
    let updatedContent = content;
    if (hasSummarySection(content) && !hasSummarizedByAISection(content) && !forceRegenerate) {
      // Replace existing summary with "Summarized by AI"
      updatedContent = content.replace(/^(#+)\s*(summary|tl;dr|key points)/im, '$1 Summarized by AI');
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`Renamed summary section to "Summarized by AI" in: ${filePath}`);
      return true;
    }
    
    // If forcing regeneration, remove any existing summary
    if (forceRegenerate && hasSummarySection(content)) {
      // Remove the entire summary section including the heading, content, and separator
      updatedContent = content.replace(/^#+\s*(summary|summarized by ai|tl;dr|key points)[\s\S]*?---\s*\n/im, '');
    }
    
    // Format the summary block - place at the very top with "Summarized by AI" heading
    const summaryBlock = `# Summarized by AI

${summary}

---

`;
    
    // Add the summary at the top of the file
    updatedContent = summaryBlock + updatedContent;
    await fs.writeFile(filePath, updatedContent, 'utf8');
    console.log(`Added summary to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    return false;
  }
}

// Function to extract metadata from file path (similar to import-content.js)
function extractMetadata(filePath) {
  // Normalize path for consistent processing
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Get relative path from the content directory
  const contentDirPath = path.resolve(__dirname, '..', 'content').replace(/\\/g, '/');
  const relativePath = normalizedPath.replace(contentDirPath + '/', '');
  
  // Skip index.md
  if (relativePath === 'index.md') {
    return null;
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
      subcategory: '',
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

// Main function to process files and add summaries
async function summarizeContent(forceRegenerate = false) {
  try {
    console.log('Starting content summarization...');
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set in your .env file');
      process.exit(1);
    }
    
    const contentDir = path.resolve(__dirname, '..', 'content');
    console.log('Content directory:', contentDir);
    
    // Find all markdown files (excluding index.md)
    const markdownFiles = await scanDirectory(contentDir);
    console.log(`Found ${markdownFiles.length} markdown files to process.`);
    
    if (markdownFiles.length === 0) {
      console.log('No files to process. Exiting.');
      await mongoose.disconnect();
      return;
    }
    
    // Process each file
    for (const filePath of markdownFiles) {
      const metadata = extractMetadata(filePath);
      if (!metadata) continue;
      
      const markdownContent = await fs.readFile(filePath, 'utf8');
      
      // Skip if file already has a summary and we're not forcing regeneration
      if (hasSummarizedByAISection(markdownContent) && !forceRegenerate) {
        console.log(`File already has a "Summarized by AI" section: ${filePath}`);
        continue;
      }
      
      // Generate summary
      const summary = await generateSummary(markdownContent, metadata.title);
      if (!summary) {
        console.log(`Failed to generate summary for: ${filePath}`);
        continue;
      }
      
      // Add summary to the file
      const updated = await addSummaryToFile(filePath, summary, forceRegenerate);
      
      // If file was updated, mark it as having a summary in the database
      if (updated) {
        // Update the document in MongoDB
        await Document.findOneAndUpdate(
          { path: metadata.path },
          { hasSummary: true }
        );
      }
    }
    
    console.log('Content summarization completed.');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    return true;
  } catch (error) {
    console.error('Summarization process failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Check if force parameter was passed
const shouldForceRegenerate = process.argv.includes('--force');
console.log(shouldForceRegenerate ? 'Forcing regeneration of all summaries' : 'Only generating summaries for files without "Summarized by AI" section');

// Run the summarization process with force parameter
summarizeContent(shouldForceRegenerate).then(() => {
  console.log('Summarization process completed successfully.');
  process.exit(0);
}); 