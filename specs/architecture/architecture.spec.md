# Architecture Specification

## Overview
This document specifies the overall architecture requirements for the Physical AI & Humanoid Robotics Interactive Book with RAG Chatbot.

## Core Architecture Requirements

### 1. System Components
- Frontend: Docusaurus-based static site generator
- Backend: FastAPI REST API service
- Vector Database: Qdrant for content retrieval
- Relational Database: PostgreSQL (Neon) for conversation history
- AI Services: OpenAI for LLM capabilities
- Subagent System: OpenAI Functions for specialized tasks

### 2. Component Communication
- Frontend communicates with Backend via REST API
- Backend queries Vector Database for RAG
- Backend stores conversation history in PostgreSQL
- Backend uses AI services for response generation
- Components use environment variables for configuration

### 3. Data Flow
1. User interacts with frontend
2. Frontend sends request to backend
3. Backend processes query using subagents
4. If needed, backend retrieves content from vector store
5. Backend generates response using AI
6. Response is sent back to frontend
7. Conversation may be stored in PostgreSQL

### 4. Separation of Concerns
- Frontend handles presentation and user interaction
- Backend handles business logic and AI integration
- Databases handle data persistence
- MCP services handle context provisioning

### 5. Scalability Requirements
- Horizontal scaling capability
- Asynchronous processing for heavy computations
- Caching mechanisms for frequently accessed content
- Load balancing readiness

### 6. Security Requirements
- API key validation
- Rate limiting
- Secure communication (HTTPS)
- Environment variable protection
- User data privacy

### 7. Performance Requirements
- Response time under 3 seconds for most queries
- Support for concurrent users
- Efficient vector search operations
- Optimized content delivery
