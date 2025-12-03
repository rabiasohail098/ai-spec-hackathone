"""
Base Agent Class - Foundation for specialized subagents in the robotics domain

Defines the common interface and functionality for all specialized subagents:
- search_robotics_knowledge
- perform_robotics_calculation  
- explain_robotics_concept
- analyze_robotics_code

Each subagent inherits from this base class and implements specific functionality.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel


class AgentResponse(BaseModel):
    """Standard response format for all agent responses"""
    success: bool
    result: Optional[str] = None
    error: Optional[str] = None
    sources: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class BaseAgent(ABC):
    """
    Abstract base class for all specialized subagents.
    
    Each subagent should inherit from this class and implement the execute method,
    following the single responsibility principle.
    """
    
    def __init__(self, name: str, description: str):
        """
        Initialize the agent with a name and description
        
        Args:
            name: Unique identifier for the agent
            description: Brief description of what the agent does
        """
        self.name = name
        self.description = description
    
    @abstractmethod
    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> AgentResponse:
        """
        Execute the agent's core functionality
        
        Args:
            query: The user's request or question
            context: Additional context that might be relevant
            
        Returns:
            AgentResponse: Standardized response format
        """
        pass

    async def validate_input(self, query: str) -> bool:
        """
        Validate the input query before processing
        
        Args:
            query: The query to validate
            
        Returns:
            bool: True if query is valid, False otherwise
        """
        if not query or not query.strip():
            return False
        if len(query.strip()) < 3:
            return False
        return True

    def format_response(self, success: bool, result: Optional[str] = None, 
                       error: Optional[str] = None, sources: Optional[List[str]] = None,
                       metadata: Optional[Dict[str, Any]] = None) -> AgentResponse:
        """
        Format the response in the standard format
        
        Args:
            success: Whether the operation was successful
            result: The result of the operation (if successful)
            error: Error message (if operation failed)
            sources: List of sources used (if applicable)
            metadata: Additional metadata (if applicable)
            
        Returns:
            AgentResponse: Properly formatted response
        """
        return AgentResponse(
            success=success,
            result=result,
            error=error,
            sources=sources,
            metadata=metadata
        )