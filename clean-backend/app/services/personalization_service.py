"""
Personalization Service - Content adaptation based on user learning level

Adapts technical content to match user's expertise:
- Beginner: Simplified terminology, basic examples, everyday analogies
- Intermediate: Balanced technical terms with clear explanations
- Advanced: In-depth technical content, advanced concepts

Uses OpenAI GPT for intelligent content adaptation.
"""

from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings
from app.database.database import get_session
from app.models.user import User
from sqlmodel import Session
import logging
import time

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Learning level definitions
LEARNING_LEVELS = {
    'beginner': {
        'name': 'Beginner',
        'description': 'New to robotics and AI',
        'style': 'Explain in very simple terms, avoiding jargon. Use everyday analogies and examples.',
        'color': '#10b981',
        'icon': '🌱'
    },
    'intermediate': {
        'name': 'Intermediate',
        'description': 'Familiar with basic concepts',
        'style': 'Use technical terms but explain them clearly. Balance depth with clarity.',
        'color': '#3b82f6',
        'icon': '📖'
    },
    'advanced': {
        'name': 'Advanced',
        'description': 'Expert in robotics and AI',
        'style': 'Use technical terminology freely. Provide in-depth explanations with advanced concepts.',
        'color': '#8b5cf6',
        'icon': '🚀'
    }
}


