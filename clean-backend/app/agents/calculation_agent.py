"""
Perform Robotics Calculation Agent

Implements the perform_robotics_calculation subagent that performs
robotics-related calculations including kinematics, dynamics, torque, force,
velocity, acceleration, and other physics calculations.
"""

import math
import re
from typing import Dict, Any, Optional
from app.agents.base import BaseAgent, AgentResponse
from openai import OpenAI
from app.core.config import settings

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class PerformRoboticsCalculationAgent(BaseAgent):
    """
    Agent for performing robotics calculations.
    
    Handles calculations related to robotics including kinematics, dynamics,
    torque, force, velocity, acceleration, and other physics calculations.
    """
    
    def __init__(self):
        super().__init__(
            name="perform_robotics_calculation",
            description="Perform robotics-related calculations including kinematics, dynamics, torque, force, velocity, acceleration, and other physics calculations"
        )
    
    async def execute(self, query: str, context: Optional[Dict[str, Any]] = None) -> AgentResponse:
        """
        Execute the calculation based on the query
        
        Args:
            query: Natural language query describing the calculation needed
            context: Additional context including parameters for calculation
            
        Returns:
            AgentResponse: Calculation result with explanation
        """
        try:
            # Validate input
            if not await self.validate_input(query):
                return self.format_response(
                    success=False,
                    error="Invalid query: query must be at least 3 characters"
                )
            
            # Extract parameters and calculation type from context or query
            if context and "parameters" in context and context["parameters"]:
                calculation_type = context.get("calculation_type", "").lower()
                params = context.get("parameters", {})
            else:
                # Try to parse parameters from natural language query
                calculation_type, params = self._parse_query(query)
                if not calculation_type:
                    return self.format_response(
                        success=False,
                        error="Could not determine calculation type from query. Please specify what you want to calculate."
                    )
            
            # Perform the specific calculation based on type
            result = None
            explanation = ""
            
            if calculation_type == "torque":
                result, explanation = self._calculate_torque(params)
            elif calculation_type == "velocity":
                result, explanation = self._calculate_velocity(params)
            elif calculation_type == "acceleration":
                result, explanation = self._calculate_acceleration(params)
            elif calculation_type == "kinematics":
                result, explanation = self._calculate_kinematics(params)
            elif calculation_type == "dynamics":
                result, explanation = self._calculate_dynamics(params)
            elif calculation_type == "force":
                result, explanation = self._calculate_force(params)
            elif calculation_type == "power":
                result, explanation = self._calculate_power(params)
            elif calculation_type == "energy":
                result, explanation = self._calculate_energy(params)
            elif calculation_type == "momentum":
                result, explanation = self._calculate_momentum(params)
            else:
                return self.format_response(
                    success=False,
                    error=f"Unknown calculation type: {calculation_type}"
                )
            
            if result is None:
                return self.format_response(
                    success=False,
                    error="Could not perform calculation with provided parameters"
                )
            
            # Format the response
            response_text = f"Calculation Result: {result}\n\n{explanation}"
            
            return self.format_response(
                success=True,
                result=response_text
            )
            
        except Exception as e:
            return self.format_response(
                success=False,
                error=f"Error performing calculation: {str(e)}"
            )

    def _parse_query(self, query: str) -> tuple[str, Dict[str, Any]]:
        """
        Parse natural language query to extract calculation type and parameters.

        Examples:
        - "Calculate torque for 2kg arm" -> torque, {mass: 2}
        - "Calculate torque for 2kg arm at 0.5m with 10N force" -> torque, {force: 10, distance: 0.5, mass: 2}

        Returns:
            Tuple of (calculation_type, parameters)
        """
        query_lower = query.lower()

        # Determine calculation type
        calc_type = None
        calc_keywords = {
            "torque": ["torque"],
            "force": ["force"],
            "velocity": ["velocity", "speed"],
            "acceleration": ["acceleration"],
            "kinematics": ["kinematics", "position", "displacement"],
            "power": ["power"],
            "energy": ["energy"],
            "momentum": ["momentum"]
        }

        for ctype, keywords in calc_keywords.items():
            if any(kw in query_lower for kw in keywords):
                calc_type = ctype
                break

        if not calc_type:
            return None, {}

        # Extract numerical parameters using regex
        params = {}

        # Extract mass (kg)
        mass_match = re.search(r'(\d+\.?\d*)\s*(kg|kilogram)', query_lower)
        if mass_match:
            params['mass'] = float(mass_match.group(1))

        # Extract force (N)
        force_match = re.search(r'(\d+\.?\d*)\s*(n|newton)', query_lower)
        if force_match:
            params['force'] = float(force_match.group(1))

        # Extract distance/length (m)
        distance_match = re.search(r'(\d+\.?\d*)\s*(m|meter|metre)(?!\/)', query_lower)
        if distance_match:
            params['distance'] = float(distance_match.group(1))

        # Extract time (s)
        time_match = re.search(r'(\d+\.?\d*)\s*(s|second)', query_lower)
        if time_match:
            params['time'] = float(time_match.group(1))

        # Extract velocity (m/s)
        velocity_match = re.search(r'(\d+\.?\d*)\s*(m/s|meter per second)', query_lower)
        if velocity_match:
            params['initial_velocity'] = float(velocity_match.group(1))

        # For torque with arm, if we have mass and distance, calculate torque due to gravity
        if calc_type == "torque" and 'mass' in params and 'distance' in params and 'force' not in params:
            # Assume gravitational torque: τ = m * g * r
            # where g = 9.81 m/s²
            g = 9.81
            params['force'] = params['mass'] * g

        return calc_type, params

    def _calculate_force(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate force using F = m * a (Newton's second law)
        """
        mass = params.get('mass')
        linear_acceleration = params.get('linear_acceleration')
        
        if mass is not None and linear_acceleration is not None:
            force = mass * linear_acceleration
            explanation = f"Calculated using Newton's second law: F = m × a\nF = {mass} kg × {linear_acceleration} m/s² = {force} N"
            return f"{force} N", explanation
        else:
            return None, "Insufficient parameters for force calculation. Need mass and linear acceleration."
    
    def _calculate_torque(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate torque using τ = r × F or τ = I × α
        """
        force = params.get('force')
        distance = params.get('distance')  # perpendicular distance from axis
        angular_acceleration = params.get('angular_acceleration')
        moment_of_inertia = params.get('moment_of_inertia')  # placeholder, would need to calculate based on geometry
        
        if force is not None and distance is not None:
            torque = force * distance
            explanation = f"Calculated using τ = F × r (perpendicular distance)\nτ = {force} N × {distance} m = {torque} N⋅m"
            return f"{torque} N⋅m", explanation
        elif moment_of_inertia is not None and angular_acceleration is not None:
            torque = moment_of_inertia * angular_acceleration
            explanation = f"Calculated using τ = I × α (angular acceleration)\nτ = {moment_of_inertia} kg⋅m² × {angular_acceleration} rad/s² = {torque} N⋅m"
            return f"{torque} N⋅m", explanation
        else:
            return None, "Insufficient parameters for torque calculation. Need either (force and distance) or (moment of inertia and angular acceleration)."
    
    def _calculate_velocity(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate velocity using v = d/t or v = u + at
        """
        distance = params.get('distance')
        time = params.get('time')
        initial_velocity = params.get('initial_velocity', 0)
        linear_acceleration = params.get('linear_acceleration')
        
        if distance is not None and time is not None and time != 0:
            velocity = distance / time
            explanation = f"Calculated using v = d/t\nv = {distance} m / {time} s = {velocity} m/s"
            return f"{velocity} m/s", explanation
        elif initial_velocity is not None and linear_acceleration is not None and time is not None:
            velocity = initial_velocity + (linear_acceleration * time)
            explanation = f"Calculated using v = u + at\nv = {initial_velocity} m/s + ({linear_acceleration} m/s² × {time} s) = {velocity} m/s"
            return f"{velocity} m/s", explanation
        else:
            return None, "Insufficient parameters for velocity calculation. Need either (distance and time) or (initial velocity, acceleration, and time)."
    
    def _calculate_acceleration(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate acceleration using a = Δv/Δt or a = F/m
        """
        initial_velocity = params.get('initial_velocity', 0)
        final_velocity = params.get('final_velocity')
        time = params.get('time')
        force = params.get('force')
        mass = params.get('mass')
        
        if final_velocity is not None and initial_velocity is not None and time is not None and time != 0:
            acceleration = (final_velocity - initial_velocity) / time
            explanation = f"Calculated using a = Δv/Δt\na = ({final_velocity} m/s - {initial_velocity} m/s) / {time} s = {acceleration} m/s²"
            return f"{acceleration} m/s²", explanation
        elif force is not None and mass is not None and mass != 0:
            acceleration = force / mass
            explanation = f"Calculated using a = F/m (Newton's second law)\na = {force} N / {mass} kg = {acceleration} m/s²"
            return f"{acceleration} m/s²", explanation
        else:
            return None, "Insufficient parameters for acceleration calculation. Need either (velocity change and time) or (force and mass)."
    
    def _calculate_kinematics(self, params: Dict[str, Any]) -> tuple:
        """
        Perform kinematic calculations (position, velocity, acceleration)
        """
        initial_position = params.get('initial_position', 0)
        initial_velocity = params.get('initial_velocity', 0)
        acceleration = params.get('linear_acceleration', 0)
        time = params.get('time')
        
        if time is not None:
            # Using kinematic equation: s = ut + (1/2)at²
            displacement = (initial_velocity * time) + (0.5 * acceleration * time * time)
            final_position = initial_position + displacement
            
            # Calculate final velocity: v = u + at
            final_velocity = initial_velocity + (acceleration * time)
            
            explanation = f"Kinematic calculations:\n"
            explanation += f"Initial position: {initial_position} m\n"
            explanation += f"Initial velocity: {initial_velocity} m/s\n"
            explanation += f"Acceleration: {acceleration} m/s²\n"
            explanation += f"Time: {time} s\n"
            explanation += f"Displacement: {displacement} m\n"
            explanation += f"Final position: {final_position} m\n"
            explanation += f"Final velocity: {final_velocity} m/s"
            
            result = f"Position: {final_position:.2f} m, Velocity: {final_velocity:.2f} m/s"
            return result, explanation
        else:
            return None, "Insufficient parameters for kinematic calculation. Need time."
    
    def _calculate_dynamics(self, params: Dict[str, Any]) -> tuple:
        """
        Perform basic dynamic calculations (involving forces and motion)
        """
        # For now, we'll implement a basic dynamic calculation
        # Calculate net force and resulting acceleration
        mass = params.get('mass')
        force = params.get('force')
        
        if mass is not None and force is not None and mass != 0:
            acceleration = force / mass
            momentum = mass * (params.get('linear_velocity', 0) or 0)
            
            explanation = f"Dynamics calculation:\n"
            explanation += f"Mass: {mass} kg\n"
            explanation += f"Force: {force} N\n"
            explanation += f"Acceleration: {acceleration} m/s²\n"
            explanation += f"Momentum: {momentum} kg⋅m/s"
            
            result = f"Acceleration: {acceleration:.2f} m/s², Momentum: {momentum:.2f} kg⋅m/s"
            return result, explanation
        else:
            return None, "Insufficient parameters for dynamic calculation. Need mass and force."
    
    def _calculate_power(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate power using P = F*v or P = W/t or P = τ*ω
        """
        force = params.get('force')
        linear_velocity = params.get('linear_velocity')
        work = params.get('work')
        time = params.get('time')
        torque = params.get('torque')
        angular_velocity = params.get('angular_velocity')
        
        if force is not None and linear_velocity is not None:
            power = force * linear_velocity
            explanation = f"Calculated using P = F × v\nP = {force} N × {linear_velocity} m/s = {power} W"
            return f"{power} W", explanation
        elif work is not None and time is not None and time != 0:
            power = work / time
            explanation = f"Calculated using P = W/t\nP = {work} J / {time} s = {power} W"
            return f"{power} W", explanation
        elif torque is not None and angular_velocity is not None:
            power = torque * angular_velocity
            explanation = f"Calculated using P = τ × ω\nP = {torque} N⋅m × {angular_velocity} rad/s = {power} W"
            return f"{power} W", explanation
        else:
            return None, "Insufficient parameters for power calculation. Need either (force and velocity), (work and time), or (torque and angular velocity)."
    
    def _calculate_energy(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate energy (kinetic, potential, etc.)
        """
        mass = params.get('mass')
        velocity = params.get('linear_velocity', 0)
        height = params.get('height')
        gravity = params.get('gravity', 9.81)  # default Earth gravity
        
        results = []
        explanations = []
        
        # Kinetic energy: KE = 0.5 * m * v²
        if mass is not None and velocity is not None:
            kinetic_energy = 0.5 * mass * velocity * velocity
            results.append(f"KE: {kinetic_energy:.2f} J")
            explanations.append(f"Kinetic energy: KE = ½mv² = 0.5 × {mass} kg × ({velocity} m/s)² = {kinetic_energy:.2f} J")
        
        # Potential energy: PE = m * g * h
        if mass is not None and height is not None:
            potential_energy = mass * gravity * height
            results.append(f"PE: {potential_energy:.2f} J")
            explanations.append(f"Potential energy: PE = mgh = {mass} kg × {gravity} m/s² × {height} m = {potential_energy:.2f} J")
        
        if results:
            result = ", ".join(results)
            explanation = "\n".join(explanations)
            return result, explanation
        else:
            return None, "Insufficient parameters for energy calculation. Need mass and either velocity (for KE) or height (for PE)."
    
    def _calculate_momentum(self, params: Dict[str, Any]) -> tuple:
        """
        Calculate momentum using p = m * v
        """
        mass = params.get('mass')
        linear_velocity = params.get('linear_velocity')
        
        if mass is not None and linear_velocity is not None:
            momentum = mass * linear_velocity
            explanation = f"Calculated using p = m × v\np = {mass} kg × {linear_velocity} m/s = {momentum} kg⋅m/s"
            return f"{momentum} kg⋅m/s", explanation
        else:
            return None, "Insufficient parameters for momentum calculation. Need mass and velocity."


# For testing purposes
if __name__ == "__main__":
    import asyncio
    
    async def test_agent():
        agent = PerformRoboticsCalculationAgent()
        
        # Test torque calculation
        context = {
            "calculation_type": "torque",
            "parameters": {
                "force": 10,
                "distance": 0.5
            }
        }
        response = await agent.execute("Calculate torque", context)
        print(f"Success: {response.success}")
        print(f"Result: {response.result}")
        print(f"Error: {response.error}")
    
    # Run the test
    asyncio.run(test_agent())