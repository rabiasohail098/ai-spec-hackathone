import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction to Robotics, AI, and Digital Systems',
      collapsed: false,
      items: [
        'index',
        {
          type: 'category',
          label: 'Part I: Foundations',
          collapsed: false,
          items: [
            'chapter-1/introduction-to-robotics',
            'chapter-2/robotic-operating-systems',
            'chapter-3/sensors-actuators'
          ]
        },
        {
          type: 'category',
          label: 'Part II: Building Digital Twins',
          collapsed: false,
          items: [
            'chapter-4/introduction-digital-twins',
            'chapter-5/simulation-environments',
            'chapter-6/physics-modeling-rendering'
          ]
        },
        {
          type: 'category',
          label: 'Part III: AI and Cognitive Systems',
          collapsed: false,
          items: [
            'chapter-7/ai-for-robotics',
            'chapter-8/computer-vision-navigation',
            'chapter-9/cognitive-planning-systems'
          ]
        },
        {
          type: 'category',
          label: 'Part IV: Advanced Applications',
          collapsed: false,
          items: [
            'chapter-10/voice-language-integration',
            'chapter-11/real-world-applications',
            'chapter-12/capstone-project'
          ]
        }
      ]
    }
  ]
};

export default sidebars;
