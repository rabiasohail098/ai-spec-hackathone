import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A Comprehensive Guide to Embodied Intelligence',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://physical-ai-humanoid-robotics-book.netlify.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'panaversity', // Usually your GitHub org/user name.
  projectName: 'physical-ai-humanoid-robotics-book', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Humanoid Robotics',
      logo: {
        alt: 'Physical AI & Humanoid Robotics Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/panaversity/physical-ai-humanoid-robotics-book',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Book Contents',
          items: [
            {
              label: 'Chapter 1: Introduction to Robotics',
              to: '/docs/chapter-1/introduction-to-robotics',
            },
            {
              label: 'Chapter 2: Robotic Operating Systems',
              to: '/docs/chapter-2/robotic-operating-systems',
            },
            {
              label: 'Chapter 3: Sensors and Actuators',
              to: '/docs/chapter-3/sensors-actuators',
            },
            {
              label: 'Chapter 4: Digital Twins',
              to: '/docs/chapter-4/introduction-digital-twins',
            },
            {
              label: 'Chapter 5: Simulation Environments',
              to: '/docs/chapter-5/simulation-environments',
            },
            {
              label: 'Chapter 6: Physics Modeling and Rendering',
              to: '/docs/chapter-6/physics-modeling-rendering',
            },
            {
              label: 'Chapter 7: AI for Robotics',
              to: '/docs/chapter-7/ai-for-robotics',
            },
            {
              label: 'Chapter 8: Computer Vision and Navigation',
              to: '/docs/chapter-8/computer-vision-navigation',
            },
            {
              label: 'Chapter 9: Cognitive Planning Systems',
              to: '/docs/chapter-9/cognitive-planning-systems',
            },
            {
              label: 'Chapter 10: Voice and Language Integration',
              to: '/docs/chapter-10/voice-language-integration',
            },
            {
              label: 'Chapter 11: Real-World Applications',
              to: '/docs/chapter-11/real-world-applications',
            },
            {
              label: 'Chapter 12: Capstone Project',
              to: '/docs/chapter-12/capstone-project',
            },
          ],
        },
        {
          title: 'Quick Links',
          items: [
            {
              label: 'Home',
              to: '/',
            },
            {
              label: 'Documentation',
              to: '/docs/index',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Tutorials',
              to: '/docs/chapter-1/introduction-to-robotics',
            },
            {
              label: 'Examples',
              to: '/docs/chapter-11/real-world-applications',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Physical AI Community',
              href: 'https://panaversity.org',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/panaversity/physical-ai-humanoid-robotics-book',
            },
            {
              label: 'Open Source Contributions',
              href: 'https://github.com/panaversity',
            },
            {
              label: 'Docusaurus',
              href: 'https://docusaurus.io',
            },
            {
              label: 'Learn Physical AI',
              href: 'https://panaversity.org',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/panaversity/physical-ai-humanoid-robotics-book',
            },
            {
              label: 'Panaversity',
              href: 'https://panaversity.org',
            },
            {
              label: 'Twitter/X',
              href: 'https://twitter.com/panaversity',
            },
            {
              label: 'LinkedIn',
              href: 'https://linkedin.com/company/panaversity',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/panaversity',
            },
            {
              label: 'Sign In',
              to: '/signin',
            },
            {
              label: 'Sign Up',
              to: '/signup',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Panaversity Physical AI & Humanoid Robotics Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
