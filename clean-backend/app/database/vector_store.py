from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Dict, Any, Optional
from app.core.config import settings
import hashlib
import logging
import uuid
import os
from pathlib import Path

import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class QdrantVectorStore:
    def __init__(self):
        # Initialize Qdrant client - using cloud mode
        # Use cloud Qdrant to avoid local storage locking issues
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )
        logger.info(f"Using cloud Qdrant at {settings.QDRANT_URL}")
        
        # Initialize Gemini client for embeddings
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Collection name
        self.collection_name = settings.COLLECTION_NAME
        
        # Create the collection if it doesn't exist
        self._initialize_collection()
    
    def _initialize_collection(self):
        """Initialize the Qdrant collection with appropriate vectors config"""
        try:
            # Check if collection exists
            self.client.get_collection(collection_name=self.collection_name)
            logger.info(f"Collection '{self.collection_name}' already exists")
        except Exception as e:
            # Create collection if it doesn't exist
            try:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=768,  # Size for Gemini embeddings
                        distance=models.Distance.COSINE
                    ),
                )
                logger.info(f"Created collection '{self.collection_name}'")
            except Exception as create_error:
                logger.error(f"Error creating collection: {create_error}")
                # Handle potential issue with cloud instance requiring different setup
                if "forbidden" in str(create_error).lower() or "403" in str(create_error):
                    logger.error("Access to Qdrant is forbidden. Please verify your QDRANT_API_KEY and URL.")
                    logger.error("Make sure Docker is running Qdrant on the specified URL or use local storage mode.")
                
    
    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using Google's Generative AI"""
        try:
            # Truncate text if it's too long (Gemini has limits)
            if len(text) > 20000:  # Adjust based on Gemini's limit
                text = text[:20000]

            result = genai.embed_content(
                model="models/embedding-001",
                content=text
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            # Return a zero vector as fallback (though this is not ideal)
            # In production, you'd want to handle this more gracefully
            try:
                # Try with a different model
                result = genai.embed_content(
                    model="text-embedding-004",  # Alternative model
                    content=text[:10000]  # Shorter text
                )
                return result['embedding']
            except:
                logger.error("Also failed to generate embedding with alternative model")
                # As a last resort, return a placeholder
                return [0.0] * 768  # Common embedding size
    
    def add_document(self, content: str, metadata: Dict[str, Any], doc_id: Optional[str] = None) -> str:
        """Add a document to the Qdrant collection"""
        if not doc_id:
            doc_id = str(uuid.uuid4())
        
        # Generate embedding for the content
        embedding = self._generate_embedding(content)
        
        if not embedding:
            raise Exception("Failed to generate embedding for document")
        
        # Prepare the payload
        payload = {
            "content": content,
            "metadata": metadata
        }
        payload.update(metadata)  # Also add metadata at the top level for easy querying
        
        # Upsert the record
        try:
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=doc_id,
                        vector=embedding,
                        payload=payload
                    )
                ]
            )
        except Exception as e:
            logger.error(f"Error upserting document: {e}")
            # Log for debugging
            logger.debug(f"Document ID: {doc_id}, Content Length: {len(content)}")
        
        return doc_id
    
    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: Optional[List[str]] = None) -> List[str]:
        """Add multiple documents to the Qdrant collection"""
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]
        
        # Generate embeddings for all texts
        embeddings = []
        for text in texts:
            embedding = self._generate_embedding(text)
            if not embedding:
                logger.warning(f"Failed to generate embedding for text: {text[:100]}...")
                continue
            embeddings.append(embedding)
        
        # Prepare payloads
        payloads = []
        for text, metadata in zip(texts, metadatas):
            payload = {
                "content": text,
                "metadata": metadata
            }
            payload.update(metadata)
            payloads.append(payload)
        
        # Filter to match only the embeddings that were successfully created
        filtered_ids = ids[:len(embeddings)]
        filtered_payloads = payloads[:len(embeddings)]
        
        # Upsert the records
        try:
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=id_,
                        vector=embedding,
                        payload=payload
                    )
                    for id_, embedding, payload in zip(filtered_ids, embeddings, filtered_payloads)
                ]
            )
        except Exception as e:
            logger.error(f"Error upserting multiple documents: {e}")
        
        return filtered_ids
    
    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents in the collection"""
        query_embedding = self._generate_embedding(query)
        
        if not query_embedding:
            logger.error("Failed to generate embedding for search query")
            return []
        
        # Search for similar vectors
        try:
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit
            )
            
            # Format results
            results = []
            for hit in search_results:
                result = {
                    "id": hit.id,
                    "content": hit.payload.get("content", ""),
                    "metadata": hit.payload.get("metadata", {}),
                    "score": hit.score
                }
                results.append(result)
            
            return results
        except Exception as e:
            logger.error(f"Error performing search: {e}")
            return []
    
    def get_all_documents(self) -> List[Dict[str, Any]]:
        """Retrieve all documents from the collection"""
        try:
            # Retrieve all points from the collection
            points, _ = self.client.scroll(
                collection_name=self.collection_name,
                limit=10000  # Adjust as needed
            )
            
            documents = []
            for point in points:
                doc = {
                    "id": point.id,
                    "content": point.payload.get("content", ""),
                    "metadata": point.payload.get("metadata", {})
                }
                documents.append(doc)
            
            return documents
        except Exception as e:
            logger.error(f"Error retrieving all documents: {str(e)}")
            return []
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a specific document from the collection"""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    points=[doc_id]
                )
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return False
    
    def clear_collection(self):
        """Clear all documents from the collection"""
        try:
            # Get all point IDs
            points, _ = self.client.scroll(
                collection_name=self.collection_name,
                limit=10000
            )
            
            # Extract IDs
            ids = [point.id for point in points]
            
            # Delete all points
            if ids:
                self.client.delete(
                    collection_name=self.collection_name,
                    points_selector=models.PointIdsList(points=ids)
                )
            
            logger.info(f"Cleared collection '{self.collection_name}', deleted {len(ids)} documents")
            return True
        except Exception as e:
            logger.error(f"Error clearing collection: {str(e)}")
            return False

# Global instance
vector_store = QdrantVectorStore()