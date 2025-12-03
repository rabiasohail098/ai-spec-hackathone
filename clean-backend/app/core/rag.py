"""
RAG (Retrieval-Augmented Generation) Core Logic.

This module implements the core RAG functionality:
1. Retrieve relevant context from vector store
2. Build prompts with retrieved context
3. Generate responses using OpenAI Chat API
4. Handle source citations and relevance filtering
"""

from typing import List, Dict, Any, Optional
from openai import OpenAI
from app.core.vector_store import get_vector_store
from app.utils.embeddings import generate_embedding
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class RAGService:
    """
    Service class for RAG (Retrieval-Augmented Generation) operations.

    This class coordinates the RAG pipeline:
    - Query embedding generation
    - Semantic search in vector store
    - Context building from retrieved documents
    - Response generation with LLM
    - Source citation
    """

    def __init__(self):
        """Initialize RAG service with vector store."""
        self.vector_store = get_vector_store()
        self.relevance_threshold = 0.7  # Minimum score for book content

    def retrieve_context(
        self,
        query: str,
        top_k: int = 5,
        filter_chapter: Optional[str] = None
    ) -> tuple[List[Dict[str, Any]], bool]:
        """
        Retrieve relevant context from vector store for a query.

        Args:
            query: User's question or query text
            top_k: Number of top results to retrieve (default: 5)
            filter_chapter: Optional chapter name to filter results

        Returns:
            Tuple of (retrieved documents, is_from_book)
            - retrieved documents: List of relevant chunks with metadata
            - is_from_book: True if results meet relevance threshold

        T043: Implements semantic search with relevance filtering
        """
        try:
            # Generate embedding for query
            logger.info(f"Generating embedding for query: {query[:100]}...")
            query_embedding = generate_embedding(query)

            # Search vector store
            logger.info(f"Searching vector store (top_k={top_k})...")
            results = self.vector_store.search(
                query_embedding=query_embedding,
                limit=top_k,
                score_threshold=self.relevance_threshold,
                filter_chapter=filter_chapter
            )

            # Check if we have relevant results
            is_from_book = len(results) > 0 and results[0]["score"] >= self.relevance_threshold

            logger.info(f"Retrieved {len(results)} relevant chunks, "
                       f"from_book={is_from_book}")

            return results, is_from_book

        except Exception as e:
            logger.error(f"Failed to retrieve context: {e}")
            return [], False

    def build_prompt(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        selected_text: Optional[str] = None,
        intent: Optional[str] = None,
        user_level: str = "intermediate"
    ) -> str:
        """
        Build a prompt with retrieved context for the LLM.

        Args:
            query: User's question
            context_chunks: Retrieved relevant chunks from vector store
            selected_text: Optional text selected by user
            intent: Optional intent (summarize, explain, etc.)
            user_level: User's learning level (beginner, intermediate, advanced)

        Returns:
            Formatted prompt string with context

        T044, T146-T148: Implements prompt engineering with context injection and personalization
        """
        # T146: Personalization instructions based on user level
        level_instructions = {
            "beginner": "Explain in very simple terms, avoiding jargon. Use everyday analogies and examples.",
            "intermediate": "Use technical terms but explain them clearly. Balance depth with clarity.",
            "advanced": "Use technical terminology freely. Provide in-depth explanations with advanced concepts."
        }

        personalization_hint = level_instructions.get(user_level, level_instructions["intermediate"])
        # Build context section from retrieved chunks
        context_text = ""
        if context_chunks:
            context_text = "**Relevant content from the book:**\n\n"
            for i, chunk in enumerate(context_chunks, 1):
                context_text += f"[Source {i} - {chunk['chapter']}/{chunk['section']}]\n"
                context_text += f"{chunk['content']}\n\n"

        # Build prompt based on intent
        if intent == "summarize":
            if selected_text:
                prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}
Instruction: {personalization_hint}

User selected this text:
\"\"\"{selected_text}\"\"\"

{context_text if context_text else ''}

Please provide a concise summary of the selected text in 2-3 sentences, focusing on the key concepts."""

            else:
                prompt = f"""{context_text if context_text else ''}

User Learning Level: {user_level.capitalize()}
Instruction: {personalization_hint}

Question: {query}

