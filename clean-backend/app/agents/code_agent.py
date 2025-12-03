"""
Analyze Robotics Code Agent

Implements the analyze_robotics_code subagent that analyzes robotics-related code
for errors, optimization opportunities, and best practices.
"""

import re
from typing import Dict, Any, Optional
from app.agents.base import BaseAgent, AgentResponse


class AnalyzeRoboticsCodeAgent(BaseAgent):
    """
    Agent for analyzing robotics code.
    
    Analyzes robotics-related code for errors, optimization opportunities,
    best practices, and documentation, supporting Python, C++, and ROS2.
    """
    
    def __init__(self):
        super().__init__(
            name="analyze_robotics_code",
            description="Analyze robotics-related code for errors, optimization opportunities, and best practices"
        )
    
    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> AgentResponse:
        """
        Execute the code analysis
        
        Args:
            query: Natural language query describing the code analysis needed
            context: Additional context including code, language, and analysis type
            
        Returns:
            AgentResponse: Analysis results with recommendations
        """
        try:
            # Validate input
            if not await self.validate_input(query):
                return self.format_response(
                    success=False,
                    error="Invalid query: query must be at least 3 characters"
                )
            
            # Extract code, language, and analysis type from context
            if not context:
                return self.format_response(
                    success=False,
                    error="Missing context for code analysis"
                )
            
            code = context.get("code")
            language = context.get("language", "python").lower()
            analysis_type = context.get("analysis_type", "error_check").lower()
            
            if not code:
                return self.format_response(
                    success=False,
                    error="No code provided for analysis"
                )
            
            if language not in ["python", "cpp", "ros2"]:
                return self.format_response(
                    success=False,
                    error=f"Unsupported language: {language}. Supported: python, cpp, ros2"
                )
            
            if analysis_type not in ["error_check", "optimization", "best_practices", "documentation"]:
                return self.format_response(
                    success=False,
                    error=f"Unsupported analysis type: {analysis_type}. Supported: error_check, optimization, best_practices, documentation"
                )
            
            # Perform the analysis based on type
            analysis_results = self._analyze_code(code, language, analysis_type)
            
            if not analysis_results:
                return self.format_response(
                    success=False,
                    error="No issues found or analysis completed without findings"
                )
            
            return self.format_response(
                success=True,
                result=analysis_results
            )
            
        except Exception as e:
            return self.format_response(
                success=False,
                error=f"Error analyzing code: {str(e)}"
            )
    
    def _analyze_code(self, code: str, language: str, analysis_type: str) -> str:
        """
        Perform the specified type of analysis on the code.
        
        Args:
            code: The code to analyze
            language: The programming language ('python', 'cpp', 'ros2')
            analysis_type: The type of analysis ('error_check', 'optimization', 'best_practices', 'documentation')
            
        Returns:
            str: The analysis results
        """
        analysis_functions = {
            "error_check": self._check_for_errors,
            "optimization": self._check_for_optimization,
            "best_practices": self._check_for_best_practices,
            "documentation": self._check_for_documentation
        }
        
        analysis_result = analysis_functions[analysis_type](code, language)
        
        # Format the result based on analysis type
        header = f"## {analysis_type.replace('_', ' ').title()} Analysis for {language.upper()} Code\n\n"
        return header + analysis_result
    
    def _check_for_errors(self, code: str, language: str) -> str:
        """
        Check for common errors in the provided code.
        """
        errors_found = []
        
        # Check for undefined variables, syntax errors, etc.
        if language == "python":
            # Check for common Python errors
            lines = code.split('\n')
            for i, line in enumerate(lines, start=1):
                # Check for undefined variables (basic check)
                if re.search(r'(\w+)\s*=\s*(\w+)(?!\s*=\s*\w+\s*$)', line) and not re.search(r'^\s*#', line):
                    # This is a very basic check
                    pass
                
                # Check for common syntax issues
                if line.count('(') != line.count(')'):
                    errors_found.append(f"Line {i}: Unmatched parentheses")
                
                if line.count('[') != line.count(']'):
                    errors_found.append(f"Line {i}: Unmatched brackets")
                    
                if line.count('{') != line.count('}'):
                    errors_found.append(f"Line {i}: Unmatched braces")
        
        elif language == "cpp":
            # Check for common C++ errors
            lines = code.split('\n')
            for i, line in enumerate(lines, start=1):
                # Check for missing semicolons
                if re.search(r'\w+\s+.*[^;](?=\n|$)', line) and not re.match(r'^\s*(if|else|for|while|do|switch|case|default|try|catch|class|struct|union|enum|template|namespace|return|continue|break)', line.strip()):
                    # This is a very basic check for missing semicolons
                    pass
                
                # Check for unmatched braces
                if line.count('{') != line.count('}'):
                    errors_found.append(f"Line {i}: Unmatched braces")
        
        elif language == "ros2":
            # Check for common ROS2 errors
            lines = code.split('\n')
            for i, line in enumerate(lines, start=1):
                # Check for missing node creation
                if 'rclpy.init(' in line and not any('Node(' in l for l in lines):
                    errors_found.append(f"Line {i}: rclpy initialized but no Node created")
                
                # Check for missing spin
                if 'rclpy.init(' in line and not any('spin(' in l for l in lines):
                    errors_found.append(f"Line {i}: Node created but never spun")
        
        if errors_found:
            return "Errors found:\n" + "\n".join([f"- {error}" for error in errors_found])
        else:
            return "No obvious errors found in the code."
    
    def _check_for_optimization(self, code: str, language: str) -> str:
        """
        Check for potential optimizations in the provided code.
        """
        optimizations_found = []
        
        if language == "python":
            # Check for inefficient operations
            if 'for' in code and 'append' in code:
                optimizations_found.append(
                    "Consider using list comprehensions instead of loops with append() for better performance."
                )
            
            if 'pandas' in code and 'iterrows()' in code:
                optimizations_found.append(
                    "Avoid iterrows() for large DataFrames. Use vectorized operations or apply() instead."
                )
                
            if re.search(r'np\..*loop', code) or 'while True:' in code:
                optimizations_found.append(
                    "Consider using vectorized operations instead of explicit loops for better performance."
                )
        
        elif language == "cpp":
            # Check for C++ optimization opportunities
            if 'new' in code and 'delete' not in code:
                optimizations_found.append(
                    "Memory allocated with 'new' should be freed with 'delete' to prevent memory leaks. Consider using smart pointers."
                )
            
            if 'std::vector' in code and 'push_back' in code:
                optimizations_found.append(
                    "Pre-allocate vector capacity with reserve() if the final size is known to avoid repeated reallocations."
                )
        
        elif language == "ros2":
            # Check for ROS2 optimization opportunities
            if 'create_publisher' in code:
                optimizations_found.append(
                    "Consider setting appropriate QoS (Quality of Service) profiles for better performance."
                )
            
            if 'for' in code and 'rclpy' in code:
                optimizations_found.append(
                    "Avoid blocking operations inside loops that run at high frequency. Consider using timers."
                )
        
        if optimizations_found:
            return "Optimization opportunities:\n" + "\n".join([f"- {opt}" for opt in optimizations_found])
        else:
            return "No obvious optimization opportunities found in the code."
    
    def _check_for_best_practices(self, code: str, language: str) -> str:
        """
        Check for adherence to best practices in the provided code.
        """
        best_practices_issues = []
        
        if language == "python":
            # Check for Python best practices
            if 'import *' in code:
                best_practices_issues.append(
                    "Avoid 'from module import *' as it clutters the namespace and makes it unclear which names are present."
                )
            
            if '__name__ == \"__main__\"' not in code and ('def main' in code or 'if __name__' not in code):
                best_practices_issues.append(
                    "Use 'if __name__ == \"__main__\":' to allow the script to be run directly or imported as a module."
                )
            
            if re.search(r'print\s*\(', code):
                best_practices_issues.append(
                    "Consider using proper logging instead of print() statements for debugging and production code."
                )
        
        elif language == "cpp":
            # Check for C++ best practices
            if 'using namespace std' in code:
                best_practices_issues.append(
                    "Avoid 'using namespace std' in headers. Use fully qualified names or specific using declarations."
                )
            
            if '#include <iostream>' in code and 'std::cout' not in code:
                best_practices_issues.append(
                    "Include only the headers that are actually needed in the code."
                )
        
        elif language == "ros2":
            # Check for ROS2 best practices
            if 'rclpy.Rate' in code:
                best_practices_issues.append(
                    "Consider using rclpy.node.create_rate() or node.create_timer() instead of rclpy.Rate for better ROS2 practices."
                )
            
            if '__main__' in code and not re.search(r'rclpy\.init', code):
                best_practices_issues.append(
                    "Ensure rclpy is properly initialized and shutdown in main function."
                )
        
        if best_practices_issues:
            return "Best practices issues:\n" + "\n".join([f"- {issue}" for issue in best_practices_issues])
        else:
            return "No obvious best practices issues found in the code."
    
    def _check_for_documentation(self, code: str, language: str) -> str:
        """
        Check for documentation quality in the provided code.
        """
        documentation_issues = []
        
        if language == "python":
            # Check for Python documentation
            if re.search(r'def \w+\s*\(', code) and '"""' not in code and "'''" not in code:
                documentation_issues.append(
                    "Functions should have docstrings explaining their purpose, parameters, and return values."
                )
            
            if re.search(r'class \w+', code) and '"""' not in code and "'''" not in code:
                documentation_issues.append(
                    "Classes should have docstrings explaining their purpose and usage."
                )
        
        elif language == "cpp":
            # Check for C++ documentation
            if re.search(r'void \w+\s*\(|int \w+\s*\(|float \w+\s*\(', code):
                if not re.search(r'//|/\*|\*/', code):
                    documentation_issues.append(
                        "Functions should have comments explaining their purpose and parameters."
                    )
        
        elif language == "ros2":
            # Check for ROS2 documentation
            if 'class' in code and 'Node' in code:
                documentation_issues.append(
                    "ROS2 Nodes should be thoroughly documented with comments explaining publishers, subscribers, and services."
                )
            
            if 'create_publisher' in code or 'create_subscription' in code:
                documentation_issues.append(
                    "Publishers and subscribers should be documented with comments explaining the message types and purpose."
                )
        
        if documentation_issues:
            return "Documentation issues:\n" + "\n".join([f"- {issue}" for issue in documentation_issues])
        else:
            return "No obvious documentation issues found in the code."


# For testing purposes
if __name__ == "__main__":
    import asyncio
    
    async def test_agent():
        agent = AnalyzeRoboticsCodeAgent()
        
        # Test code analysis
        sample_code = """
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
        """
        
        context = {
            "code": sample_code,
            "language": "ros2",
            "analysis_type": "best_practices"
        }
        response = await agent.execute("Analyze this ROS2 code", context)
        print(f"Success: {response.success}")
        print(f"Result: {response.result}")
        print(f"Error: {response.error}")
    
    # Run the test
    asyncio.run(test_agent())