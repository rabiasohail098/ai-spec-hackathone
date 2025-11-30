# Physical AI & Humanoid Robotics Book

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator. It serves as an educational resource for the **Physical AI & Humanoid Robotics** course, providing comprehensive documentation on Physical AI, embodied intelligence, and humanoid robotics development.

## About the Book

This textbook covers the essential concepts needed to understand and develop **Physical AI** systems - AI that operates in the physical world and bridges the gap between digital intelligence and physical embodiment. The book focuses on:

- **ROS 2 (Robot Operating System 2)** for robotic control
- **Simulation environments** (Gazebo and Unity) for digital twins
- **NVIDIA Isaac Platform** for AI-powered robotics
- **Vision-Language-Action (VLA)** systems that connect language to physical action
- **Hardware requirements** for Physical AI development

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Integration with RAG System

This book is designed to work with our integrated RAG (Retrieval-Augmented Generation) backend that allows readers to ask questions about the book content and receive contextually relevant answers based on the book's material. The system uses:

- Vector embeddings to store and retrieve content
- Natural language processing to understand user queries
- AI models to generate responses based on the book content

For setup and usage of the RAG system, see the `rag-backend` directory in the project root.
