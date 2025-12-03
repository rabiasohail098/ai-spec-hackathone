# Physical AI & Humanoid Robotics Interactive Book

🎉 **STATUS: 64% COMPLETE (121/190 tasks) - FULLY OPERATIONAL** 🚀

This project implements a **production-ready interactive educational book** about Physical AI and Humanoid Robotics with a fully integrated **RAG (Retrieval-Augmented Generation) chatbot**.

## ✨ **Key Features**

✅ **12 Comprehensive Chapters** covering Physical AI fundamentals to advanced applications
✅ **RAG-Powered Chatbot** with semantic search and source citations
✅ **Text Selection AI Assistance** - Select any text → get instant AI explanations
✅ **Conversation Persistence** - Chat history saved across sessions
✅ **Mobile Responsive** - Works seamlessly on all devices
✅ **Semantic Search** - Find relevant content using AI embeddings
✅ **Intent Detection** - Summarize, Explain, Mind Map, Key Points

## 📊 **What's Working Now**

- ✅ Complete RAG system (Qdrant + OpenAI embeddings + GPT-3.5-turbo)
- ✅ Intelligent text selection with 4 action buttons
- ✅ Conversation management with localStorage persistence
- ✅ Source citations from book content
- ✅ Fallback to general knowledge when needed
- ✅ Database persistence (Postgres + SQLModel)
- ✅ Full authentication system
- ✅ Mobile-optimized interface

## 🚀 **Quick Start**

See `IMPLEMENTATION_SUMMARY.md` for detailed setup instructions and technical details.

## Project Structure

```
├── PROJECT_SPEC.md         # Project specifications and requirements
├── PROMPT.md              # Project prompt and objectives
├── README.md              # This file
├── book-ui/               # Docusaurus frontend for the interactive book
├── clean-backend/         # Clean, modular backend implementation
├── specs/                 # Specification files
└── history/               # Project history and documentation
```

## Components

### 1. Frontend (book-ui)
- Docusaurus-based interactive book interface
- Embedded chatbot component on every page
- Text selection detection with intent-based actions
- MCP (Model Context Protocol) integration for enhanced context
- Responsive design for various devices

### 2. Backend (clean-backend)
- FastAPI-based backend service
- OpenAI integration for LLM capabilities
- Qdrant vector database for content retrieval
- Subagent system using OpenAI Functions
- PostgreSQL for conversation history

### 3. MCP Integration
- Docusaurus MCP server connection for context enrichment
- GitHub Pages deployment with GitHub MCP server
- Enhanced context-aware responses based on repository content

## How It Works

1. The book-ui provides an interactive reading experience with educational content about robotics
2. The embedded chatbot appears as a floating button on every page
3. When users select text, the chatbot offers options like Summarize, Mind Map, Explain Simply, etc.
4. The backend processes queries using RAG system and subagents
5. MCP integration provides enhanced context from repository content
6. Responses are context-aware and tailored to robotics domain
7. For GitHub Pages deployment, the site connects to GitHub MCP server for repository-specific context

## Setup Instructions

### Backend Setup
1. Navigate to `clean-backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment: `cp .env.example .env` and add your API keys
4. Start the server: `python main.py`

### Frontend Setup
1. Navigate to `book-ui/`
2. Install dependencies: `npm install`
3. Start development server: `npm run start`

## Features

- Interactive chatbot on every page
- Text selection with intent recognition
- Context-aware question answering
- Summarization, mind mapping, and explanation capabilities
- Conversation history management
- Modular, scalable architecture