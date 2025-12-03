from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from app.core.input_sanitization import InputSanitizer
from app.database import get_session
from app.models.user import (
    Token,
    User,
    UserCreate,
    UserPublic,
    UserUpdate,
    authenticate_user_sync,
    create_access_token,
    get_current_user_from_token_sync,
    get_password_hash,
)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from sqlmodel import Session, select

# Initialize the auth router
auth_router = APIRouter()


class UserRegistration(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    software_background: Optional[str] = None
    hardware_background: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ReadingProgressUpdate(BaseModel):
    chapter_id: str
    completed: bool = False
    last_position: Optional[str] = None
    time_spent: Optional[int] = None  # in seconds


class PreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications: Optional[bool] = None


@auth_router.post("/register", response_model=UserPublic)
def register_user(user_data: UserRegistration, session: Session = Depends(get_session)):
    # Sanitize inputs
    sanitized_email = InputSanitizer.sanitize_text(user_data.email, max_length=255)
    sanitized_first_name = (
        InputSanitizer.sanitize_text(user_data.first_name, max_length=100)
        if user_data.first_name
        else None
    )
    sanitized_last_name = (
        InputSanitizer.sanitize_text(user_data.last_name, max_length=100)
        if user_data.last_name
        else None
    )
    sanitized_software_background = (
        InputSanitizer.sanitize_text(user_data.software_background, max_length=500)
        if user_data.software_background
        else None
    )
    sanitized_hardware_background = (
        InputSanitizer.sanitize_text(user_data.hardware_background, max_length=500)
        if user_data.hardware_background
        else None
    )

    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == sanitized_email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Create new user
    hashed_password = get_password_hash(
        user_data.password
    )  # Don't sanitize password as it may contain special chars needed for security
    db_user = User(
        email=sanitized_email,
        first_name=sanitized_first_name,
        last_name=sanitized_last_name,
        hashed_password=hashed_password,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


@auth_router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, session: Session = Depends(get_session)):
    # Sanitize email input
    sanitized_email = InputSanitizer.sanitize_text(user_data.email, max_length=255)

    user = authenticate_user_sync(
        session, sanitized_email, user_data.password
    )  # Don't sanitize password
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=30)  # 30 minutes expiry
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.post("/logout")
def logout_user():
    # In a real implementation, you might want to invalidate tokens
    # For now, we just return a success response
    return {"message": "Successfully logged out"}


@auth_router.get("/me", response_model=UserPublic)
def get_current_user_info(
    token: str = Depends(HTTPBearer()), session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        user = get_current_user_from_token_sync(token.credentials, session)
        return user
    except Exception:
        raise credentials_exception


@auth_router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest, session: Session = Depends(get_session)
):
    # Sanitize email input
    sanitized_email = InputSanitizer.sanitize_text(request.email, max_length=255)

    # Find user by email
    user = session.exec(select(User).where(User.email == sanitized_email)).first()

    # We don't reveal if the user exists or not for security reasons
    # In a real implementation, we would send an email with reset instructions
    return {
        "message": "If the email exists in our system, a password reset link will be sent"
    }


# T138: Update reading progress endpoint
@auth_router.post("/reading-progress")
def update_reading_progress(
    progress: ReadingProgressUpdate,
    token: str = Depends(HTTPBearer()),
    session: Session = Depends(get_session),
):
    """Update user's reading progress for a specific chapter"""
    user = get_current_user_from_token_sync(token.credentials, session)

    # Sanitize chapter_id
    sanitized_chapter_id = InputSanitizer.sanitize_text(
        progress.chapter_id, max_length=100
    )

    # Initialize reading_progress if None
    if user.reading_progress is None:
        user.reading_progress = {}

    # Update progress for the chapter
    user.reading_progress[sanitized_chapter_id] = {
        "completed": progress.completed,
        "last_position": progress.last_position,
        "time_spent": progress.time_spent or 0,
        "updated_at": datetime.utcnow().isoformat(),
    }

    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"message": "Reading progress updated", "progress": user.reading_progress}


# T139: Get reading progress endpoint
@auth_router.get("/reading-progress")
def get_reading_progress(
    token: str = Depends(HTTPBearer()), session: Session = Depends(get_session)
):
    """Get user's reading progress for all chapters"""
    user = get_current_user_from_token_sync(token.credentials, session)

    return {
        "reading_progress": user.reading_progress or {},
        "learning_level": user.learning_level or "intermediate",
    }


# T140: Get reading progress for specific chapter
@auth_router.get("/reading-progress/{chapter_id}")
def get_chapter_progress(
    chapter_id: str,
    token: str = Depends(HTTPBearer()),
    session: Session = Depends(get_session),
):
    """Get user's reading progress for a specific chapter"""
    user = get_current_user_from_token_sync(token.credentials, session)

    # Sanitize chapter_id
    sanitized_chapter_id = InputSanitizer.sanitize_text(chapter_id, max_length=100)

    progress = (
        user.reading_progress.get(sanitized_chapter_id, {})
        if user.reading_progress
        else {}
    )

    return {"chapter_id": sanitized_chapter_id, "progress": progress}


# Update user preferences
@auth_router.post("/preferences")
def update_preferences(
    preferences: PreferencesUpdate,
    token: str = Depends(HTTPBearer()),
    session: Session = Depends(get_session),
):
    """Update user preferences"""
    user = get_current_user_from_token_sync(token.credentials, session)

    # Initialize preferences if None
    if user.preferences is None:
        user.preferences = {}

    # Update preferences
    if preferences.theme:
        user.preferences["theme"] = InputSanitizer.sanitize_text(
            preferences.theme, max_length=50
        )
    if preferences.language:
        user.preferences["language"] = InputSanitizer.sanitize_text(
            preferences.language, max_length=10
        )
    if preferences.notifications is not None:
        user.preferences["notifications"] = preferences.notifications

    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)

    return {"message": "Preferences updated", "preferences": user.preferences}


# Get user preferences
@auth_router.get("/preferences")
def get_preferences(
    token: str = Depends(HTTPBearer()), session: Session = Depends(get_session)
):
    """Get user preferences"""
    user = get_current_user_from_token_sync(token.credentials, session)

    return {
        "preferences": user.preferences or {},
        "learning_level": user.learning_level or "intermediate",
    }


# Update user profile (first name and last name)
@auth_router.put("/profile", response_model=UserPublic)
def update_user_profile(
    user_data: UserUpdate,
    token: str = Depends(HTTPBearer()),
    session: Session = Depends(get_session),
):
    """Update user profile (first name and last name)"""
    user = get_current_user_from_token_sync(token.credentials, session)

    # Sanitize inputs
    if user_data.first_name is not None:
        user.first_name = InputSanitizer.sanitize_text(
            user_data.first_name, max_length=100
        )
    if user_data.last_name is not None:
        user.last_name = InputSanitizer.sanitize_text(
            user_data.last_name, max_length=100
        )

    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)

    return user


# Add the auth router to your main app
router = auth_router
