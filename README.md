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
- **Simple URL Structure**: URLs follow the format `/Category/Subcategory/Document.html`
- **No Login Required**: Public access to all knowledge base content

## Tech Stack

### Frontend
- React
- React Router DOM
- Axios
- Marked
- DOMPurify

### Backend
- Express.js
- MongoDB with Mongoose
- Marked (for Markdown to HTML conversion)
- CORS
- dotenv
- OpenAI (for content summarization)

## Project Structure

- `frontend/` - React application
- `backend/` - Express and MongoDB backend
- `content/` - Markdown files organized by category and subcategory

## Scripts and Utilities

The application includes several utility scripts:

- `add-heading-ids.js`: Automatically adds heading IDs to Markdown files
- `import-content.js`: Imports Markdown files into the database
- `summarize-content.js`: Generates AI summaries for content
- `prepare-content`: Combined script to prepare all content

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

### Content Workflow

1. **Adding Heading IDs**: Run `npm run add-heading-ids` to add unique IDs to all headings in the format `## Heading Text {#heading-id}`

2. **Importing Content**: Run `npm run import-content` to import your Markdown files into the database

3. **Content Summarization**: Run `npm run summarize-content` to generate AI summaries for your content using OpenAI

4. **Complete Preparation**: Or use `npm run prepare-content` to perform all of the above steps in sequence

### Page Navigation

The application provides two types of navigation:

1. **Left sidebar**: Shows category, subcategory, and document structure
2. **Right sidebar**: Shows "On this page" navigation with links to all headings in the current document

### Adding New Content
1. Create a new Markdown file in the appropriate category/subcategory folder
2. Run the complete content preparation: `npm run prepare-content`
3. Access it through the sidebar navigation or direct URL

## License
ISC 