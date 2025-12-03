"""
Search Robotics Knowledge Agent

Implements the search_robotics_knowledge subagent that searches for information
about robotics concepts, theories, and best practices in the knowledge base.
"""

from typing import Dict, Any, Optional, List
from app.agents.base import BaseAgent, AgentResponse
from app.core.rag import get_rag_service


class SearchRoboticsKnowledgeAgent(BaseAgent):
    """
    Agent for searching robotics knowledge in the RAG system.
    
    Uses the existing RAG service to search for relevant robotics concepts
    in the book content and knowledge base.
    """
    
    def __init__(self):
        super().__init__(
            name="search_robotics_knowledge",
            description="Search for information about robotics concepts, theories, and best practices in the knowledge base"
        )
        self.rag_service = get_rag_service()
    
    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> AgentResponse:
        """
        Execute the search operation
        
        Args:
            query: The robotics concept or topic to search for
            context: Additional context (optional)
            
        Returns:
            AgentResponse: Search results with sources
        """
        try:
            # Validate input
            if not await self.validate_input(query):
                return self.format_response(
                    success=False,
                    error="Invalid query: query must be at least 3 characters"
                )
            
            # Perform semantic search using the RAG service
            # We'll use the RAG service to search for relevant content
            result = self.rag_service.generate_response(
                query=query,
                selected_text=None,  # No selected text for general search
                intent="search"  # Custom intent for search
            )
            
            # Extract sources from the result
            sources = result.get("sources", [])
            
            # Return the search results
            return self.format_response(
                success=True,
                result=result["answer"],
                sources=sources if sources else None
            )
            
        except Exception as e:
            return self.format_response(
                success=False,
                error=f"Error performing search: {str(e)}"
            )


# For testing purposes
if __name__ == "__main__":
    import asyncio
    
    async def test_agent():
        agent = SearchRoboticsKnowledgeAgent()
        response = await agent.execute("What are digital twins in robotics?")
        print(f"Success: {response.success}")
        print(f"Result: {response.result}")
        print(f"Sources: {response.sources}")
        print(f"Error: {response.error}")
    
    # Run the test
    asyncio.run(test_agent())