# API Endpoints Specification

## Overview
This document specifies the API endpoints for the Physical AI & Humanoid Robotics RAG Chatbot backend service.

## Common Headers

### Required Headers
- `Content-Type: application/json` for POST requests
- `Authorization: Bearer <API_KEY>` for authenticated requests

## API Versioning
- Base path: `/api/v1/`
- Version included in path to maintain backward compatibility
- New versions will be added as `/api/v2/`, etc.

## Endpoint: Chat

### POST /api/v1/chat/
**Purpose**: Process user queries and return AI-generated responses

#### Request
```json
{
  "question": "string, required - User's question or query",
  "context_text": "string | null, optional - User-provided context from text selection",
  "user_id": "string | null, optional - User identifier for conversation tracking",
  "conversation_id": "string | null, optional - Existing conversation identifier"
}
```

#### Response (Success - 200 OK)
```json
{
  "answer": "string - AI-generated response to the question",
  "sources": "string[] - Array of sources used in the response",
  "conversation_id": "string | null - Id of the conversation, if applicable"
}
```

#### Response (Error - 400 Bad Request)
```json
{
  "detail": "string - Error message indicating the problem"
}
```

#### Response (Error - 401 Unauthorized)
```json
{
  "detail": "string - Authentication error message"
}
```

#### Response (Error - 500 Internal Server Error)
```json
{
  "detail": "string - Server error message"
}
```

#### Examples

**Request:**
```json
{
  "question": "Explain how digital twins work in robotics?",
  "context_text": null,
  "user_id": "user-123",
  "conversation_id": null
}
```

**Response:**
```json
{
  "answer": "Digital twins in robotics are virtual replicas of physical robots that allow us to simulate, analyze, and optimize their behavior before implementing changes in the real world...",
  "sources": ["book_content"],
  "conversation_id": "conv-456"
}
```

## Endpoint: Health Check

### GET /health
**Purpose**: Check the health status of the API service

#### Response (Success - 200 OK)
```json
{
  "status": "string - Health status ('healthy')",
  "version": "string - API version"
}
```

#### Examples

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## Endpoint: Ingest Document (Planned)

### POST /api/v1/ingest/
**Purpose**: Ingest new documents into the vector database (future functionality)

#### Request
```json
{
  "content": "string, required - Content of the document",
  "source": "string, required - Source identifier",
  "title": "string, required - Title of the document"
}
```

#### Response (Success - 200 OK)
```json
{
  "message": "string - Confirmation message",
  "document_id": "string | null - Id of the ingested document"
}
```

## Rate Limiting

### Limits
- 100 requests per minute per IP address
- 1000 requests per hour per user (if authenticated)

### Response (Rate Limited - 429 Too Many Requests)
```json
{
  "detail": "string - Rate limit exceeded message"
}
```

## Security Requirements

### API Key Validation
- All endpoints (except health check) require valid API key
- API keys should be passed in Authorization header
- Invalid or missing API keys return 401 Unauthorized

### Input Validation
- All string inputs are validated for length and content
- Malicious content is filtered
- Proper escaping of special characters

## Error Handling

### Standard Error Format
All error responses follow the format:
```json
{
  "detail": "string - Descriptive error message"
}
```

### Common Error Codes
- 400: Bad Request - Invalid input parameters
- 401: Unauthorized - Missing or invalid API key
- 404: Not Found - Requested resource not found
- 422: Unprocessable Entity - Input validation failed
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Server-side error

## Performance Requirements

### Response Time
- 95% of requests should respond within 3 seconds
- 99% of requests should respond within 5 seconds
- Health check endpoint should respond within 100ms

### Throughput
- Support for 100 concurrent requests
- Automatic scaling based on load
- Proper resource management under load

## Documentation
- API documentation available at `/docs` endpoint
- Interactive API explorer at `/redoc` endpoint
- OpenAPI specification available at `/openapi.json`