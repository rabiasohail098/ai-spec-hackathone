# RAG Backend for Physical AI & Humanoid Robotics Book

This directory contains the Retrieval-Augmented Generation (RAG) backend for the **Physical AI & Humanoid Robotics** textbook project. The backend is responsible for ingesting book content into a vector database and providing an API for intelligent querying of the content related to Physical AI, embodied intelligence, and humanoid robotics.

## Features

- Ingests Markdown files from `../book-ui/docs/` into a Qdrant vector database
- Uses OpenAI's embedding model to create vector representations of content
- Provides an API endpoint for querying the content with context-aware responses
- Implements proper error handling and logging
- Supports querying about ROS 2, Gazebo, NVIDIA Isaac, VLA systems, and hardware requirements

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in a `.env` file:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   QDRANT_URL=your-qdrant-cloud-url
   QDRANT_API_KEY=your-qdrant-api-key
   ```

3. Run the ingestion script to populate the vector database:
   ```bash
   python ingest.py
   ```

4. Start the API server:
   ```bash
   python main.py
   ```

## Available Scripts

- `ingest.py`: Processes Markdown files and uploads content to Qdrant
- `main.py`: Starts the FastAPI server with RAG endpoints
- `check_models.py`: Verifies that required OpenAI models are available
- `test_key.py`: Tests the OpenAI API key functionality

## API Endpoints

- `POST /chat`: Accepts a question and returns a context-aware answer
- `GET /health`: Health check endpoint
- `GET /collections`: Lists available Qdrant collections

## Architecture

The RAG system works as follows:
1. Content is stored as Markdown files in `../book-ui/docs/` covering Physical AI, ROS 2, Gazebo simulation, NVIDIA Isaac platform, VLA systems, and hardware requirements
2. The ingestion script processes these files, splits them into chunks, and generates embeddings
3. Embeddings are stored in a Qdrant vector database
4. When a query is made, the system:
   - Embeds the query using the same model
   - Searches for similar content in the vector database
   - Constructs a prompt with the relevant context
   - Generates a response using the OpenAI model based on the context

## Integration with Book UI

This RAG backend is designed to provide intelligent querying capabilities for the Physical AI & Humanoid Robotics textbook. Users can ask questions about:
- ROS 2 (Robot Operating System 2) fundamentals
- Simulation environments like Gazebo and Unity
- NVIDIA Isaac platform for AI-powered robotics
- Vision-Language-Action (VLA) systems
- Hardware requirements for Physical AI development
- Course structure and learning outcomes