#!/usr/bin/env python3
"""
Script to import book content into Qdrant vector store
"""

import glob
import logging
import os
import re
import sys
from pathlib import Path

# Add the parent directory to path to import the vector store
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.database.vector_store import vector_store

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_text_from_md_content(content: str) -> str:
    """
    Extract text content from markdown file content, removing frontmatter and headers
    """
    # Remove frontmatter (content between --- delimiters at the start)
    content = re.sub(r"^---\n.*?\n---", "", content, flags=re.DOTALL)

    # Remove markdown headers
    content = re.sub(r"^#{1,6}\s+(.*)", "", content, flags=re.MULTILINE)

    # Remove markdown links [text](url) but keep the text
    content = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", content)

    # Remove markdown bold/italic formatting
    content = re.sub(r"\*{1,2}([^*]+)\*{1,2}", r"\1", content)
    content = re.sub(r"_{1,2}([^_]+)_{1,2}", r"\1", content)

    # Remove code blocks
    content = re.sub(r"```[\s\S]*?```", "", content)

    # Remove inline code
    content = re.sub(r"`([^`]+)`", r"\1", content)

    # Clean up extra whitespace
    content = re.sub(r"\n\s*\n", "\n\n", content)
    content = content.strip()

    return content


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    """
    Split text into overlapping chunks
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        # If we're near the end, just take the remaining text
        if end > text_length:
            end = text_length

        # Get the chunk
        chunk = text[start:end]

        # If this isn't the first chunk, include some overlap from the previous chunk
        if start > 0 and overlap > 0:
            overlap_start = max(0, start - overlap)
            chunk = text[overlap_start:start] + chunk
            chunk = chunk[-chunk_size:]  # Ensure not exceeding size

        chunks.append(chunk.strip())
        start = end

        if end - start < chunk_size:
            break

    return [chunk for chunk in chunks if len(chunk.strip()) > 10]


def import_md_file(filepath: str, docs_dir: str):
    """
    Import a single markdown file into Qdrant
    """
    logger.info(f"Processing file: {filepath}")

    # Read the file
    with open(filepath, "r", encoding="utf-8") as file:
        content = file.read()

    # Extract clean text
    clean_text = extract_text_from_md_content(content)

    # Extract filename without extension for metadata
    filename = Path(filepath).stem

    # ✅ Corrected relative path (no settings.DATABASE_URL usage)
    try:
        relative_path = os.path.relpath(filepath, start=Path(docs_dir))
    except Exception:
        relative_path = os.path.basename(filepath)

    # Create metadata
    metadata = {
        "source_file": os.path.basename(filepath),
        "relative_path": relative_path,
        "title": filename.replace("-", " ").title(),
        "type": "book_content",
    }

    # Chunk the text
    chunks = chunk_text(clean_text, chunk_size=1000, overlap=100)

    logger.info(f"Split {filepath} into {len(chunks)} chunks")

    # Add each chunk to the vector store
    for i, chunk in enumerate(chunks):
        chunk_metadata = metadata.copy()
        chunk_metadata["chunk_index"] = i
        chunk_metadata["total_chunks"] = len(chunks)

        try:
            doc_id = vector_store.add_document(content=chunk, metadata=chunk_metadata)
            logger.info(
                f"Added chunk {i + 1}/{len(chunks)} from {filename} with ID: {doc_id}"
            )
        except Exception as e:
            logger.error(f"Error adding chunk {i + 1} from {filepath}: {str(e)}")


def import_all_docs(docs_dir: str):
    """
    Import all markdown files from the docs directory
    """
    logger.info(f"Starting to import documentation from: {docs_dir}")

    # Find all .md and .mdx files recursively
    md_files = []
    for ext in ["*.md", "*.mdx"]:
        md_files.extend(glob.glob(os.path.join(docs_dir, "**", ext), recursive=True))

    logger.info(f"Found {len(md_files)} markdown files to process")

    # Process each file
    for filepath in md_files:
        try:
            import_md_file(filepath, docs_dir)
        except Exception as e:
            logger.error(f"Error processing file {filepath}: {str(e)}")

    logger.info("Completed importing all documentation")


def main():
    """
    Main function to run the import script
    """
    logger.info("Starting book content import to Qdrant")

    # Assuming script runs from clean-backend directory
    docs_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "..",
        "book-ui",
        "docs",
    )

    # Check if the docs directory exists
    if not os.path.exists(docs_dir):
        logger.error(f"Docs directory not found at: {docs_dir}")
        # Try absolute path fallback
        docs_dir_abs = "D:\\Desktop\\ai-spec-hackathone\\book-ui\\docs"
        if os.path.exists(docs_dir_abs):
            docs_dir = docs_dir_abs
            logger.info(f"Using absolute path: {docs_dir}")
        else:
            logger.error(f"Docs directory also not found at: {docs_dir_abs}")
            return

    logger.info(f"Importing content from: {docs_dir}")

    # Optionally clear collection before import
    # vector_store.clear_collection()

    # Import all documentation
    import_all_docs(docs_dir)

    logger.info("Book content import completed!")


if __name__ == "__main__":
    main()
