import logging
from typing import Generator

import uvicorn
from app.api import chat_router
from app.core.config import settings
from app.core.error_handling import APIError, global_exception_handler
from app.core.logging_config import setup_logging
from app.database import get_session
from app.database.database import engine
from app.models.user import User
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

# Set up logging
setup_logging(log_level=settings.LOG_LEVEL)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="RAG Chatbot for Physical AI & Humanoid Robotics Book",
)

# Add exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Add middleware in proper order
from app.core.middleware import RequestLoggingMiddleware

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add gzip compression middleware
from starlette.middleware.gzip import GZipMiddleware

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,  # Only compress responses larger than 1000 bytes
)

# Add rate limiting middleware
from app.core.rate_limiting import RateLimitMiddleware

app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=100,  # 100 requests per minute per IP
)


# Event handler to create database tables on startup
@app.on_event("startup")
def on_startup():
    # Create all database tables
    SQLModel.metadata.create_all(engine)


# Include API routes
from app.api.auth_router import router as auth_router
from app.api.chat_router import router as chat_router

app.include_router(chat_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth")

# Add new API endpoints for content personalization and translation
from typing import Optional

from app.services.personalization_service import get_personalization_service
from app.services.translation_service import get_translation_service
from pydantic import BaseModel


# Request/Response models for translation
class TranslationRequest(BaseModel):
    text: str
    target_language: str  # ur, ar, es, fr
    source_language: str = "en"
    context: Optional[str] = None
    preserve_formatting: bool = True


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    target_language_name: str
    character_count: int
    processing_time: float
    is_rtl: bool


# Request/Response models for personalization
class PersonalizationRequest(BaseModel):
    content: str
    user_id: Optional[int] = None
    learning_level: Optional[str] = None  # beginner, intermediate, advanced
    chapter_context: Optional[str] = None
    content_type: str = "section"


class PersonalizationResponse(BaseModel):
    original_content: str
    personalized_content: str
    learning_level: str
    level_name: str
    level_icon: str
    level_color: str
    adjustments_made: list
    processing_time: float


@app.post("/api/v1/translate", response_model=TranslationResponse)
async def translate_content(request: TranslationRequest):
    """
    REAL translation endpoint using OpenAI API

    Supports multiple languages:
    - ur: Urdu (RTL)
    - ar: Arabic (RTL)
    - es: Spanish
    - fr: French

    Features:
    - Context-aware translation for technical content
    - Markdown formatting preservation
    - Automatic chunking for long content
    """
    translation_service = get_translation_service()

    try:
        result = translation_service.translate_text(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language,
            context=request.context,
            preserve_formatting=request.preserve_formatting,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@app.post("/api/v1/personalize", response_model=PersonalizationResponse)
async def personalize_content(request: PersonalizationRequest):
    """
    REAL personalization endpoint using OpenAI API

    Adapts content to user's learning level:
    - beginner: Simplified terminology, basic examples
    - intermediate: Balanced technical depth
    - advanced: In-depth technical content

    Features:
    - User-level detection from database
    - Context-aware adaptation
    - Automatic chunking for long content
    """
    personalization_service = get_personalization_service()

    try:
        result = personalization_service.personalize_content(
            content=request.content,
            user_id=request.user_id,
            learning_level=request.learning_level,
            chapter_context=request.chapter_context,
            content_type=request.content_type,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personalization failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "Physical AI & Humanoid Robotics RAG Chatbot API"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
    )
