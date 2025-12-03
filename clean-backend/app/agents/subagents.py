"""
Subagent Orchestration for Chat Endpoint

Implements the orchestration logic to route queries to appropriate subagents
based on the detected intent or function call from OpenAI.
"""

import json
from typing import Dict, Any, Optional, List
from app.agents.search_agent import SearchRoboticsKnowledgeAgent
from app.agents.calculation_agent import PerformRoboticsCalculationAgent
from app.agents.explanation_agent import ExplainRoboticsConceptAgent
from app.agents.code_agent import AnalyzeRoboticsCodeAgent
from app.agents.base import AgentResponse


class SubAgentOrchestrator:
    """
    Orchestrates the routing of queries to appropriate specialized subagents.
    
    Based on the detected intent or function call from OpenAI's function calling,
    routes the query to the appropriate specialized agent.
    """
    
    def __init__(self):
        self.agents = {
            "search_robotics_knowledge": SearchRoboticsKnowledgeAgent(),
            "perform_robotics_calculation": PerformRoboticsCalculationAgent(),
            "explain_robotics_concept": ExplainRoboticsConceptAgent(),
            "analyze_robotics_code": AnalyzeRoboticsCodeAgent()
        }
    
    async def route_to_agent(self, function_name: str, function_args: Dict[str, Any], 
                           query: str = "") -> AgentResponse:
        """
        Route the function call to the appropriate agent.
        
        Args:
            function_name: The name of the function to call (agent to use)
            function_args: Arguments to pass to the function/agent
            query: Original user query (optional)
            
        Returns:
            AgentResponse: Response from the appropriate agent
        """
        if function_name not in self.agents:
            return AgentResponse(
                success=False,
                error=f"Unknown function/agent: {function_name}"
            )
        
        agent = self.agents[function_name]
        
        # Prepare context for the agent based on function arguments
        context = function_args
        
        try:
            # Execute the agent with the provided arguments
            response = await agent.execute(query, context)
            return response
        except Exception as e:
            return AgentResponse(
                success=False,
                error=f"Error executing agent {function_name}: {str(e)}"
            )
    
    async def process_query_with_agents(self, query: str, detected_intent: Optional[str] = None) -> Optional[AgentResponse]:
        """
        Process a query by attempting to determine the appropriate agent to handle it.
        
        Args:
            query: The user's query
            detected_intent: Pre-detected intent (optional)
            
        Returns:
            AgentResponse: Response from an agent if appropriate, None otherwise
        """
        # If we have a detected intent, try to match it to an agent
        if detected_intent:
            intent_agent_mapping = {
                "search": "search_robotics_knowledge",
                "calculation": "perform_robotics_calculation",
                "explain": "explain_robotics_concept",
                "code_analysis": "analyze_robotics_code"
            }
            
            agent_name = intent_agent_mapping.get(detected_intent)
            if agent_name:
                # For simple intent-based routing, pass the query directly to the appropriate agent
                agent = self.agents[agent_name]
                
                # Prepare context based on the agent type
                context = {}
                if agent_name == "search_robotics_knowledge":
                    context = {"query_type": "general"}
                elif agent_name == "explain_robotics_concept":
                    context = {"concept": query, "target_audience": "intermediate", "examples_requested": True}
                
                return await agent.execute(query, context)
        
        # If no specific intent detected, we can implement keyword-based detection
        query_lower = query.lower()
        
        # Check for calculation-related keywords
        calculation_keywords = ["calculate", "compute", "torque", "velocity", "acceleration", "force", "power", "energy", "momentum", "kinematics", "dynamics"]
        if any(keyword in query_lower for keyword in calculation_keywords):
            agent = self.agents["perform_robotics_calculation"]
            # Extract calculation type from query - this is a simplification
            calc_type = "force"  # Default to force; in real implementation, this would be more sophisticated
            for ct in ["torque", "velocity", "acceleration", "kinematics", "dynamics", "force", "power", "energy", "momentum"]:
                if ct in query_lower:
                    calc_type = ct
                    break
            context = {
                "calculation_type": calc_type,
                "parameters": {}  # In a real implementation, this would be parsed from the query
            }
            return await agent.execute(query, context)
        
        # Check for explanation-related keywords
        explanation_keywords = ["explain", "what is", "what's", "definition", "define", "concept", "how does", "principle"]
        if any(keyword in query_lower for keyword in explanation_keywords):
            agent = self.agents["explain_robotics_concept"]
            context = {"concept": query, "target_audience": "intermediate", "examples_requested": True}
            return await agent.execute(query, context)
        
        # Check for code-related keywords
        code_keywords = ["code", "function", "algorithm", "implement", "error", "debug", "optimiz"]
        if any(keyword in query_lower for keyword in code_keywords):
            agent = self.agents["analyze_robotics_code"]
            context = {"language": "python", "analysis_type": "error_check"}  # Default values
            return await agent.execute(query, context)
        
        # For general knowledge queries, use search agent
        if any(keyword in query_lower for keyword in ["what", "how", "when", "where", "why", "information", "tell me"]):
            agent = self.agents["search_robotics_knowledge"]
            context = {"query_type": "general"}
            return await agent.execute(query, context)
        
        # If no specific agent seems appropriate, return None to fall back to general LLM
        return None


# Singleton instance
_subagent_orchestrator = SubAgentOrchestrator()


def get_subagent_orchestrator():
    """
    Get the singleton instance of the subagent orchestrator.
    
    Returns:
        SubAgentOrchestrator: The singleton orchestrator instance
    """
    return _subagent_orchestrator