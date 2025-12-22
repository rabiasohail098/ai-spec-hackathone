from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Physical AI & Humanoid Robotics RAG Chatbot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    # API Keys
    OPENAI_API_KEY: Optional[str] = None  # Made optional
    QDRANT_API_KEY: Optional[str] = None  # Made optional for local instance
    QDRANT_URL: Optional[str] = "http://localhost:6333"  # Default to local instance
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None  # Deprecated - using OpenRouter

    # OpenRouter Configuration (Primary LLM)
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"  # GPT-4o-mini via OpenRouter

    # Database
    DATABASE_URL: str = "sqlite:///./robotics_app.db"  # Default SQLite
    COLLECTION_NAME: str = "book_knowledge"

    # Origins
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Model settings
    EMBEDDING_MODEL: str = "text-embedding-3-small"  # OpenAI embedding model
    LLM_MODEL: str = "gpt-3.5-turbo"  # OpenAI Chat model
    CHUNK_SIZE: int = 1000  # Tokens per chunk for content ingestion
    CHUNK_OVERLAP: int = 200  # Token overlap between chunks

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields to prevent validation errors


settings = Settings()