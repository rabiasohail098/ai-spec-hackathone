# Quickstart Guide: AI-Driven Hackathon Project

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Qdrant vector database (can run locally or remotely)
- OpenAI API key

## Project Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Set up environment variables:
   Create `.env` files in both the rag-backend and spec-engine directories with the following variables:
   
   For rag-backend:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   QDRANT_URL=your_qdrant_url_here
   QDRANT_API_KEY=your_qdrant_api_key_here (if applicable)
   ```
   
   For spec-engine:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Install dependencies:

   For spec-engine:
   ```bash
   cd spec-engine
   npm install
   ```

   For rag-backend:
   ```bash
   cd rag-backend
   pip install -r requirements.txt
   ```

4. For book-ui (if not already set up):
   ```bash
   cd book-ui
   npm install
   ```

## Running the Application

### Step 1: Generate Book Content

1. Ensure your book specification is defined in `spec-engine/book_spec.toml`
2. Run the spec-engine to generate book content:
   ```bash
   cd spec-engine
   npm run generate
   ```
   This will generate markdown files with proper frontmatter and save them to the `book-ui/docs` folder.

### Step 2: Index Content in Vector Database

1. Ensure Qdrant database is running
2. Run the ingestion script to index the generated content:
   ```bash
   cd rag-backend
   python ingest.py
   ```
   This reads the markdown files from `book-ui/docs`, chunks them, embeds them, and stores them in Qdrant.

### Step 3: Start the RAG-Backend API

1. Start the FastAPI application:
   ```bash
   cd rag-backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. API endpoints:
   - `/chat` - POST endpoint to ask questions about the book content
   - `/health` - GET endpoint to check the health of the service
   - `/docs` - Interactive API documentation

### Step 4: Start the Book UI (Optional)

1. Start the Docusaurus documentation site:
   ```bash
   cd book-ui
   npm start
   ```
   The documentation site will be available at `http://localhost:3000`

## Testing the API

You can test the chat endpoint using curl:

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the main concepts covered in this book?",
    "top_k": 3
  }'
```

## Troubleshooting

- If you get OpenAI API errors, verify your API key is correct and has sufficient quota
- If Qdrant connection fails, ensure the database is running and credentials are correct
- For content generation issues, check the book_spec.toml file format and OpenAI API key