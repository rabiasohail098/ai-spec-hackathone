// src/components/BookRagChatbot.tsx
import React, { useState, useEffect, useRef } from 'react';

// Function to extract text content from markdown
const extractTextFromMarkdown = (markdown: string): string => {
  // Remove markdown formatting like headers, links, etc.
  return markdown
    .replace(/#{1,6}\s*(.*?)(?=\n|$)/g, '$1 ') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
    .replace(/`(.*?)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/^-{3,}\s*$/gm, '') // Horizontal rules
    .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double
    .trim();
};

// Mock data representing the book content - in a real app, this would come from the docs
const BOOK_CONTENT = [
  {
    id: 1,
    title: 'Introduction to Physical AI',
    content: `Physical AI refers to artificial intelligence systems that can perceive, reason about, and interact with the physical world, bridging the gap between digital intelligence and physical embodiment. Physical AI differs from Digital AI as it focuses on AI systems that function in the physical world, interact with objects, understand physical laws, and operate in three-dimensional space.

The concept of Embodied Intelligence includes:
1. Embodiment: Intelligence emerges from an agent's interaction with its environment
2. Morphological Computation: The body's structure contributes to intelligent behavior
3. Environment Coupling: Behavior emerges from the tight interaction between the agent and its environment.`,
    section: 'Chapter 1: Introduction to Robotics'
  },
  {
    id: 2,
    title: 'Robotic Operating Systems',
    content: `The Robot Operating System (ROS) is not actually an operating system but rather a flexible framework for writing robot software. It is a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robotic platforms.

ROS Architecture includes:
- Nodes: Processes that perform computation
- Topics: Named buses over which nodes exchange messages
- Services: Provide a request/reply communication pattern
- Parameters: Store data in a central location that all nodes can access

ROS 2 vs ROS 1 differences:
- Middleware: ROS 2 uses DDS (Data Distribution Service) as its underlying middleware
- Quality of Service (QoS): ROS 2 supports configurable QoS policies
- Lifecycle Management: ROS 2 provides better lifecycle management for nodes
- Security: ROS 2 includes security features not available in ROS 1
- Real-time Support: ROS 2 has improved real-time support`,
    section: 'Chapter 2: Robotic Operating Systems'
  },
  {
    id: 3,
    title: 'Sensors and Actuators',
    content: `Sensors and actuators form the sensory and motor systems of a robot, enabling it to perceive its environment and interact with it. Sensors serve as the equivalent of human sensory organs, providing information about the internal state of the robot and its external environment.

Sensor classification:
- Proprioceptive Sensors: Measure internal states of the robot (encoders, IMUs, force/torque sensors)
- Exteroceptive Sensors: Measure external environment properties (range sensors, vision sensors, tactile sensors, auditory sensors)

Common sensor types include:
- Range Sensors: Ultrasonic, Infrared, LiDAR
- Vision Sensors: Monocular, Stereo, RGB-D cameras
- Inertial Sensors: Accelerometers, gyroscopes, magnetometers

Actuators convert control signals into physical motion. They are the "muscles" of a robot, enabling movement and manipulation of objects.`,
    section: 'Chapter 3: Understanding Sensors and Actuators'
  },
  {
    id: 4,
    title: 'Digital Twins',
    content: `A digital twin is a virtual representation of a physical object or system that spans its lifecycle, is updated with real-time data, and uses simulation, machine learning, and reasoning to help decision-making.

In robotics, digital twins enable:
- Virtual testing and validation of robotic systems before physical deployment
- Simulation of complex environments and scenarios
- Testing of control algorithms in safe virtual environments
- Visualization and analysis of robot performance`,
    section: 'Chapter 4: Introduction to Digital Twins'
  },
  {
    id: 5,
    title: 'Simulation Environments',
    content: `Simulation environments in robotics serve as safe, cost-effective platforms for developing, testing, and validating robotic systems before real-world deployment. These environments allow for rapid prototyping and experimentation without physical hardware limitations.

Popular simulation platforms include:
- Gazebo: Physics-based simulation environment
- Unity: 3D development platform that can simulate robotics environments
- RViz: Visualization tool for displaying robot models and sensor data

Simulation benefits:
- Cost reduction in development
- Risk mitigation before physical implementation
- Testing scenarios difficult to reproduce in real life`,
    section: 'Chapter 5: Simulation Environments'
  },
  {
    id: 6,
    title: 'Physics Modeling and Rendering',
    content: `Physics modeling and rendering in robotics simulation involves creating accurate representations of physical properties and visual characteristics of robots and environments.

Physics modeling aspects:
- Rigid body dynamics
- Collision detection
- Joint constraints
- Material properties

Rendering techniques:
- Realistic lighting
- Texturing
- Shaders
- Visual effects
`,
    section: 'Chapter 6: Physics Modeling and Rendering'
  },
  {
    id: 7,
    title: 'AI for Robotics',
    content: `Artificial Intelligence in robotics combines machine learning, computer vision, natural language processing, and other AI techniques to enable robots to perform complex tasks autonomously. AI enables robots to perceive, reason, plan, and adapt to dynamic environments.

Key AI techniques for robotics:
- Machine Learning for pattern recognition and adaptive behavior
- Computer Vision for object recognition and scene understanding
- Path Planning and Navigation for autonomous mobility
- Reinforcement Learning for decision making in dynamic environments

The integration of AI and robotics enables:
- Autonomous operation in unstructured environments
- Learning from experience and improving performance
- Natural interaction with humans`,
    section: 'Chapter 7: AI for Robotics'
  },
  {
    id: 8,
    title: 'Computer Vision and Navigation',
    content: `Computer vision in robotics involves processing and analyzing visual information to enable robots to understand and interact with their environment. Navigation systems allow robots to move autonomously from one location to another.

Computer Vision applications in robotics:
- Object detection and recognition
- Simultaneous Localization and Mapping (SLAM)
- Human-robot interaction through visual cues
- Quality inspection and measurement

Navigation components:
- Global path planning
- Local obstacle avoidance
- Localization in known/unknown environments`,
    section: 'Chapter 8: Computer Vision and Navigation'
  },
  {
    id: 9,
    title: 'Cognitive Planning Systems',
    content: `Cognitive planning systems in robotics involve the development of sophisticated algorithms that enable robots to reason about their environment, make decisions, and plan complex sequences of actions.

Planning approaches:
- Hierarchical Task Networks (HTNs)
- Partial Order Planners
- Graph-based planners
- Learning-based planners

Cognitive aspects of planning:
- Working with uncertainty
- Multi-objective optimization
- Resource management
- Temporal reasoning
`,
    section: 'Chapter 9: Cognitive Planning Systems'
  },
  {
    id: 10,
    title: 'Voice and Language Integration',
    content: `Voice and language integration in robotics involves enabling robots to understand natural human language and respond appropriately. This includes both speech recognition and natural language processing capabilities.

Key components:
- Automatic Speech Recognition (ASR)
- Natural Language Understanding (NLU)
- Natural Language Generation (NLG)
- Text-to-Speech (TTS)

Challenges in voice integration:
- Noise reduction
- Speaker identification
- Context understanding
- Multilingual support
`,
    section: 'Chapter 10: Voice and Language Integration'
  },
  {
    id: 11,
    title: 'Real-World Applications',
    content: `Real-world applications of robotics span numerous industries and use cases. The deployment of robots in actual environments requires consideration of safety, reliability, and human-robot interaction.

Application domains:
- Manufacturing and assembly
- Healthcare and surgery
- Space exploration
- Underwater exploration
- Military and defense
- Entertainment
- Agriculture
- Logistics and warehousing

Implementation considerations:
- Environmental robustness
- Safety standards
- Maintenance requirements
- Human-robot collaboration`,
    section: 'Chapter 11: Real-World Applications'
  },
  {
    id: 12,
    title: 'Capstone Project',
    content: `The capstone project integrates all concepts covered throughout the book, challenging you to design and implement a sophisticated robotic system. The project combines robotics fundamentals, AI techniques, computer vision, navigation, cognitive planning, and real-world applications into a comprehensive solution.

Project requirements include:
- Simultaneous Localization and Mapping (SLAM) in unknown environments
- Path planning and obstacle avoidance
- Real-time object detection and recognition
- Human interaction through natural language
- Multi-modal interaction capabilities

The system architecture consists of:
- Perception Module: Processing sensor data
- Cognitive Planning Module: Decision making
- Action Execution Module: Controlling the robot`,
    section: 'Chapter 12: Capstone Project'
  }
];

// Process book content to make it searchable
const PROCESSED_CONTENT = BOOK_CONTENT.map(doc => ({
  ...doc,
  searchable: extractTextFromMarkdown(`${doc.title} ${doc.section} ${doc.content}`).toLowerCase()
}));

const findRelevantContent = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  const results: string[] = [];
  const exactMatches: string[] = [];
  const partialMatches: string[] = [];

  // First, find exact matches (title or section matches)
  PROCESSED_CONTENT.forEach(doc => {
    if (doc.section.toLowerCase().includes(lowerQuery) || 
        doc.title.toLowerCase().includes(lowerQuery)) {
      exactMatches.push(`**${doc.section} - ${doc.title}**\n\n${doc.content}`);
    }
  });

  // Then, find partial matches in content
  PROCESSED_CONTENT.forEach(doc => {
    if (!exactMatches.some(match => match.includes(doc.title))) {
      // Count how many query terms appear in the document
      const terms = lowerQuery.split(/\s+/);
      let termCount = 0;
      
      terms.forEach(term => {
        if (doc.searchable.includes(term)) {
          termCount++;
        }
      });
      
      // Only add if at least one term is found
      if (termCount > 0) {
        partialMatches.push({
          content: `**${doc.section} - ${doc.title}**\n\n${doc.content}`,
          termCount
        });
      }
    }
  });

  // Sort partial matches by relevance (number of terms matched)
  partialMatches.sort((a, b) => b.termCount - a.termCount);

  // Combine results (exact matches first, then ranked partial matches)
  results.push(...exactMatches);
  results.push(...partialMatches.map(item => item.content));
  
  // If no results found, return general information
  if (results.length === 0) {
    return [
      `I couldn't find specific information about "${query}" in the book content. The Physical AI & Humanoid Robotics book covers topics like robotic operating systems, sensors and actuators, digital twins, simulation environments, AI for robotics, computer vision, navigation, cognitive planning, voice integration, real-world applications, and the capstone project. Please try rephrasing your question.`
    ];
  }

  // Limit to top 3 results to avoid overwhelming the user
  return results.slice(0, 3);
};