Please provide a concise summary in 2-3 sentences."""

        elif intent == "explain":
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}
Instruction: {personalization_hint}

{context_text if context_text else ''}

{'User selected: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please explain this concept accordingly."""

        elif intent == "keypoints":
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}
Instruction: {personalization_hint}

{context_text if context_text else ''}

{'Content: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please extract and list the key points in bullet format."""

        elif intent == "mindmap":
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}

{context_text if context_text else ''}

{'Topic: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please create a text-based mind map showing the main concept and its sub-concepts in a hierarchical structure."""

        elif intent == "simplify":
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}

{context_text if context_text else ''}

{'Complex text: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please simplify this text to make it easier to understand. Use everyday language, avoid jargon, and provide simple analogies."""

        elif intent == "brief":
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}

{context_text if context_text else ''}

{'Content: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please provide a VERY BRIEF answer (1-2 sentences maximum). Be concise and to the point."""

        elif intent == "elaborate":
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Robotics.

User Learning Level: {user_level.capitalize()}
Instruction: {personalization_hint}

{context_text if context_text else ''}

{'Topic: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please elaborate on this topic with more details, examples, and deeper explanations. Provide comprehensive information."""

        else:
            # Default general question
            prompt = f"""You are an AI assistant helping students learn about Physical AI and Humanoid Robotics.

User Learning Level: {user_level.capitalize()}
Instruction: {personalization_hint}

{context_text if context_text else ''}

{'User context: "' + selected_text + '"' if selected_text else ''}

Question: {query}

Please provide a helpful, accurate answer. If the answer is in the provided book content, cite the source."""

        return prompt

    def generate_response(
        self,
        query: str,
        selected_text: Optional[str] = None,
        intent: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        user_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """
        Generate AI response using RAG pipeline.

        Complete RAG pipeline:
        1. Retrieve relevant context (T043)
        2. Build prompt with context (T044)
        3. Generate response with LLM (T045)
        4. Add source citations (T046)
        5. Apply relevance filtering (T047)
        6. Personalize based on user level (T146-T148)

        Args:
            query: User's question
            selected_text: Optional selected text for context
            intent: Optional intent (summarize, explain, etc.)
            conversation_history: Optional previous messages
            user_level: User's learning level for personalization

        Returns:
            Dictionary with:
            - answer: Generated response text
            - sources: List of source citations
            - from_book: Boolean indicating if answer uses book content
            - relevance_score: Average relevance score of retrieved chunks
        """
        try:
            # Step 1: Retrieve context (T043)
            context_chunks, is_from_book = self.retrieve_context(
                query=query,
                top_k=5
            )

            # Step 2: Build prompt (T044, T146-T148)
            prompt = self.build_prompt(
                query=query,
                context_chunks=context_chunks,
                selected_text=selected_text,
                intent=intent,
                user_level=user_level
            )

            # Step 3: Prepare messages for LLM (T045)
            messages = []

            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history[-6:])  # Last 3 exchanges

            # Add current query
            messages.append({"role": "user", "content": prompt})

            # Step 4: Generate response (T045)
            logger.info("Generating response with LLM...")
            response = client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=800
            )

            answer = response.choices[0].message.content

            # Step 5: Extract source citations (T046)
            sources = []
            if context_chunks:
                for chunk in context_chunks:
                    source = f"{chunk['chapter']}/{chunk['section']}"
                    if source not in sources:
                        sources.append(source)

            # Step 6: Calculate average relevance score (T047)
            relevance_score = 0.0
            if context_chunks:
                relevance_score = sum(c["score"] for c in context_chunks) / len(context_chunks)

            # Indicate if response is from book content or general knowledge
            if not is_from_book:
                answer += "\n\n*Note: This answer is based on general knowledge as no highly relevant content was found in the book.*"

            logger.info(f"Generated response (from_book={is_from_book}, "
                       f"relevance={relevance_score:.2f})")

            return {
                "answer": answer,
                "sources": sources,
                "from_book": is_from_book,
                "relevance_score": relevance_score
            }

        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return {
                "answer": "I apologize, but I encountered an error processing your question. Please try again.",
                "sources": [],
                "from_book": False,
                "relevance_score": 0.0
            }


# Singleton instance
_rag_service_instance = None


def get_rag_service() -> RAGService:
    """
    Get or create singleton instance of RAGService.

    Returns:
        RAGService: Shared instance of the RAG service
    """
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = RAGService()
    return _rag_service_instance
