#!/usr/bin/env python3
"""
Content Ingestion Script for RAG System.

This script reads MDX files from the book-ui/docs/ directory,
chunks the content, generates embeddings, and stores them in Qdrant.

Usage:
    python scripts/ingest_content.py
    python scripts/ingest_content.py --docs-path ../book-ui/docs
"""

import sys
import os
from pathlib import Path
import argparse
import logging

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.vector_store import get_vector_store
from app.utils.chunking import chunk_markdown
from app.utils.embeddings import generate_embeddings_batch, get_embedding_dimension

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def read_mdx_files(docs_path: str) -> list:
    """
    Read all MDX/MD files from the docs directory recursively.

    Args:
        docs_path: Path to the docs directory

    Returns:
        List of dictionaries with file info and content
    """
    docs_dir = Path(docs_path)
    if not docs_dir.exists():
        logger.error(f"Docs directory not found: {docs_path}")
        return []

    files = []
    for file_path in docs_dir.rglob("*.mdx"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            relative_path = file_path.relative_to(docs_dir)
            parts = relative_path.parts
            chapter = parts[0] if len(parts) > 0 else "unknown"
            section = file_path.stem

            files.append({
                "path": str(file_path),
                "relative_path": str(relative_path),
                "chapter": chapter,
                "section": section,
                "content": content
            })
            logger.info(f"Read file: {relative_path}")
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")

    for file_path in docs_dir.rglob("*.md"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            relative_path = file_path.relative_to(docs_dir)
            parts = relative_path.parts
            chapter = parts[0] if len(parts) > 0 else "unknown"
            section = file_path.stem

            files.append({
                "path": str(file_path),
                "relative_path": str(relative_path),
                "chapter": chapter,
                "section": section,
                "content": content
            })
            logger.info(f"Read file: {relative_path}")
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")

    logger.info(f"Total files read: {len(files)}")
    return files


def process_and_store(files: list, vector_store) -> bool:
    """
    Process files: chunk content, generate embeddings, and store in Qdrant.

    Args:
        files: List of file dictionaries from read_mdx_files()
        vector_store: VectorStore instance

    Returns:
        bool: True if successful, False otherwise
    """
    all_chunks = []
    chunk_id = 0

    logger.info("Chunking content...")
    for file_info in files:
        chunks = chunk_markdown(
            content=file_info["content"],
            metadata={
                "chapter": file_info["chapter"],
                "section": file_info["section"],
                "source_file": file_info["relative_path"]
            }
        )

        for chunk in chunks:
            chunk["id"] = chunk_id
            chunk_id += 1
            all_chunks.append(chunk)

    logger.info(f"Created {len(all_chunks)} chunks total")

    if not all_chunks:
        logger.warning("No chunks created")
        return False

    logger.info("Generating embeddings...")
    texts = [chunk["content"] for chunk in all_chunks]

    try:
        embeddings = generate_embeddings_batch(texts, batch_size=100)
        logger.info(f"Generated {len(embeddings)} embeddings")
    except Exception as e:
        logger.error(f"Failed to generate embeddings: {e}")
        return False

    documents = []
    for chunk, embedding in zip(all_chunks, embeddings):
        doc = {
            "id": chunk["id"],
            "content": chunk["content"],
            "chapter": chunk.get("chapter", ""),
            "section": chunk.get("section", ""),
            "source_file": chunk.get("source_file", ""),
            "chunk_index": chunk.get("chunk_index", 0)
        }
        documents.append(doc)

    logger.info("Storing in vector database...")
    # Batch the insertions to avoid timeout
    batch_size = 50
    total_batches = (len(documents) + batch_size - 1) // batch_size

    try:
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i + batch_size]
            batch_embeddings = embeddings[i:i + batch_size]
            batch_num = (i // batch_size) + 1

            logger.info(f"Storing batch {batch_num}/{total_batches} ({len(batch_docs)} documents)...")

            success = vector_store.add_documents(batch_docs, batch_embeddings)
            if not success:
                logger.error(f"Failed to store batch {batch_num}")
                return False

            logger.info(f"Successfully stored batch {batch_num}/{total_batches}")

        logger.info(f"Successfully stored all {len(documents)} documents in {total_batches} batches")
        return True
    except Exception as e:
        logger.error(f"Error storing documents: {e}")
        return False


def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description="Ingest book content into vector database")
    parser.add_argument("--docs-path", default="../book-ui/docs", help="Path to docs directory")
    parser.add_argument("--recreate", action="store_true", help="Delete and recreate collection")
    args = parser.parse_args()

    logger.info("Initializing vector store...")
    vector_store = get_vector_store()

    if args.recreate:
        logger.info("Deleting existing collection...")
        vector_store.delete_collection()

    logger.info("Creating collection...")
    embedding_dim = get_embedding_dimension()
    if not vector_store.create_collection(vector_size=embedding_dim):
        logger.error("Failed to create collection")
        return 1

    logger.info(f"Reading files from: {args.docs_path}")
    files = read_mdx_files(args.docs_path)

    if not files:
        logger.error("No files found")
        return 1

    logger.info("Processing and storing content...")
    success = process_and_store(files, vector_store)

    if success:
        info = vector_store.get_collection_info()
        if info:
            logger.info(f"Collection info: {info}")
        logger.info(" Content ingestion complete!")
        return 0
    else:
        logger.error("L Content ingestion failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
