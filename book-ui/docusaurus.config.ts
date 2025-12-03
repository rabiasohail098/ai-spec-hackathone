import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Physical AI & Humanoid Robotics",
  tagline: "A Comprehensive Guide to Embodied Intelligence",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://physical-ai-humanoid-robotics-book.netlify.app",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: "rabiasohail098", // Updated to your username
  // projectName: "ai-spec-kit-book", // Updated to your repo name

  // onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          editUrl:
            "https://github.com/rabiasohail098/ai-spec-kit-book/tree/main/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          editUrl:
            "https://github.com/rabiasohail098/ai-spec-kit-book/tree/main/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // --- MCP Server Configuration (Added Here) ---
    // Updated to local backend server
    mcp: {
      serverUrl: "http://localhost:8000",
      apiKey: process.env.MCP_API_KEY,
      contextSources: [
        {
          type: "book-content",
          path: "/docs",
          format: "mdx",
        },
      ],
    },
    // ---------------------------------------------

    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Physical AI & Humanoid Robotics",
      logo: {
        alt: "Physical AI & Humanoid Robotics Book",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Docs",
        },
        {
          to: "/signin",
          label: "Sign In",
          position: "right",
        },
        {
          to: "/signup",
          label: "Sign Up",
          position: "right",
        },
        {
          to: "/profile",
          label: "Profile",
          position: "right",
        },
        {
          href: "https://github.com/rabiasohail098/ai-spec-kit-book",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Book Resources",
          items: [
            {
              label: "Physical AI Fundamentals",
              to: "/docs/chapter-1/introduction-to-physical-ai",
            },
            {
              label: "AI for Robotics",
              to: "/docs/chapter-4/ai-robot-brain-isaac",
            },
            {
              label: "Vision-Language-Action Systems",
              to: "/docs/chapter-5/vision-language-action",
            },
            {
              label: "Capstone Project",
              to: "/docs/chapter-6/autonomous-humanoid-capstone",
            },
          ],
        },
        {
          title: "Quick Links",
          items: [
            {
              label: "Home",
              to: "/",
            },

            {
              label: "About Physical AI",
              to: "/docs/chapter-1/introduction-to-physical-ai",
            },
            {
              label: "RAG Chatbot",
              to: "/", // Chatbot is on homepage
            },
            {
              label: "GitHub",
              href: "https://github.com/rabiasohail098/ai-spec-kit-book",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "Physical AI Community",
              href: "https://panaversity.org",
            },
            {
              label: "GitHub Repository",
              href: "https://github.com/rabiasohail098/ai-spec-kit-book",
            },
            {
              label: "Open Source Contributions",
              href: "https://github.com/panaversity",
            },

            {
              label: "Learn Physical AI",
              href: "https://panaversity.org",
            },
          ],
        },
        {
          title: "Connect",
          items: [
            {
              label: "Twitter/X",
              href: "https://x.com/rabiasohail1209",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/rabia-sohail-684740278/",
            },

            {
              label: "Sign In",
              to: "/signin",
            },
            {
              label: "Sign Up",
              to: "/signup",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
