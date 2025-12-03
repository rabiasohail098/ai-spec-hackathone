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
      label: 'Physical AI & Humanoid Robotics',
      collapsed: false,
      items: [
        'index',
        {
          type: 'category',
          label: 'Part I: Foundations',
          collapsed: false,
          items: [
            'chapter-1/introduction-to-physical-ai',
            'chapter-2/ros2-fundamentals',
            'chapter-3/digital-twin-simulation'
          ]
        },
        {
          type: 'category',
          label: 'Part II: AI-Robot Integration',
          collapsed: false,
          items: [
            'chapter-4/ai-robot-brain-isaac',
            'chapter-5/vision-language-action',
            'chapter-6/autonomous-humanoid-capstone'
          ]
        },
        {
          type: 'category',
          label: 'Part III: Advanced Topics',
          collapsed: false,
          items: [
            'chapter-7/ai-for-robotics',
            'chapter-8/computer-vision-navigation'
          ]
        }
      ]
    }
  ]
};

export default sidebars;
