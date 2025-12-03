"""
Content chunking utilities for RAG system.

This module provides functions to chunk markdown/MDX content into optimal sizes
for embedding and retrieval. Uses tiktoken for accurate token counting.
"""

import re
from typing import List, Dict, Any
import tiktoken
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """
    Count the number of tokens in a text string.

    Args:
        text: Input text to count tokens for
        model: Model name for tokenizer (default: gpt-3.5-turbo)

    Returns:
        int: Number of tokens in the text
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))
    except Exception as e:
        logger.error(f"Error counting tokens: {e}")
        # Fallback: rough estimate (1 token H 4 characters)
        return len(text) // 4


def chunk_markdown(
    content: str,
    chunk_size: int = None,
    chunk_overlap: int = None,
    metadata: Dict[str, Any] = None
) -> List[Dict[str, Any]]:
    """
    Chunk markdown content into smaller pieces for embedding.

    Strategy:
    1. Split by headers (##, ###) to respect document structure
    2. If sections are too large, split by paragraphs
    3. If still too large, split by sentences
    4. Add overlap between chunks for context continuity

    Args:
        content: Markdown/MDX content to chunk
        chunk_size: Target size in tokens (default from settings)
        chunk_overlap: Overlap between chunks in tokens (default from settings)
        metadata: Optional metadata to attach to each chunk (chapter, section, etc.)

    Returns:
        List of chunk dictionaries with content and metadata
    """
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE
    if chunk_overlap is None:
        chunk_overlap = settings.CHUNK_OVERLAP
    if metadata is None:
        metadata = {}

    chunks = []

    # Clean content - remove frontmatter if present
    content = remove_frontmatter(content)

    # Strategy 1: Split by headers
    sections = split_by_headers(content)

    for section_idx, section in enumerate(sections):
        section_text = section["content"]
        section_heading = section["heading"]

        # Check if section fits in chunk_size
        section_tokens = count_tokens(section_text)

        if section_tokens <= chunk_size:
            # Section fits, add as single chunk
            chunks.append({
                "content": section_text,
                "heading": section_heading,
                "tokens": section_tokens,
                **metadata
            })
        else:
            # Section too large, split by paragraphs
            paragraphs = split_by_paragraphs(section_text)
            current_chunk = ""
            current_tokens = 0

            for para in paragraphs:
                para_tokens = count_tokens(para)

                if current_tokens + para_tokens <= chunk_size:
                    # Add paragraph to current chunk
                    current_chunk += para + "\n\n"
                    current_tokens += para_tokens
                else:
                    # Save current chunk and start new one
                    if current_chunk:
                        chunks.append({
                            "content": current_chunk.strip(),
                            "heading": section_heading,
                            "tokens": current_tokens,
                            **metadata
                        })

                    # Start new chunk with overlap
                    if chunks and chunk_overlap > 0:
                        # Add last part of previous chunk for context
                        prev_content = chunks[-1]["content"]
                        overlap_text = get_last_n_tokens(prev_content, chunk_overlap)
                        current_chunk = overlap_text + "\n\n" + para + "\n\n"
                        current_tokens = count_tokens(current_chunk)
                    else:
                        current_chunk = para + "\n\n"
                        current_tokens = para_tokens

            # Add final chunk if exists
            if current_chunk:
                chunks.append({
                    "content": current_chunk.strip(),
                    "heading": section_heading,
                    "tokens": current_tokens,
                    **metadata
                })

    # Add chunk indices
    for idx, chunk in enumerate(chunks):
        chunk["chunk_index"] = idx

    logger.info(f"Created {len(chunks)} chunks from content")
    return chunks


def remove_frontmatter(content: str) -> str:
    """
    Remove YAML frontmatter from markdown content.

    Args:
        content: Markdown content potentially with frontmatter

    Returns:
        Content without frontmatter
    """
    # Remove frontmatter between --- markers
    pattern = r'^---\s*\n.*?\n---\s*\n'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content.strip()


def split_by_headers(content: str) -> List[Dict[str, str]]:
    """
    Split markdown content by headers (##, ###, ####).

    Args:
        content: Markdown content

    Returns:
        List of sections with heading and content
    """
    # Split by headers while keeping the header text
    pattern = r'(^#{2,4}\s+.+$)'
    parts = re.split(pattern, content, flags=re.MULTILINE)

    sections = []
    current_heading = ""

    for i, part in enumerate(parts):
        if not part.strip():
            continue

        if re.match(r'^#{2,4}\s+', part):
            # This is a heading
            current_heading = part.strip()
        else:
            # This is content
            sections.append({
                "heading": current_heading,
                "content": part.strip()
            })

    return sections if sections else [{"heading": "", "content": content}]


def split_by_paragraphs(content: str) -> List[str]:
    """
    Split content by paragraphs (double newlines).

    Args:
        content: Text content

    Returns:
        List of paragraphs
    """
    paragraphs = re.split(r'\n\s*\n', content)
    return [p.strip() for p in paragraphs if p.strip()]


def get_last_n_tokens(text: str, n: int) -> str:
    """
    Get the last N tokens from text for chunk overlap.

    Args:
        text: Input text
        n: Number of tokens to extract

    Returns:
        Last N tokens as string
    """
    try:
        encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
        tokens = encoding.encode(text)

        if len(tokens) <= n:
            return text

        last_tokens = tokens[-n:]
        return encoding.decode(last_tokens)
    except Exception as e:
        logger.error(f"Error getting last tokens: {e}")
        # Fallback: return last ~n*4 characters
        return text[-(n * 4):]
