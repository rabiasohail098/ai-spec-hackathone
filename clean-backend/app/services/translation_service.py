"""
Translation Service - Real-time translation using OpenAI API

Provides multi-language translation with support for:
- Urdu (ur) with RTL layout
- Arabic (ar) with RTL layout
- Spanish (es)
- French (fr)

Uses OpenAI GPT for context-aware technical translation.
"""

from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings
import logging
import time

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Supported languages
SUPPORTED_LANGUAGES = {
    'ur': {'name': 'Urdu', 'rtl': True, 'code': 'ur'},
    'ar': {'name': 'Arabic', 'rtl': True, 'code': 'ar'},
    'es': {'name': 'Spanish', 'rtl': False, 'code': 'es'},
    'fr': {'name': 'French', 'rtl': False, 'code': 'fr'}
}


class TranslationService:
    """
    Service for translating technical content using OpenAI API.

    Handles:
    - Multi-language translation
    - Technical terminology preservation
    - Markdown formatting preservation
    - Chunking for long content
    """

    def __init__(self):
        """Initialize translation service."""
        self.model = settings.LLM_MODEL  # Use same model as chat
        self.max_chunk_size = 2000  # Characters per chunk

    def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: str = 'en',
        context: Optional[str] = None,
        preserve_formatting: bool = True
    ) -> Dict[str, Any]:
        """
        Translate text to target language.

        Args:
            text: Text to translate
            target_language: Target language code (ur, ar, es, fr)
            source_language: Source language code (default: en)
            context: Optional context (e.g., chapter name) for better translation
            preserve_formatting: Whether to preserve markdown formatting

        Returns:
            Dictionary with translation results:
            {
                'original_text': str,
                'translated_text': str,
                'source_language': str,
                'target_language': str,
                'character_count': int,
                'processing_time': float,
                'is_rtl': bool
            }

        Raises:
            ValueError: If target language not supported
            Exception: If translation fails
        """
        start_time = time.time()

        # Validate language
        if target_language not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language: {target_language}. "
                f"Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}"
            )

        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        logger.info(f"Translating {len(text)} chars from {source_language} to {target_language}")

        try:
            # Check if text needs chunking
            if len(text) > self.max_chunk_size:
                logger.info(f"Text exceeds {self.max_chunk_size} chars, chunking...")
                chunks = self._chunk_text(text)
                translated_chunks = []

                for i, chunk in enumerate(chunks):
                    logger.info(f"Translating chunk {i+1}/{len(chunks)}")
                    translated_chunk = self._translate_chunk(
                        chunk,
                        target_language,
                        source_language,
                        context,
                        preserve_formatting
                    )
                    translated_chunks.append(translated_chunk)

                translated_text = '\n\n'.join(translated_chunks)
            else:
                # Translate single chunk
                translated_text = self._translate_chunk(
                    text,
                    target_language,
                    source_language,
                    context,
                    preserve_formatting
                )

            processing_time = time.time() - start_time
            language_info = SUPPORTED_LANGUAGES[target_language]

            logger.info(f"Translation completed in {processing_time:.2f}s")

            return {
                'original_text': text,
                'translated_text': translated_text,
                'source_language': source_language,
                'target_language': target_language,
                'target_language_name': language_info['name'],
                'character_count': len(text),
                'processing_time': processing_time,
                'is_rtl': language_info['rtl']
            }

        except Exception as e:
            logger.error(f"Translation failed: {e}")
            raise Exception(f"Translation service error: {str(e)}")

    def _translate_chunk(
        self,
        text: str,
        target_language: str,
        source_language: str,
        context: Optional[str],
        preserve_formatting: bool
    ) -> str:
        """
        Translate a single chunk of text using OpenAI API.

        Args:
            text: Text chunk to translate
            target_language: Target language code
            source_language: Source language code
            context: Optional context
            preserve_formatting: Whether to preserve formatting

        Returns:
            Translated text
        """
        language_name = SUPPORTED_LANGUAGES[target_language]['name']

        # Build translation prompt
        system_prompt = f"""You are an expert translator specializing in technical content about Physical AI, Robotics, and Computer Science.

Your task: Translate the following text from {source_language.upper()} to {language_name}.

IMPORTANT RULES:
1. Maintain technical accuracy - preserve technical terms where appropriate
2. Keep the same tone and style
3. {"Preserve markdown formatting (headers, lists, code blocks, etc.)" if preserve_formatting else "Plain text output only"}
4. Make the translation natural and fluent in {language_name}
5. For technical terms without common {language_name} equivalents, use the English term followed by {language_name} explanation in parentheses
6. Maintain paragraph structure and line breaks

{f"CONTEXT: This content is from a chapter about: {context}" if context else ""}

Provide ONLY the translation, no explanations or notes."""

        user_prompt = f"""Translate this text to {language_name}:

{text}"""

        try:
            # Call OpenAI API
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent translation
                max_tokens=3000
            )

            translated_text = response.choices[0].message.content.strip()
            return translated_text

        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise Exception(f"Translation API error: {str(e)}")

    def _chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks for translation.

        Splits on paragraph boundaries to maintain coherence.

        Args:
            text: Text to chunk

        Returns:
            List of text chunks
        """
        # Split by double newlines (paragraphs)
        paragraphs = text.split('\n\n')
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

    def get_supported_languages(self) -> Dict[str, Dict[str, Any]]:
        """
        Get list of supported languages.

        Returns:
            Dictionary of language codes and their properties
        """
        return SUPPORTED_LANGUAGES


# Singleton instance
_translation_service_instance = None


def get_translation_service() -> TranslationService:
    """
    Get or create singleton instance of TranslationService.

    Returns:
        TranslationService: Shared instance
    """
    global _translation_service_instance
    if _translation_service_instance is None:
        _translation_service_instance = TranslationService()
    return _translation_service_instance