const generateResponse = (query: string, context: string[]): string => {
  // If we have specific context that matches the query well
  if (context.length > 0) {
    // Use the most relevant content as the primary response
    const responseParts = [
      `Based on the book content, here's information about "${query}":\n\n${context[0]}`
    ];

    // If there are additional related results, add them
    if (context.length > 1) {
      responseParts.push("\nRelated information:");
      for (let i = 1; i < context.length; i++) {
        responseParts.push(`\n${context[i]}`);
      }
    }

    responseParts.push("\nIf you need more specific information about this topic, please let me know!");
    return responseParts.join('');
  } else {
    return `I couldn't find relevant information about "${query}" in the book. The book covers topics like robotic operating systems, sensors and actuators, digital twins, simulation environments, AI for robotics, computer vision, navigation, cognitive planning, voice integration, real-world applications, and the capstone project. Please try rephrasing your question.`;
  }
};

const BookRagChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { text: 'Hello! I\'m your Physical AI & Humanoid Robotics assistant. I have access to the full book content. Ask me anything about robotics, AI, digital twins, sensors, actuators, ROS, navigation, computer vision, or any other topic from the book!', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if we're in the browser (client-side) and determine auth status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is authenticated by checking localStorage
      const savedUser = localStorage.getItem('user');
      setIsAuthenticated(!!savedUser);
      setHasLoaded(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || !isAuthenticated) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const newMessages = [...messages, { text: userMessage, isUser: true }];
    setMessages(newMessages);
    setIsLoading(true);

    // Simulate RAG processing
    setTimeout(() => {
      const relevantContent = findRelevantContent(userMessage);
      const response = generateResponse(userMessage, relevantContent);
      
      // Add bot response
      setMessages(prev => [...prev, { text: response, isUser: false }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="chatbot-widget" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <div className="chatbot-button" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25c2a0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }} onClick={() => alert('Please sign in to use the RAG chatbot')}>
          <span>🤖</span>
        </div>
      </div>
    );
  }

  // Only render the full chat interface if auth state has been determined
  if (!hasLoaded) {
    // Return a placeholder while checking auth status
    return (
      <div className="chatbot-widget" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <div className="chatbot-button" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#25c2a0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <span>🤖</span>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-widget" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {isOpen ? (
        <div className="chatbot-container" style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div className="chatbot-header" style={{
            backgroundColor: '#25c2a0',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Book RAG Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          
          <div className="chatbot-messages" style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.isUser ? '#25c2a0' : '#e9ecef',
                  color: msg.isUser ? 'white' : '#333',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  maxWidth: '80%',
                  wordWrap: 'break-word'
                }}
              >
                {msg.text.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
            {isLoading && (
              <div 
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#e9ecef',
                  color: '#333',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  maxWidth: '80%'
                }}
              >
                Processing your question and searching book content...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input" style={{
            padding: '10px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex'
          }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the book content..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                resize: 'none',
                height: '50px',
                maxHeight: '100px'
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || inputValue.trim() === ''}
              style={{
                marginLeft: '10px',
                padding: '10px 15px',
                backgroundColor: inputValue.trim() === '' || isLoading ? '#cccccc' : '#25c2a0',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: inputValue.trim() === '' || isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="chatbot-button" 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#25c2a0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onClick={() => setIsOpen(true)}
        >
          <span>🤖</span>
        </div>
      )}
    </div>
  );
};

export default BookRagChatbot;