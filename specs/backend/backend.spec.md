# Backend Service Specification

## Overview
This document specifies the requirements for the FastAPI backend service that powers the RAG chatbot system.

## API Endpoints

### 1. Chat Endpoint
- **Path**: `/api/v1/chat/`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "question": "string",
    "context_text": "string | null",
    "user_id": "string | null",
    "conversation_id": "string | null"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "string",
    "sources": "string[]",
    "conversation_id": "string | null"
  }
  ```

### 2. Health Check Endpoint
- **Path**: `/health`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "string",
    "version": "string"
  }
  ```

## Subagent System Requirements

### 1. OpenAI Subagent
- Use OpenAI Functions for agent orchestration
- Available functions:
  - search_robotics_knowledge
  - perform_robotics_calculation
  - analyze_robotics_code
  - explain_robotics_concept

### 2. Intent Recognition
- Detect user intent from query: summarize, mindmap, explain, keypoints
- Process context-specific queries appropriately

## Database Integration

### 1. PostgreSQL Schema
- Users table with id, email, username
- Conversations table with user_id, title, created_at
- Messages table with conversation_id, content, role, timestamp
- Documents table with title, source, content_hash, content

### 2. Vector Database Integration
- Qdrant for document embeddings
- Support for semantic search
- Efficient retrieval of relevant content

## Environment Variables

### Required Variables:
- `OPENAI_API_KEY` - OpenAI API key
- `QDRANT_URL` - Qdrant cluster URL
- `QDRANT_API_KEY` - Qdrant API key
- `DATABASE_URL` - PostgreSQL connection string
- `MCP_API_KEY` - MCP server API key

### Optional Variables:
- `ANTHROPIC_API_KEY` - Anthropic API key
- `DEBUG` - Debug mode flag
- `SERVER_HOST` - Server host address
- `SERVER_PORT` - Server port number

## Error Handling

### 1. Standard Error Format
```json
{
  "detail": "error message"
}
```

### 2. Error Types
- 400: Bad Request - Invalid input
- 401: Unauthorized - Missing or invalid API key
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server error

## Security Requirements

### 1. Authentication
- API key validation for all endpoints
- Rate limiting to prevent abuse

### 2. Authorization
- User-specific data access controls
- Secure API key storage and transmission

## Performance Requirements

### 1. Response Time
- API endpoints should respond within 2 seconds
- Complex operations may require longer but should provide progress feedback

### 2. Concurrency
- Support for multiple concurrent requests
- Proper resource management under load