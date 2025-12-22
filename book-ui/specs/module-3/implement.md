# Module 3: Implementation Guide

## Step 1: Install Dependencies

```bash
pip install openai-whisper speechrecognition spacy networkx
python -m spacy download en_core_web_sm
```

## Step 2: Voice Command Processor

```python
# voice_processor.py
import whisper
import speech_recognition as sr

class VoiceCommandProcessor:
    def __init__(self):
        self.model = whisper.load_model("base")
        self.recognizer = sr.Recognizer()
        self.mic = sr.Microphone()

    def listen_and_transcribe(self):
        with self.mic as source:
            self.recognizer.adjust_for_ambient_noise(source)
            audio = self.recognizer.listen(source)

        # Save and transcribe
        with open("temp.wav", "wb") as f:
            f.write(audio.get_wav_data())

        result = self.model.transcribe("temp.wav")
        return result["text"]

    def process_command(self, text):
        return {
            'raw_text': text,
            'intent': self.analyze_intent(text),
            'objects': self.extract_objects(text),
            'actions': self.extract_actions(text)
        }

    def analyze_intent(self, text):
        text_lower = text.lower()
        if any(w in text_lower for w in ['pick', 'grab', 'take']):
            return 'manipulation'
        elif any(w in text_lower for w in ['go', 'move', 'navigate']):
            return 'navigation'
        return 'unknown'
```

## Step 3: NLU Pipeline

```python
# nlu_pipeline.py
import spacy
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ParsedCommand:
    action: str
    target_objects: List[str]
    target_location: Optional[str]

class NLUPipeline:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def parse(self, command: str) -> ParsedCommand:
        doc = self.nlp(command)

        action = None
        for token in doc:
            if token.pos_ == "VERB" and token.dep_ == "ROOT":
                action = token.lemma_
                break

        objects = [t.text for t in doc if t.pos_ == "NOUN" and t.dep_ == "dobj"]
        location = None
        for token in doc:
            if token.pos_ == "ADP":
                for child in token.children:
                    if child.pos_ == "NOUN":
                        location = f"{token.text} {child.text}"

        return ParsedCommand(action=action, target_objects=objects, target_location=location)
```

## Step 4: Cognitive Planner

```python
# cognitive_planner.py
import networkx as nx
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class Task:
    id: str
    type: str
    description: str
    dependencies: List[str]
    parameters: Dict

class CognitivePlanner:
    def __init__(self):
        self.task_graph = nx.DiGraph()

    def plan_from_command(self, parsed_command):
        tasks = self.decompose(parsed_command)

        for task in tasks:
            self.task_graph.add_node(task.id, task=task)
            for dep in task.dependencies:
                self.task_graph.add_edge(dep, task.id)

        ordered = list(nx.topological_sort(self.task_graph))
        return [self.task_graph.nodes[t]['task'] for t in ordered]

    def decompose(self, cmd):
        tasks = []
        if cmd.action == 'pick':
            tasks.append(Task('detect', 'perception', 'Detect object', [], {'object': cmd.target_objects[0]}))
            tasks.append(Task('approach', 'navigation', 'Approach object', ['detect'], {}))
            tasks.append(Task('grasp', 'manipulation', 'Grasp object', ['approach'], {}))
        return tasks
```

## Step 5: VLA ROS 2 Node

```python
# vla_node.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist

class VLANode(Node):
    def __init__(self):
        super().__init__('vla_node')
        self.voice_sub = self.create_subscription(String, 'voice_command', self.voice_callback, 10)
        self.cmd_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        self.voice_processor = VoiceCommandProcessor()
        self.nlu = NLUPipeline()
        self.planner = CognitivePlanner()

    def voice_callback(self, msg):
        command = msg.data
        parsed = self.nlu.parse(command)
        tasks = self.planner.plan_from_command(parsed)

        for task in tasks:
            self.execute_task(task)

    def execute_task(self, task):
        self.get_logger().info(f'Executing: {task.description}')
        # Execute based on task type

def main():
    rclpy.init()
    node = VLANode()
    rclpy.spin(node)
    rclpy.shutdown()
```

## Step 6: Full System Launch

```python
# launch/capstone.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='humanoid_pkg', executable='vla_node', output='screen'),
        Node(package='humanoid_pkg', executable='perception_node', output='screen'),
        Node(package='humanoid_pkg', executable='navigation_node', output='screen'),
        Node(package='humanoid_pkg', executable='manipulation_node', output='screen'),
    ])
```

## Step 7: Run Demo

```bash
# Terminal 1: Launch system
ros2 launch humanoid_pkg capstone.launch.py

# Terminal 2: Send voice command
ros2 topic pub /voice_command std_msgs/String "data: 'pick up the red cup'"
```

## Verification Checklist
- [ ] Voice commands transcribed correctly
- [ ] Intent recognized accurately
- [ ] Tasks planned in correct order
- [ ] Robot executes full pipeline
- [ ] System handles errors gracefully
