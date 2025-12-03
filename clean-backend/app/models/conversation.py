"""
Conversation model for storing chat conversations between users and AI assistant.

This model represents a conversation thread that groups related messages together.
Each conversation belongs to a user and contains multiple messages.
"""

from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship


class Conversation(SQLModel, table=True):
    """
    Conversation model for grouping related messages into conversation threads.

    Attributes:
        id: Unique identifier for the conversation (auto-generated)
        user_id: Foreign key reference to the user who owns this conversation
        title: Auto-generated or user-provided title for the conversation
        created_at: Timestamp when the conversation was created
        updated_at: Timestamp when the conversation was last updated

    Relationships:
        user: Many-to-one relationship with User model
        messages: One-to-many relationship with Message model
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500, description="Conversation title")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    # user: Optional["User"] = Relationship(back_populates="conversations")
    # messages: List["Message"] = Relationship(back_populates="conversation")

    class Config:
        """Pydantic config"""
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "title": "Digital Twins in Robotics",
                "created_at": "2025-12-02T10:35:00Z",
                "updated_at": "2025-12-02T10:45:00Z"
            }
        }
