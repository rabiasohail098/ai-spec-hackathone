from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Request Schemas
class ChatRequest(BaseModel):
    question: str
    context_text: Optional[str] = None  # For user-selected text
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None


class DocumentIngestRequest(BaseModel):
    content: str
    source: str
    title: str


# Response Schemas
class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    conversation_id: Optional[str] = None


class DocumentIngestResponse(BaseModel):
    message: str
    document_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str