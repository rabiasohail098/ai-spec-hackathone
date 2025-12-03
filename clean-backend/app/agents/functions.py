"""
OpenAI Function Schemas for Robotics Subagents

Defines the function schemas used by OpenAI's function calling API to route
queries to the appropriate specialized subagent.
"""

# Function schema for searching robotics knowledge
SEARCH_ROBOTICS_KNOWLEDGE_SCHEMA = {
    "name": "search_robotics_knowledge",
    "description": "Search for information about robotics concepts, theories, and best practices in the knowledge base",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string", 
                "description": "The specific robotics concept, term, or topic to search for in the knowledge base"
            },
            "query_type": {
                "type": "string",
                "enum": ["definition", "best_practices", "theory", "application", "comparison"],
                "description": "The type of information being requested"
            }
        },
        "required": ["query", "query_type"]
    }
}

# Function schema for performing robotics calculations
PERFORM_ROBOTICS_CALCULATION_SCHEMA = {
    "name": "perform_robotics_calculation",
    "description": "Perform robotics-related calculations including kinematics, dynamics, torque, force, velocity, acceleration, and other physics calculations",
    "parameters": {
        "type": "object",
        "properties": {
            "calculation_type": {
                "type": "string",
                "enum": ["torque", "velocity", "acceleration", "kinematics", "dynamics", "force", "power", "energy", "momentum"],
                "description": "The type of calculation to perform"
            },
            "parameters": {
                "type": "object",
                "description": "Calculation-specific parameters",
                "properties": {
                    "mass": {"type": "number", "description": "Mass in kg (for force/torque calculations)"},
                    "length": {"type": "number", "description": "Length in meters (for moment of inertia)"},
                    "angle": {"type": "number", "description": "Angle in radians"},
                    "angular_velocity": {"type": "number", "description": "Angular velocity in rad/s"},
                    "angular_acceleration": {"type": "number", "description": "Angular acceleration in rad/s²"},
                    "linear_velocity": {"type": "number", "description": "Linear velocity in m/s"},
                    "linear_acceleration": {"type": "number", "description": "Linear acceleration in m/s²"},
                    "force": {"type": "number", "description": "Force in Newtons"},
                    "torque": {"type": "number", "description": "Torque in N⋅m"},
                    "time": {"type": "number", "description": "Time in seconds"},
                    "distance": {"type": "number", "description": "Distance in meters"}
                }
            },
            "requirements": ["calculation_type"]
        }
    }
}

# Function schema for explaining robotics concepts
EXPLAIN_ROBOTICS_CONCEPT_SCHEMA = {
    "name": "explain_robotics_concept",
    "description": "Explain robotics concepts at an appropriate level for the user's background",
    "parameters": {
        "type": "object",
        "properties": {
            "concept": {
                "type": "string",
                "description": "The specific robotics concept to explain (e.g., inverse kinematics, PID control, SLAM)"
            },
            "target_audience": {
                "type": "string", 
                "enum": ["beginner", "intermediate", "advanced"],
                "description": "The intended audience level for the explanation"
            },
            "examples_requested": {
                "type": "boolean",
                "description": "Whether to include practical examples in the explanation"
            }
        },
        "required": ["concept", "target_audience"]
    }
}

# Function schema for analyzing robotics code
ANALYZE_ROBOTICS_CODE_SCHEMA = {
    "name": "analyze_robotics_code",
    "description": "Analyze robotics-related code for errors, optimization opportunities, and best practices",
    "parameters": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "The robotics code to analyze"
            },
            "language": {
                "type": "string",
                "enum": ["python", "cpp", "ros2"],
                "description": "The programming language of the code"
            },
            "analysis_type": {
                "type": "string",
                "enum": ["error_check", "optimization", "best_practices", "documentation"],
                "description": "The type of analysis to perform"
            },
            "robotics_framework": {
                "type": "string",
                "enum": ["ros2", "ros1", "moveit", "navigation2", "gazebo", "other"],
                "description": "The robotics framework being used if applicable"
            }
        },
        "required": ["code", "language", "analysis_type"]
    }
}

# List of all function schemas
FUNCTION_SCHEMAS = [
    SEARCH_ROBOTICS_KNOWLEDGE_SCHEMA,
    PERFORM_ROBOTICS_CALCULATION_SCHEMA,
    EXPLAIN_ROBOTICS_CONCEPT_SCHEMA,
    ANALYZE_ROBOTICS_CODE_SCHEMA
]

# Mapping function names to their schemas
FUNCTION_NAME_TO_SCHEMA = {
    "search_robotics_knowledge": SEARCH_ROBOTICS_KNOWLEDGE_SCHEMA,
    "perform_robotics_calculation": PERFORM_ROBOTICS_CALCULATION_SCHEMA,
    "explain_robotics_concept": EXPLAIN_ROBOTICS_CONCEPT_SCHEMA,
    "analyze_robotics_code": ANALYZE_ROBOTICS_CODE_SCHEMA
}