class PersonalizationService:
    """
    Service for personalizing content based on user learning level.

    Handles:
    - Content adaptation to learning level
    - Example generation
    - Terminology simplification/expansion
    - Context preservation
    """

    def __init__(self):
        """Initialize personalization service."""
        self.model = settings.LLM_MODEL
        self.max_chunk_size = 3000  # Characters per chunk

    def personalize_content(
        self,
        content: str,
        user_id: Optional[int] = None,
        learning_level: Optional[str] = None,
        chapter_context: Optional[str] = None,
        content_type: str = 'section'
    ) -> Dict[str, Any]:
        """
        Personalize content based on user's learning level.

        Args:
            content: Content to personalize
            user_id: User ID to fetch learning level from database
            learning_level: Override learning level (beginner, intermediate, advanced)
            chapter_context: Optional chapter name for context
            content_type: Type of content (selected_text, section, full_chapter)

        Returns:
            Dictionary with personalization results:
            {
                'original_content': str,
                'personalized_content': str,
                'learning_level': str,
                'adjustments_made': List[str],
                'processing_time': float
            }

        Raises:
            ValueError: If learning level invalid or content empty
            Exception: If personalization fails
        """
        start_time = time.time()

        # Validate content
        if not content or not content.strip():
            raise ValueError("Content cannot be empty")

        # Determine learning level
        effective_level = self._get_learning_level(user_id, learning_level)

        if effective_level not in LEARNING_LEVELS:
            raise ValueError(
                f"Invalid learning level: {effective_level}. "
                f"Supported: {', '.join(LEARNING_LEVELS.keys())}"
            )

        logger.info(f"Personalizing {len(content)} chars for {effective_level} level")

        try:
            # Check if content needs chunking
            if len(content) > self.max_chunk_size:
                logger.info(f"Content exceeds {self.max_chunk_size} chars, chunking...")
                chunks = self._chunk_content(content)
                personalized_chunks = []

                for i, chunk in enumerate(chunks):
                    logger.info(f"Personalizing chunk {i+1}/{len(chunks)}")
                    personalized_chunk = self._personalize_chunk(
                        chunk,
                        effective_level,
                        chapter_context,
                        content_type
                    )
                    personalized_chunks.append(personalized_chunk)

                personalized_content = '\n\n'.join(personalized_chunks)
            else:
                # Personalize single chunk
                personalized_content = self._personalize_chunk(
                    content,
                    effective_level,
                    chapter_context,
                    content_type
                )

            processing_time = time.time() - start_time
            level_info = LEARNING_LEVELS[effective_level]

            logger.info(f"Personalization completed in {processing_time:.2f}s")

            # Identify adjustments made (simplified for now)
            adjustments = self._identify_adjustments(effective_level, content_type)

            return {
                'original_content': content,
                'personalized_content': personalized_content,
                'learning_level': effective_level,
                'level_name': level_info['name'],
                'level_icon': level_info['icon'],
                'level_color': level_info['color'],
                'adjustments_made': adjustments,
                'processing_time': processing_time
            }

        except Exception as e:
            logger.error(f"Personalization failed: {e}")
            raise Exception(f"Personalization service error: {str(e)}")

    def _get_learning_level(
        self,
        user_id: Optional[int],
        override_level: Optional[str]
    ) -> str:
        """
        Get effective learning level for personalization.

        Priority: override_level > user's stored level > default (intermediate)

        Args:
            user_id: User ID to fetch from database
            override_level: Manual override level

        Returns:
            Learning level string
        """
        # If override provided, use it
        if override_level:
            return override_level.lower()

        # If user_id provided, fetch from database
        if user_id:
            try:
                with next(get_session()) as session:
                    user = session.get(User, user_id)
                    if user and user.learning_level:
                        logger.info(f"Using stored learning level for user {user_id}: {user.learning_level}")
                        return user.learning_level.lower()
            except Exception as e:
                logger.warning(f"Could not fetch user learning level: {e}")

        # Default to intermediate
        return 'intermediate'

    def _personalize_chunk(
        self,
        content: str,
        learning_level: str,
        chapter_context: Optional[str],
        content_type: str
    ) -> str:
        """
        Personalize a single chunk of content.

        Args:
            content: Content chunk to personalize
            learning_level: Target learning level
            chapter_context: Optional chapter context
            content_type: Type of content

        Returns:
            Personalized content
        """
        level_info = LEARNING_LEVELS[learning_level]

        # Build personalization prompt
        system_prompt = f"""You are an expert educator specializing in Physical AI, Robotics, and Computer Science.

Your task: Adapt the following technical content for a {level_info['name'].upper()} level learner.

LEARNING LEVEL: {level_info['name']}
STYLE GUIDELINE: {level_info['style']}

IMPORTANT RULES:
1. Maintain all factual accuracy - do not change technical facts
2. Preserve markdown formatting (headers, lists, code blocks, etc.)
3. Keep the same overall structure and organization
4. Adjust terminology, examples, and depth to match learning level
5. {self._get_level_specific_rules(learning_level)}

{f"CHAPTER CONTEXT: This content is from: {chapter_context}" if chapter_context else ""}
CONTENT TYPE: {content_type}

Provide ONLY the adapted content, no explanations or meta-commentary."""

        user_prompt = f"""Adapt this content for {level_info['name']} level:

{content}"""

        try:
            # Call OpenAI API
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,  # Moderate temperature for creative adaptation
                max_tokens=4000
            )

            personalized_content = response.choices[0].message.content.strip()
            return personalized_content

        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise Exception(f"Personalization API error: {str(e)}")

    def _get_level_specific_rules(self, level: str) -> str:
        """
        Get specific rules for each learning level.

        Args:
            level: Learning level

        Returns:
            Level-specific adaptation rules
        """
        rules = {
            'beginner': (
                "- Replace jargon with simple everyday terms\n"
                "- Add analogies comparing concepts to familiar things\n"
                "- Include step-by-step explanations\n"
                "- Focus on 'what it is' and 'why it matters'\n"
                "- Use concrete examples from daily life"
            ),
            'intermediate': (
                "- Use technical terms but define them clearly\n"
                "- Provide balanced explanations with both theory and practice\n"
                "- Include examples that bridge basic and advanced concepts\n"
                "- Explain 'how it works' with moderate depth\n"
                "- Connect to related concepts learners may know"
            ),
            'advanced': (
                "- Use technical terminology without simplified definitions\n"
                "- Dive deep into implementation details and algorithms\n"
                "- Reference research papers and advanced topics\n"
                "- Explain 'how to optimize' and 'when to use alternatives'\n"
                "- Include mathematical formulations where relevant"
            )
        }
        return rules.get(level, rules['intermediate'])

    def _chunk_content(self, content: str) -> List[str]:
        """
        Split content into chunks for personalization.

        Splits on paragraph boundaries to maintain coherence.

        Args:
            content: Content to chunk

        Returns:
            List of content chunks
        """
        # Split by double newlines (paragraphs)
        paragraphs = content.split('\n\n')
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            # If adding this paragraph exceeds limit, save current chunk
            if len(current_chunk) + len(para) + 2 > self.max_chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
            else:
                current_chunk += para + "\n\n"

        # Add remaining chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks

    def _identify_adjustments(self, level: str, content_type: str) -> List[str]:
        """
        Identify what adjustments were made based on level.

        Args:
            level: Learning level
            content_type: Type of content

        Returns:
            List of adjustment descriptions
        """
        adjustments = []

        if level == 'beginner':
            adjustments = [
                "Simplified technical jargon",
                "Added everyday analogies",
                "Included step-by-step explanations",
                "Focused on practical understanding"
            ]
        elif level == 'intermediate':
            adjustments = [
                "Balanced technical depth with clarity",
                "Explained complex terms clearly",
                "Added practical examples",
                "Maintained moderate technical depth"
            ]
        elif level == 'advanced':
            adjustments = [
                "Increased technical depth",
                "Added advanced concepts and details",
                "Included implementation specifics",
                "Referenced advanced topics"
            ]

        return adjustments

    def get_learning_levels(self) -> Dict[str, Dict[str, Any]]:
        """
        Get available learning levels.

        Returns:
            Dictionary of learning levels and their properties
        """
        return LEARNING_LEVELS


# Singleton instance
_personalization_service_instance = None


def get_personalization_service() -> PersonalizationService:
    """
    Get or create singleton instance of PersonalizationService.

    Returns:
        PersonalizationService: Shared instance
    """
    global _personalization_service_instance
    if _personalization_service_instance is None:
        _personalization_service_instance = PersonalizationService()
    return _personalization_service_instance
