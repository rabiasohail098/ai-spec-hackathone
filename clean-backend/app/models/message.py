"""
Message model for storing individual chat messages within conversations.

This model represents a single message in a conversation, which can be either
from the user or from the AI assistant.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class Message(SQLModel, table=True):
    """
    Message model for storing individual messages within conversations.

    Attributes:
        id: Unique identifier for the message (auto-generated)
        conversation_id: Foreign key reference to the parent conversation
        content: The actual message text content
        role: Role of the message sender ('user' or 'assistant')
        timestamp: When the message was created
        sources: Optional JSON field storing source citations for AI responses

    Relationships:
        conversation: Many-to-one relationship with Conversation model
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    content: str = Field(description="Message text content")
    role: str = Field(description="Message sender role")  # Changed from Literal to str
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    sources: Optional[str] = Field(default=None, description="JSON string of source citations")

    # Relationships
    # conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    class Config:
        """Pydantic config"""
        json_schema_extra = {
            "example": {
                "conversation_id": 1,
                "content": "Explain how digital twins work in robotics?",
                "role": "user",
                "timestamp": "2025-12-02T10:35:15Z",
                "sources": None
            }
        }
