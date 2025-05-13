# Knowledge Base Application - hub.fatequod.com

A lightweight knowledge base application that transforms Markdown files into an organized HTML knowledge center. The application provides a user-friendly interface with navigation sidebar and automatic content organization.

## Project Overview

This application serves as a convenient way to store, organize, and access documentation in Markdown format. It automatically:

- Converts Markdown files to HTML for web viewing
- Organizes content by categories and subcategories
- Generates heading IDs for anchor links
- Creates AI-powered summaries of content

## Key Features

- **Markdown Support**: Store all your documentation in easy-to-write Markdown format
- **Category Organization**: Structured navigation with categories and subcategories
- **Content Processing**:
  - Automatic heading ID generation for anchor links
  - AI-powered content summarization via OpenAI
  - Markdown to HTML conversion
- **Navigation**:
  - Left sidebar for category/document navigation
  - On-page navigation with heading anchors
- **Modern UI**: Clean, responsive interface with light/dark mode support

## Tech Stack

- **Frontend**: React, React Router, Axios, Marked, DOMPurify
- **Backend**: Express.js, MongoDB/Mongoose
- **Content Processing**: OpenAI API for summarization, custom heading ID generation

## Scripts and Utilities

The application includes several utility scripts:

- `add-heading-ids.js`: Automatically adds heading IDs to Markdown files
- `import-content.js`: Imports Markdown files into the database
- `summarize-content.js`: Generates AI summaries for content
- `prepare-content`: Combined script to prepare all content

## Content Structure

Place your Markdown files in the `content/` directory using this structure:
```
content/
├── Category/
│   ├── Subcategory/
│   │   ├── Document1.md
│   │   └── Document2.md
│   └── AnotherSubcategory/
│       └── Document3.md
└── AnotherCategory/
    └── Subcategory/
        └── Document4.md
```

## Getting Started

1. Set up environment variables in `.env` file:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```

2. Install dependencies:
   ```
   cd backend && npm install
   cd frontend && npm install
   ```

3. Prepare your content:
   ```
   cd backend
   npm run prepare-content
   ```

4. Start the application:
   ```
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd frontend
   npm run dev
   ```

## Access

The application uses URLs of the format:
```
/Category/Subcategory/Document.html
```

## Project Structure

- `frontend/` - React application
- `backend/` - Express and MongoDB backend
- `content/` - Markdown files organized by category and subcategory

## Features

- Navigation sidebar with categories and subcategories
- Markdown to HTML conversion
- Simple URL structure (e.g., Tools/Apps.html)
- No login required
- No search functionality
- Import Markdown files from directory structure
- Automatic content summarization using LLM
- On-page navigation with heading anchors
- Automatic heading ID generation for anchor links

## Dependencies

### Backend
- Express.js
- MongoDB with Mongoose
- Marked (for Markdown to HTML conversion)
- CORS
- dotenv
- OpenAI (for content summarization)

### Frontend
- React
- React Router DOM
- Axios

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key (for summarization feature)

### Environment Setup
1. In the backend directory, create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourAppName
   OPENAI_API_KEY=your_openai_api_key
   ```
   Make sure to replace the `MONGODB_URI` and `OPENAI_API_KEY` values with your actual credentials.

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Content Management

### Directory Structure
Place your Markdown files in the `content/` directory following this structure:
```
content/
├── Category1/
│   ├── Subcategory1/
│   │   ├── Document1.md
│   │   └── Document2.md
│   └── Subcategory2/
│       └── Document3.md
└── Category2/
    └── Subcategory3/
        └── Document4.md
```

For example:
```
content/
├── Core/
│   └── Development/
│       └── Process.md
└── Tools/
    └── Software/
        └── Apps.md
```

### Importing Content
To import your Markdown files into the database:

1. Make sure your MongoDB connection is working
2. Run the import script:
   ```
   cd backend
   npm run import-content
   ```

The script will:
- Scan the `content/` directory for all .md files
- Convert Markdown files to HTML
- Store them in the database with the appropriate category/subcategory structure
- Update existing documents if they've changed
- **Remove documents from the database if they no longer exist in the content directory**

This ensures your database stays perfectly synchronized with your content directory structure.

### Adding Heading IDs
The application supports automatic generation of heading IDs for anchor links in your Markdown content. You can run:

```
npm run add-heading-ids
```

This will:
- Scan all Markdown files in your content directory
- Add unique IDs to all headings in the format `## Heading Text {#heading-id}`
- Skip any headings that already have IDs or are summary headings
- Preserve your content while making it more navigable

### Content Summarization
The application can automatically generate summaries for your Markdown content using OpenAI's GPT model:

1. Make sure you have set your `OPENAI_API_KEY` in the `.env` file
2. Run the summarization script:
   ```
   npm run summarize-content
   ```

The script will:
- Scan all Markdown files (excluding index.md)
- Check if they already have a summary section
- Generate a concise summary with key points for files without summaries
- Add the summary to the top of each file in a "Summarized by AI" section
- Update the database to track which files have summaries

Summaries are formatted with a distinctive style at the top of each document for easy reference. They appear as a highlighted section with a left border in the rendered HTML.

### Complete Content Preparation
You can run a single command to prepare all your content:

```
npm run prepare-content
```

This will:
1. Add heading IDs to all Markdown files
2. Import all content to the database
3. Generate summaries for documents without summaries

Or to run everything and start the application:

```
npm run complete-update
```

## Page Navigation

The application provides two types of navigation:

1. **Left sidebar**: Shows category, subcategory, and document structure
2. **Right sidebar**: Shows "On this page" navigation with links to all headings in the current document

The right sidebar automatically:
- Extracts all headings from the current document
- Creates anchor links to each heading
- Indents sub-headings to show document structure
- Hides when viewing on smaller screens

Each heading in the document gets a unique ID based on its text, making it easy to create deep links to specific sections.

## Usage

### URL Structure
The application uses URLs of the following format:
```
/Category/Subcategory/Document.html
```

For example:
```
/Tools/Software/Apps.html
/Core/Development/Process.html
```

### Adding New Content
1. Create a new Markdown file in the appropriate category/subcategory folder
2. Run the complete content preparation: `npm run prepare-content`
3. Access it through the sidebar navigation or direct URL

## License
ISC 