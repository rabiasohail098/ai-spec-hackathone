"""
Test Message model for debugging
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from typing_extensions import Literal  # Try importing from typing_extensions


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    content: str = Field(description="Message text content")
    role: str = Field(description="Message sender role")  # Changed from Literal to str
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    sources: Optional[str] = Field(default=None, description="JSON string of source citations")


if __name__ == "__main__":
    print("Testing simple message class...")
    try:
        msg = Message(conversation_id=1, content="test", role="user")
        print("Success! Created Message instance:", msg)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()