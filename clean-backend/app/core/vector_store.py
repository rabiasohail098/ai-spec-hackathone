"""
Vector Store Service for Qdrant integration.

This module provides a service layer for interacting with Qdrant vector database.
It handles collection creation, document ingestion, and semantic search operations.
"""

from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """
    Service class for managing Qdrant vector database operations.

    This class provides methods for:
    - Creating and managing collections
    - Adding documents with embeddings
    - Performing semantic search
    - Managing document metadata
    """

    def __init__(self):
        """
        Initialize Qdrant client connection.

        Connects to Qdrant using URL and API key from settings.
        Falls back to local instance if cloud connection fails.
        """
        try:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                timeout=10.0
            )
            self.collection_name = settings.COLLECTION_NAME
            logger.info(f"Connected to Qdrant at {settings.QDRANT_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {e}")
            # Fallback to local instance
            self.client = QdrantClient(url="http://localhost:6333")
            self.collection_name = settings.COLLECTION_NAME
            logger.info("Using local Qdrant instance")

    def create_collection(self, vector_size: int = 1536) -> bool:
        """
        Create a new collection for book content if it doesn't exist.

        Args:
            vector_size: Dimension of embedding vectors (default 1536 for text-embedding-3-small)

        Returns:
            bool: True if collection was created or already exists, False on error

        Raises:
            Exception: If collection creation fails
        """
        try:
            # Check if collection already exists
            collections = self.client.get_collections().collections
            if any(col.name == self.collection_name for col in collections):
                logger.info(f"Collection '{self.collection_name}' already exists")
                return True

            # Create new collection with cosine distance
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Created collection '{self.collection_name}'")
            return True

        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            return False

    def add_documents(
        self,
        documents: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> bool:
        """
        Add documents with their embeddings to the vector store.

        Args:
            documents: List of document dictionaries with metadata
                Expected keys: id, content, chapter, section, source_file
            embeddings: List of embedding vectors corresponding to documents

        Returns:
            bool: True if documents were added successfully, False on error

        Raises:
            ValueError: If documents and embeddings lengths don't match
            Exception: If upload to Qdrant fails
        """
        if len(documents) != len(embeddings):
            raise ValueError(
                f"Mismatch between documents ({len(documents)}) "
                f"and embeddings ({len(embeddings)})"
            )

        try:
            # Prepare points for upload
            points = []
            for doc, embedding in zip(documents, embeddings):
                point = PointStruct(
                    id=doc["id"],
                    vector=embedding,
                    payload={
                        "content": doc["content"],
                        "chapter": doc.get("chapter", ""),
                        "section": doc.get("section", ""),
                        "source_file": doc.get("source_file", ""),
                        "chunk_index": doc.get("chunk_index", 0)
                    }
                )
                points.append(point)

            # Upload points to Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            logger.info(f"Added {len(documents)} documents to vector store")
            return True

        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            return False

    def search(
        self,
        query_embedding: List[float],
        limit: int = 5,
        score_threshold: float = 0.7,
        filter_chapter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic similarity search in the vector store.

        Args:
            query_embedding: Embedding vector of the search query
            limit: Maximum number of results to return (default: 5)
            score_threshold: Minimum similarity score (0-1, default: 0.7)
            filter_chapter: Optional chapter name to filter results

        Returns:
            List of search results with content, metadata, and relevance scores
            Each result contains: content, chapter, section, source_file, score

        Raises:
            Exception: If search fails
        """
        try:
            # Build filter if chapter is specified
            query_filter = None
            if filter_chapter:
                query_filter = Filter(
                    must=[
                        FieldCondition(
                            key="chapter",
                            match=MatchValue(value=filter_chapter)
                        )
                    ]
                )

            # Perform search
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=query_filter
            )

            # Format results
            results = []
            for hit in search_results:
                result = {
                    "content": hit.payload.get("content", ""),
                    "chapter": hit.payload.get("chapter", ""),
                    "section": hit.payload.get("section", ""),
                    "source_file": hit.payload.get("source_file", ""),
                    "score": hit.score
                }
                results.append(result)

            logger.info(f"Found {len(results)} results with score >= {score_threshold}")
            return results

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def delete_collection(self) -> bool:
        """
        Delete the entire collection (use with caution!).

        Returns:
            bool: True if deletion was successful, False otherwise
        """
        try:
            self.client.delete_collection(collection_name=self.collection_name)
            logger.info(f"Deleted collection '{self.collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")
            return False

    def get_collection_info(self) -> Optional[Dict[str, Any]]:
        """
        Get information about the collection (size, vector count, etc.).

        Returns:
            Dictionary with collection information or None if not found
        """
        try:
            info = self.client.get_collection(collection_name=self.collection_name)
            return {
                "name": self.collection_name,
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
                "status": info.status
            }
        except Exception as e:
            logger.error(f"Failed to get collection info: {e}")
            return None


# Singleton instance
_vector_store_instance = None


def get_vector_store() -> VectorStore:
    """
    Get or create singleton instance of VectorStore.

    Returns:
        VectorStore: Shared instance of the vector store service
    """
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = VectorStore()
    return _vector_store_instance
