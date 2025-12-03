"""
Database connection and session management for the application.

This module provides database initialization, session management, and dependency
injection for FastAPI routes using SQLModel and SQLAlchemy.
"""

from typing import Generator
from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# Create the database engine
# For SQLite, we need to ensure the directory exists
if settings.DATABASE_URL.startswith("sqlite"):
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

# Create engine with connection pooling for PostgreSQL
# For SQLite, pooling is disabled by default
engine_kwargs = {
    "echo": False  # Set to True for SQL query logging
}

# Add pooling only for PostgreSQL
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({
        "pool_pre_ping": True,  # Verify connections before using
        "pool_size": 10,        # Number of connections to maintain
        "max_overflow": 20      # Additional connections when pool is full
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)


def init_db() -> None:
    """
    Initialize database tables.

    Creates all tables defined in SQLModel metadata.
    Should be called on application startup.

    Note: In production, use Alembic migrations instead of create_all().
    """
    try:
        # Import all models to ensure they're registered with SQLModel
        from app.models.user import User
        from app.models.conversation import Conversation
        from app.models.message import Message

        # Create all tables
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def get_session() -> Generator[Session, None, None]:
    """
    Dependency injection for database sessions in FastAPI routes.

    Yields:
        Session: SQLModel session object

    Usage:
        @app.get("/users")
        def get_users(session: Session = Depends(get_session)):
            users = session.exec(select(User)).all()
            return users
    """
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()


def check_db_connection() -> bool:
    """
    Check if database connection is working.

    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False