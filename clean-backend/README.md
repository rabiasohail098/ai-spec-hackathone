# Physical AI & Humanoid Robotics RAG Chatbot - Backend

This is the backend service for the interactive robotics book with integrated RAG chatbot.

## Architecture

The backend is built with:
- FastAPI for the web framework
- OpenAI for language model integration
- Qdrant for vector database
- PostgreSQL (Neon) for conversation history
- OpenAI Functions for subagent system

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. Start the server:
   ```bash
   python main.py
   ```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/v1/chat/` - Chat endpoint

## Features

- RAG-based question answering
- Intent recognition for selected text
- Subagent system with specialized capabilities
- Context-aware responses
- Conversation history (planned)

## Project Structure

```
app/
├── api/              # API routes
├── models/           # Database models
├── schemas/          # Pydantic schemas
├── agents/           # AI agent implementations
├── core/             # Core configurations
└── utils/            # Utility functions
```