"""
Chat Router - Enhanced with RAG Integration and Subagent Orchestration

T066: Integrate RAG system in chat endpoint
T067: Implement intent detection for action buttons
T068: Add context_text parameter handling for selected text
T069: Implement prompt engineering for different intents
T070: Return response with sources from book content
T126: Implement subagent orchestration in chat endpoint
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import logging
import json

from app.schemas.requests import ChatRequest, ChatResponse
from app.core.rag import get_rag_service
from app.core.config import settings
from app.database.database import get_session
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from sqlmodel import Session, select
from app.agents.subagents import get_subagent_orchestrator

router = APIRouter(prefix="/chat", tags=["chat"])

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get RAG service instance
rag_service = get_rag_service()
# Get subagent orchestrator instance
subagent_orchestrator = get_subagent_orchestrator()

from app.core.input_sanitization import InputSanitizer

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, session: Session = Depends(get_session)):
    """
    T066-T070, T126, T146-T148: Enhanced chat endpoint with RAG integration, subagent orchestration, and personalization

    Handles:
    - General Q&A with RAG (semantic search + LLM)
    - Text selection with intent-based actions
    - Source citations from book content
    - Conversation history context
    - Routing to specialized subagents (T126)
    - Input sanitization (T158)
    - Personalized responses based on user level (T146-T148)
    """
    try:
        # Sanitize the input request
        sanitized_question = InputSanitizer.sanitize_query(request.question)
        sanitized_context = InputSanitizer.sanitize_text(request.context_text) if request.context_text else None

        logger.info(f"Received query: {sanitized_question}")

        # T146-T148: Get user preferences for personalization if user_id is provided
        user_learning_level = "intermediate"  # default
        user_preferences = {}

        if hasattr(request, 'user_id') and request.user_id:
            user = session.get(User, request.user_id)
            if user:
                user_learning_level = user.learning_level or "intermediate"
                user_preferences = user.preferences or {}
                logger.info(f"Personalizing response for user {request.user_id} at {user_learning_level} level")

        # Validate input
        if not sanitized_question or not sanitized_question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )

        # Handle greetings first
        greeting_keywords = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]
        is_greeting = any(keyword in sanitized_question.lower() for keyword in greeting_keywords)

        if is_greeting:
            greeting_response = "Hello! 👋 I'm your AI assistant for Physical AI and Humanoid Robotics. I can help you with:\n\n" \
                              "• Understanding robotics concepts\n" \
                              "• Explaining ROS2 and digital twins\n" \
                              "• Learning about sensors, actuators, and AI integration\n" \
                              "• Summarizing, explaining, or creating mind maps from selected text\n\n" \
                              "What would you like to know today?"

            return ChatResponse(
                answer=greeting_response,
                sources=[],
                conversation_id=request.conversation_id
            )

        # T126: Try to route to specialized agents first based on the query
        subagent_response = await subagent_orchestrator.process_query_with_agents(
            sanitized_question
        )

        if subagent_response and subagent_response.success:
            logger.info(f"Subagent response generated: {subagent_response.result[:100]}...")
            return ChatResponse(
                answer=subagent_response.result,
                sources=subagent_response.sources or [],
                conversation_id=request.conversation_id
            )

        # T067: Detect intent from request or infer from question
        intent = detect_intent(sanitized_question, sanitized_context)

        # T068: Use context_text (selected text) if available
        selected_text = sanitized_context if sanitized_context else None

        # T093: Implement conversation context management
        # Convert request conversation history to format expected by RAG service
        conversation_history = []
        # TODO: In future, retrieve from database using conversation_id
        # For now, clients will send recent history in request if needed

        # T069-T070, T146-T148: Use RAG service for response generation with personalization
        # RAG service handles prompt engineering internally based on intent and user level
        result = rag_service.generate_response(
            query=sanitized_question,
            selected_text=selected_text,
            intent=intent,
            conversation_history=conversation_history,
            user_level=user_learning_level  # T146: Personalize based on learning level
        )

        # T070: Return response with sources from book content
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            conversation_id=request.conversation_id
        )

    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        logger.error(f"Error in chat_endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing your request"
        )


def detect_intent(question: str, context_text: Optional[str] = None) -> Optional[str]:
    """
    T067: Detect user intent from question text

    Intents:
    - summarize: User wants a summary
    - explain: User wants simple explanation
    - keypoints: User wants key points extracted
    - mindmap: User wants a mind map
    - None: General question

    Args:
        question: User's question text
        context_text: Optional selected text

    Returns:
        Intent string or None
    """
    if not context_text:
        # No context text, so no specific intent
        return None

    question_lower = question.lower()

    # Intent detection keywords
    intent_keywords = {
        "summarize": ["summarize", "summary", "concise", "tldr"],
        "explain": ["explain", "clarify", "understand", "what does", "what is", "eli5"],
        "keypoints": ["key points", "keypoints", "main points", "important", "critical"],
        "mindmap": ["mind map", "mindmap", "diagram", "visualize", "structure"],
        "simplify": ["simplify", "simpler", "make it simple", "easier", "dumb it down"],
        "brief": ["brief", "briefly", "quick answer", "short answer", "in short"],
        "elaborate": ["elaborate", "more detail", "expand", "tell me more", "go deeper"]
    }

    for intent_name, keywords in intent_keywords.items():
        if any(keyword in question_lower for keyword in keywords):
            return intent_name

    # No specific intent detected
    return None


@router.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


# T094-T097: Conversation Persistence Endpoints

@router.post("/conversations")
async def create_conversation(
    user_id: int,
    title: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    T094: Create a new conversation
    T097: Auto-generate title if not provided
    T158: Input sanitization
    """
    try:
        # Sanitize the title if provided
        if title:
            title = InputSanitizer.sanitize_text(title, max_length=500)

        # T097: Auto-generate title from timestamp if not provided
        if not title:
            title = f"Conversation - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"

        conversation = Conversation(
            user_id=user_id,
            title=title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        return {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "title": conversation.title,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Failed to create conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")


@router.get("/conversations/{conversation_id}")
async def get_conversation_history(
    conversation_id: int,
    session: Session = Depends(get_session)
):
    """
    T095: Get conversation history with all messages
    """
    try:
        # Get conversation
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Get all messages for this conversation
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.timestamp)

        messages = session.exec(statement).all()

        return {
            "conversation": {
                "id": conversation.id,
                "user_id": conversation.user_id,
                "title": conversation.title,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat()
            },
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "role": msg.role,
                    "timestamp": msg.timestamp.isoformat(),
                    "sources": msg.sources
                }
                for msg in messages
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get conversation history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversation")


@router.get("/conversations/user/{user_id}")
async def get_user_conversations(
    user_id: int,
    session: Session = Depends(get_session)
):
    """
    T096: Get all conversations for a user
    """
    try:
        statement = select(Conversation).where(
            Conversation.user_id == user_id
        ).order_by(Conversation.updated_at.desc())

        conversations = session.exec(statement).all()

        return {
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                }
                for conv in conversations
            ]
        }

    except Exception as e:
        logger.error(f"Failed to get user conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations")


@router.post("/conversations/{conversation_id}/messages")
async def save_message(
    conversation_id: int,
    content: str,
    role: str,
    sources: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """
    T094: Save a message to a conversation
    T158: Input sanitization
    """
    try:
        # Sanitize inputs
        sanitized_content = InputSanitizer.sanitize_text(content, max_length=10000)
        sanitized_role = role if role in ['user', 'assistant'] else 'user'  # Validate role
        sanitized_sources = InputSanitizer.sanitize_text(sources, max_length=5000) if sources else None

        # Verify conversation exists
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Create message
        message = Message(
            conversation_id=conversation_id,
            content=sanitized_content,
            role=sanitized_role,
            timestamp=datetime.utcnow(),
            sources=sanitized_sources
        )

        session.add(message)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()

        session.commit()
        session.refresh(message)

        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "content": message.content,
            "role": message.role,
            "timestamp": message.timestamp.isoformat(),
            "sources": message.sources
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save message: {e}")
        raise HTTPException(status_code=500, detail="Failed to save message")