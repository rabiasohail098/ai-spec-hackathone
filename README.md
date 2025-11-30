# Physical AI & Humanoid Robotics Textbook

This project implements a comprehensive textbook for teaching **Physical AI & Humanoid Robotics** as part of a hackathon challenge. The project uses Claude Code and Spec-Kit Plus to create an AI-driven book with integrated RAG (Retrieval-Augmented Generation) chatbot functionality.

## About the Book

The **Physical AI & Humanoid Robotics** textbook provides comprehensive coverage of:

- **Physical AI and Embodied Intelligence** concepts
- **ROS 2 (Robot Operating System 2)** fundamentals for robotic control
- **Digital Twin technology** using Gazebo and Unity simulation environments
- **NVIDIA Isaac Platform** for AI-powered robotics development
- **Vision-Language-Action (VLA)** systems connecting LLMs with robotics
- **Hardware requirements** for Physical AI development
- **Course structure and learning outcomes** for Physical AI education

## Project Components

### 1. spec-engine
The specification-driven book generation engine written in TypeScript that:
- Reads book specifications from `book_spec.toml`
- Uses AI models to generate detailed chapter content
- Outputs content to the Docusaurus-based book UI

### 2. book-ui
A Docusaurus-based documentation site that:
- Displays the generated textbook content
- Provides navigation and search functionality
- Integrates with the RAG backend for intelligent querying

### 3. rag-backend
A Python FastAPI application that:
- Implements RAG (Retrieval-Augmented Generation) functionality
- Stores book content in a Qdrant vector database
- Provides API endpoints for intelligent book querying
- Uses OpenAI models for content-aware responses

## Hackathon Requirements Implemented

### Base Functionality (100 points)
- [x] AI/Spec-Driven Book Creation using Docusaurus
- [x] Integrated RAG Chatbot that answers questions about book content
- [x] RAG system uses OpenAI Agents/ChatKit SDKs, FastAPI, Neon Serverless Postgres, and Qdrant Cloud Free Tier

### Bonus Features

#### Reusable Intelligence (up to 50 extra points)
- [ ] Claude Code Subagents and Agent Skills for the book project

#### User Authentication & Personalization (up to 50 extra points)
- [ ] Signup and Signin using Better-Auth
- [ ] Background questions during signup about user's software/hardware experience
- [ ] Content personalization based on user background

#### Content Personalization (up to 50 extra points)
- [ ] Button to personalize content per chapter for logged-in users

#### Content Translation (up to 50 extra points)
- [ ] Button to translate content to Urdu per chapter for logged-in users

## Setup Instructions

### Prerequisites
- Node.js (for spec-engine and book-ui)
- Python 3.8+ (for rag-backend)
- Access to OpenAI API
- Qdrant Cloud account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-spec-hackathone
   ```

2. Set up the spec-engine:
   ```bash
   cd spec-engine
   npm install
   cd ..
   ```

3. Set up the book-ui:
   ```bash
   cd book-ui
   npm install
   cd ..
   ```

4. Set up the rag-backend:
   ```bash
   cd rag-backend
   pip install -r requirements.txt
   ```

5. Create environment files for each component with your API keys and configuration.

### Running the Project

1. Start the book UI:
   ```bash
   cd book-ui
   npm start
   ```

2. In a separate terminal, start the RAG backend:
   ```bash
   cd rag-backend
   python main.py
   ```

3. Generate book content (if needed):
   ```bash
   cd spec-engine
   npm run generate  # or equivalent command
   ```

4. Ingest book content into the RAG system:
   ```bash
   cd rag-backend
   python ingest.py
   ```

## Architecture

The system follows a monorepo approach with three distinct components:
- **spec-engine**: TypeScript/Node.js for automation
- **rag-backend**: Python/FastAPI for the RAG system
- **book-ui**: React/Docusaurus for the documentation site

## Directory Structure

```
├── book-ui/                 # Docusaurus documentation site
├── rag-backend/             # Python RAG backend
├── spec-engine/             # Book generation engine
├── specs/                   # Project specifications
│   └── 1-ai-hackathon-project/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── tasks.md         # Task breakdown
│       └── ...
└── README.md               # This file
```

## Deployment

The book UI can be deployed to GitHub Pages or Vercel, while the RAG backend can be deployed to any cloud provider that supports Python applications.

## Contributing

This project was developed as part of a hackathon to create teaching materials for Physical AI & Humanoid Robotics courses. Contributions to expand the content or improve the functionality are welcome.

## License

This project is part of the Panaversity initiative for teaching cutting-edge AI courses. See the repository for specific licensing information.

---

Built with ❤️ for the future of Physical AI education.