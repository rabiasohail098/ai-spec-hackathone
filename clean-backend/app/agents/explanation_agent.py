"""
Explain Robotics Concept Agent

Implements the explain_robotics_concept subagent that explains robotics concepts
at an appropriate level for the user's background.
"""

from typing import Dict, Any, Optional
from app.agents.base import BaseAgent, AgentResponse


class ExplainRoboticsConceptAgent(BaseAgent):
    """
    Agent for explaining robotics concepts.
    
    Provides explanations of robotics concepts at different levels of complexity
    based on the target audience, with optional practical examples.
    """
    
    def __init__(self):
        super().__init__(
            name="explain_robotics_concept",
            description="Explain robotics concepts at an appropriate level for the user's background"
        )
    
    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> AgentResponse:
        """
        Execute the explanation based on the concept requested
        
        Args:
            query: Natural language query asking for an explanation
            context: Additional context including concept and target audience
            
        Returns:
            AgentResponse: Explanation of the robotics concept
        """
        try:
            # Validate input
            if not await self.validate_input(query):
                return self.format_response(
                    success=False,
                    error="Invalid query: query must be at least 3 characters"
                )
            
            # Extract concept and target audience from context
            if not context:
                return self.format_response(
                    success=False,
                    error="Missing context for explanation"
                )
            
            concept = context.get("concept", query.lower()).lower()
            target_audience = context.get("target_audience", "intermediate").lower()
            examples_requested = context.get("examples_requested", False)
            
            # Generate the appropriate explanation based on the concept and audience
            explanation = self._generate_explanation(concept, target_audience, examples_requested)
            
            if not explanation:
                return self.format_response(
                    success=False,
                    error=f"Could not find explanation for concept: {concept}"
                )
            
            return self.format_response(
                success=True,
                result=explanation
            )
            
        except Exception as e:
            return self.format_response(
                success=False,
                error=f"Error generating explanation: {str(e)}"
            )
    
    def _generate_explanation(self, concept: str, target_audience: str, examples_requested: bool) -> Optional[str]:
        """
        Generate an explanation for a specific robotics concept based on the target audience.
        
        Args:
            concept: The robotics concept to explain
            target_audience: The target audience level ('beginner', 'intermediate', 'advanced')
            examples_requested: Whether to include practical examples
            
        Returns:
            str: The explanation text or None if concept not found
        """
        # Dictionary of robotics concepts with different explanations for different audiences
        concept_explanations = {
            "pid control": {
                "beginner": {
                    "explanation": "PID control is like having a smart assistant that helps robots move precisely. Imagine trying to stop your car exactly at a stop sign - PID control is like your brain constantly adjusting the pressure on the brake pedal to stop perfectly at the line.",
                    "examples": "A robot arm using PID to move to a precise position, or a drone maintaining a steady altitude."
                },
                "intermediate": {
                    "explanation": "PID (Proportional-Integral-Derivative) control is a feedback control mechanism that calculates an error value as the difference between a desired setpoint and a measured process variable. It adjusts the process control inputs using a weighted sum of three terms: Proportional (P) - immediate response to current error, Integral (I) - correction for accumulated past errors, Derivative (D) - prediction of future errors based on current rate of change.",
                    "examples": "Controlling motor speed, robot trajectory following, temperature control in manufacturing."
                },
                "advanced": {
                    "explanation": "PID controllers implement the control law: u(t) = K_p e(t) + K_i ∫e(t)dt + K_d de(t)/dt, where K_p, K_i, and K_d are the proportional, integral, and derivative gains respectively. The controller parameters are typically tuned using methods like Ziegler-Nichols, Cohen-Coon, or optimization algorithms to achieve desired response characteristics like minimal overshoot, fast settling time, and good disturbance rejection.",
                    "examples": "Multi-DOF robot joint control with cross-coupling compensation, adaptive PID for time-varying systems, cascade PID structures for complex systems."
                }
            },
            "inverse kinematics": {
                "beginner": {
                    "explanation": "Inverse kinematics is like figuring out how to move your arm joints to touch a specific point. If you want to touch your nose, your brain calculates how much to bend your shoulder, elbow, and wrist. For robots, it's the math that figures out how to position all the joints to reach a specific location.",
                    "examples": "A robot arm reaching for an object, a character in a video game moving their hand to grab something."
                },
                "intermediate": {
                    "explanation": "Inverse kinematics (IK) is the mathematical process of determining the joint parameters (angles, displacements) needed to position the robot's end-effector at a desired location and orientation. Unlike forward kinematics (which computes end-effector position from joint angles), IK computes joint angles from desired end-effector position. The solution can be analytical (closed-form) for simple chains or numerical using iterative methods like Jacobian-based techniques.",
                    "examples": "6-DOF robotic arm reaching tasks, legged robot foot placement, humanoid robot manipulation tasks."
                },
                "advanced": {
                    "explanation": "IK solutions involve solving the equation f(θ) = x, where f represents the forward kinematics function, θ is the vector of joint angles, and x is the desired end-effector pose. Analytical solutions exist for specific geometries (e.g., intersecting axes). Numerical methods include Jacobian transpose, pseudoinverse, and damped least squares (DLS). For redundant systems, additional criteria like joint limit avoidance and obstacle avoidance can be incorporated as optimization objectives.",
                    "examples": "Redundant manipulators with null-space optimization, multi-task IK with prioritization, real-time IK for human motion reconstruction."
                }
            },
            "slam": {
                "beginner": {
                    "explanation": "SLAM (Simultaneous Localization and Mapping) is like exploring an unknown cave while drawing a map and keeping track of where you are at the same time. A robot uses sensors to build a map of its environment while simultaneously figuring out where it is located within that map.",
                    "examples": "A robot vacuum mapping your house while cleaning, self-driving cars understanding their location on the road."
                },
                "intermediate": {
                    "explanation": "SLAM is a computational problem where a robot constructs or updates a map of an unknown environment while simultaneously keeping track of its location within that map. It addresses the 'chicken and egg' problem: you need a map to determine where you are, but you need to know where you are to build a consistent map. Common approaches include EKF-SLAM, FastSLAM, and graph-based SLAM methods.",
                    "examples": "Mobile robot navigation, augmented reality applications, planetary exploration rovers."
                },
                "advanced": {
                    "explanation": "SLAM formulations typically address the posterior p(x_t, m | z_1:t, u_1:t-1), where x_t is robot state, m is map, z are measurements, and u are controls. Approaches include filtering methods (EKF, particle filters), smoothing methods (graph optimization), and hybrid approaches. Key challenges include data association (feature matching), loop closure detection, and scalability to large environments. Modern approaches leverage deep learning for feature extraction and end-to-end learning.",
                    "examples": "Large-scale 3D mapping with LiDAR, multi-robot cooperative SLAM, lifelong SLAM for persistent environments."
                }
            },
            "ros": {
                "beginner": {
                    "explanation": "ROS (Robot Operating System) is like a universal language and toolset that helps different robot parts communicate with each other. It's a middleware that lets sensors, controllers, and applications work together, no matter who built each part.",
                    "examples": "A camera and an arm on a robot communicating to pick up objects, different software packages working together in a single robot system."
                },
                "intermediate": {
                    "explanation": "ROS (Robot Operating System) is a flexible framework for writing robot software that provides services like hardware abstraction, device drivers, libraries, visualizers, message-passing, and package management. It uses a distributed computing model where processes (nodes) communicate via messages on topics (publish-subscribe) or services (request-response). ROS2 adds quality of service features, multi-robot support, and improved security.",
                    "examples": "Sensor fusion applications, multi-robot coordination, simulation integration with Gazebo."
                },
                "advanced": {
                    "explanation": "ROS/ROS2 implements a graph-based architecture with nodes (processes), topics (named buses), services (synchronous communication), and actions (goal-oriented communication). Middleware includes DDS implementations for ROS2 (Fast DDS, Cyclone DDS, RTI Connext) for robust message passing. Key concepts include roscore/master, parameter server, tf transform library, and package management with catkin/colcon. Real-time performance considerations and security frameworks are important for deployment.",
                    "examples": "Real-time control with ROS2, secure multi-robot systems, performance optimization for embedded platforms."
                }
            },
            "computer vision": {
                "beginner": {
                    "explanation": "Computer vision is how robots 'see' and understand the world around them, similar to how your eyes and brain work together to recognize objects. It's the technology that allows robots to identify things like a red ball, a person's face, or a door.",
                    "examples": "A robot recognizing objects on a table, self-driving cars detecting pedestrians and road signs."
                },
                "intermediate": {
                    "explanation": "Computer vision in robotics involves processing and analyzing visual data from cameras to extract meaningful information for navigation, manipulation, and interaction. It includes techniques like image filtering, edge detection, feature extraction, object recognition, and 3D reconstruction. In robotics, it's used for visual servoing, object tracking, and scene understanding.",
                    "examples": "Visual servoing for robot arm control, object detection for pick-and-place tasks, visual SLAM."
                },
                "advanced": {
                    "explanation": "Robot vision systems integrate perception with action, often involving real-time processing, sensor fusion, and uncertainty handling. Key challenges include dealing with varying lighting conditions, partial observability, and computational constraints. Advanced techniques include deep learning for object detection/classification, geometric computer vision for 3D understanding, and learning from demonstration for visual tasks.",
                    "examples": "Deep learning-based manipulation planning, vision-based navigation in dynamic environments, multimodal perception combining vision with other sensors."
                }
            }
        }
        
        # Normalize the concept name to match our dictionary
        normalized_concept = self._normalize_concept_name(concept)
        
        if normalized_concept not in concept_explanations:
            return None
        
        concept_data = concept_explanations[normalized_concept]
        
        # Get the appropriate explanation based on target audience
        if target_audience not in concept_data:
            target_audience = "intermediate"  # default to intermediate if invalid
        
        explanation_data = concept_data[target_audience]
        explanation_text = explanation_data["explanation"]
        
        # Add examples if requested
        if examples_requested:
            examples_text = explanation_data["examples"]
            explanation_text += f"\n\nExamples: {examples_text}"
        
        return explanation_text
    
    def _normalize_concept_name(self, concept: str) -> str:
        """
        Normalize the concept name to match our internal dictionary keys.
        
        Args:
            concept: The concept name as provided by the user
            
        Returns:
            str: The normalized concept name
        """
        # Dictionary of user input variations mapped to our standard names
        concept_aliases = {
            "pid": "pid control",
            "pid controller": "pid control",
            "pid control": "pid control",
            "inverse kinematic": "inverse kinematics", 
            "inverse kinematics": "inverse kinematics",
            "ik": "inverse kinematics",
            "simultaneous localization and mapping": "slam",
            "slam": "slam",
            "robot operating system": "ros",
            "ros": "ros",
            "ros2": "ros",
            "computer vision": "computer vision",
            "machine vision": "computer vision",
            "robot vision": "computer vision"
        }
        
        # Normalize the input concept
        normalized = concept.lower().strip()
        
        # Handle multi-word concepts by removing common connecting words
        for word in ['for', 'in', 'on', 'with', 'the', 'a', 'an', 'and']:
            normalized = normalized.replace(f' {word} ', ' ')
        
        return concept_aliases.get(normalized, normalized)


# For testing purposes
if __name__ == "__main__":
    import asyncio
    
    async def test_agent():
        agent = ExplainRoboticsConceptAgent()
        
        # Test explanation
        context = {
            "concept": "pid control",
            "target_audience": "beginner",
            "examples_requested": True
        }
        response = await agent.execute("Explain PID control", context)
        print(f"Success: {response.success}")
        print(f"Result: {response.result}")
        print(f"Error: {response.error}")
    
    # Run the test
    asyncio.run(test_agent())