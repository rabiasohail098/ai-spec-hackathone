# Subagent System Specification

## Overview
This document specifies the requirements for the OpenAI-based subagent system that handles specialized tasks in the RAG chatbot.

## Subagent Architecture

### 1. Core Design Principle
- Use OpenAI Functions for agent orchestration
- Specialized agents for different types of robotics queries
- Intent-based routing to appropriate subagents
- Context-aware processing capabilities

### 2. Available Subagents

#### 2.1 Search Robotics Knowledge Subagent
- **Function Name**: `search_robotics_knowledge`
- **Purpose**: Find relevant information in robotics book content
- **Parameters**:
  - `query`: User's search query
- **Return**: Relevant content from book indexed in vector store

#### 2.2 Perform Robotics Calculation Subagent
- **Function Name**: `perform_robotics_calculation`
- **Purpose**: Handle mathematical calculations related to robotics
- **Parameters**:
  - `query`: Calculation request
- **Return**: Calculated results with explanations

#### 2.3 Analyze Robotics Code Subagent
- **Function Name**: `analyze_robotics_code`
- **Purpose**: Explain robotics-related code examples
- **Parameters**:
  - `code`: Code to analyze
- **Return**: Explanation of code functionality in robotics context

#### 2.4 Explain Robotics Concept Subagent
- **Function Name**: `explain_robotics_concept`
- **Purpose**: Simplify complex robotics concepts
- **Parameters**:
  - `concept`: Robotics concept to explain
- **Return**: Simplified explanation with examples

## Intent Recognition System

### 1. Supported Intents
- **Summarize**: Keywords: ["summarize", "summary", "brief"]
- **Mind Map**: Keywords: ["mind map", "diagram", "visualize"]
- **Explain**: Keywords: ["explain", "simple", "clarify"]
- **Key Points**: Keywords: ["key points", "important", "main"]

### 2. Intent Processing
- Analyze user query for intent keywords
- Route to appropriate subagent based on intent
- Format query appropriately for subagent
- Handle mixed or unclear intents gracefully

## Context Handling

### 1. Context Priority
1. User-provided context (selected text)
2. Retrieved content from vector store
3. General knowledge from LLM

### 2. Context Integration
- Preserve context relevance in responses
- Indicate sources of information
- Handle context switching appropriately
- Maintain conversation context across interactions

## Communication Protocol

### 1. Function Calling Process
1. Analyze user query
2. Determine appropriate subagent(s)
3. Format parameters for function call
4. Execute function call to subagent
5. Process function response
6. Generate final response to user

### 2. Error Handling
- Handle function call failures
- Provide fallback responses
- Log subagent errors for debugging
- Maintain user experience during errors

## Performance Requirements

### 1. Response Time
- Subagent selection under 100ms
- Function execution under 2 seconds
- Total processing under 3 seconds

### 2. Accuracy Requirements
- Intent recognition accuracy >90%
- Proper routing to relevant subagent >95%
- Context preservation in responses >98%

## Security Requirements

### 1. Input Sanitization
- Sanitize all user inputs
- Prevent injection attacks
- Validate function parameters
- Handle malicious inputs safely

### 2. Output Filtering
- Filter sensitive information from outputs
- Prevent data leakage
- Sanitize code outputs
- Maintain privacy in responses

## Extensibility Requirements

### 1. New Subagent Addition
- Support for adding new subagents without system changes
- Standardized interface for subagent integration
- Configuration-based subagent registration
- Minimal code changes for new capabilities

### 2. Customization
- Configurable subagent parameters
- Customizable response formatting
- Adaptable to different domain knowledge
- Support for different LLM providers

## Monitoring and Logging

### 1. Required Metrics
- Subagent usage statistics
- Response time measurements
- Error rate tracking
- Intent recognition accuracy

### 2. Logging Requirements
- All function calls and responses
- Error conditions and handling
- Performance metrics
- Security events

## Integration Requirements

### 1. With Backend
- Proper API integration with main backend
- Consistent error handling
- Shared configuration management
- Common logging format

### 2. With MCP System
- Integration with context from MCP
- Respect context provided by MCP
- Maintain context flow between systems
- Error coordination with MCP