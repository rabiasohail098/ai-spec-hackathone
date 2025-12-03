"""
Embedding generation utilities using OpenAI API.

This module provides functions to generate embeddings for text content
using OpenAI's embedding models.
"""

from typing import List
from openai import OpenAI
from app.core.config import settings
import logging
import time

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_embedding(text: str, model: str = None) -> List[float]:
    """
    Generate embedding vector for a single text using OpenAI API.

    Args:
        text: Input text to generate embedding for
        model: Embedding model name (default from settings)

    Returns:
        List of floats representing the embedding vector

    Raises:
        Exception: If embedding generation fails
    """
    if model is None:
        model = settings.EMBEDDING_MODEL

    try:
        # Replace newlines for better embedding quality
        text = text.replace("\n", " ").strip()

        if not text:
            logger.warning("Empty text provided for embedding")
            return []

        # Call OpenAI API
        response = client.embeddings.create(
            input=text,
            model=model
        )

        embedding = response.data[0].embedding
        logger.debug(f"Generated embedding of size {len(embedding)}")
        return embedding

    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


def generate_embeddings_batch(
    texts: List[str],
    model: str = None,
    batch_size: int = 100
) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batches.

    OpenAI allows up to 2048 inputs per request, but we use smaller batches
    for better reliability and rate limiting.

    Args:
        texts: List of texts to generate embeddings for
        model: Embedding model name (default from settings)
        batch_size: Number of texts per API call (default: 100)

    Returns:
        List of embedding vectors corresponding to input texts

    Raises:
        Exception: If embedding generation fails
    """
    if model is None:
        model = settings.EMBEDDING_MODEL

    all_embeddings = []

    # Process in batches
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        try:
            # Clean texts
            cleaned_batch = [text.replace("\n", " ").strip() for text in batch]

            # Call OpenAI API
            response = client.embeddings.create(
                input=cleaned_batch,
                model=model
            )

            # Extract embeddings in order
            batch_embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(batch_embeddings)

            logger.info(f"Generated embeddings for batch {i // batch_size + 1} "
                       f"({len(batch)} texts)")

            # Rate limiting - small delay between batches
            if i + batch_size < len(texts):
                time.sleep(0.5)

        except Exception as e:
            logger.error(f"Failed to generate embeddings for batch {i // batch_size + 1}: {e}")
            raise

    return all_embeddings


def get_embedding_dimension(model: str = None) -> int:
    """
    Get the dimension of embeddings for a given model.

    Args:
        model: Embedding model name (default from settings)

    Returns:
        int: Dimension of embedding vectors

    Known dimensions:
    - text-embedding-3-small: 1536
    - text-embedding-3-large: 3072
    - text-embedding-ada-002: 1536
    """
    if model is None:
        model = settings.EMBEDDING_MODEL

    # Known dimensions for OpenAI models
    dimensions = {
        "text-embedding-3-small": 1536,
        "text-embedding-3-large": 3072,
        "text-embedding-ada-002": 1536
    }

    return dimensions.get(model, 1536)  # Default to 1536
