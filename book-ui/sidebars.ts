import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Physical AI & Humanoid Robotics',
      collapsed: false,
      items: [
        'index',
        {
          type: 'category',
          label: 'Module 1: The Robotic Nervous System (ROS 2)',
          collapsed: false,
          items: [
            'module-1/introduction-to-physical-ai',
            'module-1/ros2-fundamentals'
          ]
        },
        {
          type: 'category',
          label: 'Module 2: The Digital Twin (Gazebo & Unity)',
          collapsed: false,
          items: [
            'module-2/digital-twin-simulation',
            'module-2/ai-robot-brain-isaac'
          ]
        },
        {
          type: 'category',
          label: 'Module 3: Vision-Language-Action (VLA)',
          collapsed: false,
          items: [
            'module-3/vision-language-action',
            'module-3/autonomous-humanoid-capstone'
          ]
        },
        {
          type: 'category',
          label: 'Module 4: AI & Computer Vision',
          collapsed: false,
          items: [
            'module-4/ai-for-robotics',
            'module-4/computer-vision-navigation'
          ]
        }
      ]
    }
  ]
};

export default sidebars;
