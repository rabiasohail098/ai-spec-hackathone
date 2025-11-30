#!/usr/bin/env python3
"""
Ingestion script for Phase 4 (RAG) of the Hackathon project.
This script reads Markdown files, processes them into chunks, embeds them using OpenAI's embedding model,
and uploads to Qdrant Cloud for RAG functionality.
"""

import os
import glob
import logging
from typing import List, Dict
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

import qdrant_client
from qdrant_client.http.models import (
    PointStruct,
    VectorParams,
    Distance,
)
from openai import OpenAI


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MarkdownIngestor:
    def __init__(self):
        # Initialize Qdrant client using environment variables
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if not qdrant_url or not qdrant_api_key:
            raise ValueError("QDRANT_URL and QDRANT_API_KEY environment variables must be set")

        self.client = qdrant_client.QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key,
            prefer_grpc=True
        )

        # Initialize OpenAI client for embeddings
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable must be set")

        self.openai_client = OpenAI(api_key=openai_api_key)

        # Define constants
        self.DOCS_PATH = "../book-ui/docs/"  # Updated path to match actual book-ui structure
        self.COLLECTION_NAME = "book_knowledge"
        self.CHUNK_SIZE = 500  # As per original requirement

    def read_markdown_files(self) -> List[Dict[str, str]]:
        """Read all Markdown files from the docs directory."""
        markdown_files = glob.glob(os.path.join(self.DOCS_PATH, "*.md"))

        if not markdown_files:
            logger.warning(f"No Markdown files found in {self.DOCS_PATH}")
            return []

        documents = []
        for file_path in markdown_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    documents.append({
                        'id': os.path.basename(file_path),
                        'content': content,
                        'source': file_path
                    })
                logger.info(f"Read {file_path}")
            except Exception as e:
                logger.error(f"Error reading {file_path}: {e}")

        return documents

    def chunk_text(self, text: str, chunk_size: int) -> List[str]:
        """Split text into chunks of specified size."""
        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # Try to break at sentence boundary if possible
            if end < len(text):
                # Find the last sentence ending before the chunk boundary
                chunk = text[start:end]
                last_period = chunk.rfind('.')
                last_exclamation = chunk.rfind('!')
                last_question = chunk.rfind('?')
                last_boundary = max(last_period, last_exclamation, last_question)

                if last_boundary > chunk_size // 2:  # Only break at sentence if it's not too early
                    end = start + last_boundary + 1

            chunks.append(text[start:end])
            start = end

        return chunks

    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for a list of texts using OpenAI's embedding model."""
        import time

        embeddings = []

        # Process texts in batches to comply with OpenAI rate limits
        batch_size = 2000  # Reduced batch size to prevent rate limits
        for batch_start in range(0, len(texts), batch_size):
            batch_end = min(batch_start + batch_size, len(texts))
            batch_texts = texts[batch_start:batch_end]

            try:
                # Create embeddings using OpenAI API
                response = self.openai_client.embeddings.create(
                    input=batch_texts,
                    model="text-embedding-ada-002"  # OpenAI's standard embedding model
                )

                # Extract embeddings from response
                batch_embeddings = [data.embedding for data in response.data]
                embeddings.extend(batch_embeddings)

                logger.info(f"Processed batch {batch_start // batch_size + 1}: {len(batch_embeddings)} embeddings")

            except Exception as e:
                logger.error(f"Error creating embeddings for batch starting at {batch_start}: {e}")
                # Add zero vectors in case of failure to maintain indexing
                for _ in range(len(batch_texts)):
                    embeddings.append([0.0] * 1536)  # OpenAI embeddings are 1536-dimensional

        return embeddings

    def create_collection(self):
        """Create or recreate Qdrant collection with appropriate vector size."""
        # Try to get the existing collection
        try:
            collection_info = self.client.get_collection(self.COLLECTION_NAME)
            # If we get here, collection exists, check its size
            actual_size = collection_info.config.params.vectors.size
            expected_size = 1536  # OpenAI embeddings are 1536-dimensional

            if actual_size != expected_size:
                logger.info(f"Collection exists with wrong size ({actual_size}), recreating with size {expected_size}")
                self.client.delete_collection(self.COLLECTION_NAME)
            else:
                logger.info(f"Collection '{self.COLLECTION_NAME}' already exists with correct size {expected_size}")
                # Clear existing collection to start fresh
                self.client.delete_collection(self.COLLECTION_NAME)
                logger.info(f"Deleted existing collection '{self.COLLECTION_NAME}' to start fresh")
        except:
            # Collection doesn't exist, which is fine - we'll create it
            logger.info(f"Collection '{self.COLLECTION_NAME}' does not exist, creating it")

        # Create new collection with correct vector size
        logger.info(f"Creating collection '{self.COLLECTION_NAME}' with size {1536}")
        self.client.create_collection(
            collection_name=self.COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE)  # OpenAI embeddings are 1536-dim
        )

    def ingest_documents(self):
        """Main ingestion workflow."""
        # Read markdown files
        documents = self.read_markdown_files()
        if not documents:
            logger.warning("No documents to ingest")
            return

        # Prepare chunks and metadata
        all_chunks = []
        all_metadata = []

        for doc in documents:
            chunks = self.chunk_text(doc['content'], self.CHUNK_SIZE)

            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_metadata.append({
                    'source': doc['source'],
                    'doc_id': doc['id'],
                    'chunk_index': i,
                    'original_size': len(doc['content'])
                })

        logger.info(f"Prepared {len(all_chunks)} chunks for embedding")

        # Create embeddings
        embeddings = self.create_embeddings(all_chunks)

        # Create collection if it doesn't exist
        self.create_collection()

        # Prepare points for upload
        points = []
        for i, (chunk, embedding, metadata) in enumerate(zip(all_chunks, embeddings, all_metadata)):
            point = PointStruct(
                id=i,
                vector=embedding,
                payload={
                    "text": chunk,
                    "source": metadata['source'],
                    "doc_id": metadata['doc_id'],
                    "chunk_index": metadata['chunk_index'],
                    "original_size": metadata['original_size']
                }
            )
            points.append(point)

        # Upload to Qdrant
        logger.info(f"Uploading {len(points)} points to Qdrant")

        # Batch upload for better performance
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            self.client.upsert(
                collection_name=self.COLLECTION_NAME,
                points=batch
            )
            logger.info(f"Uploaded batch {i // batch_size + 1}/{(len(points) - 1) // batch_size + 1}")

        logger.info("Ingestion completed successfully")


def main():
    """Main entry point."""
    try:
        ingestor = MarkdownIngestor()
        ingestor.ingest_documents()
    except Exception as e:
        logger.error(f"Error during ingestion: {e}")
        raise


if __name__ == "__main__":
    main()