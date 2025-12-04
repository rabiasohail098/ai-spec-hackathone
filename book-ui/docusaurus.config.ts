import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Physical AI & Humanoid Robotics",
  tagline: "A Comprehensive Guide to Embodied Intelligence",
  favicon: "img/favicon.ico",

  // --- GITHUB PAGES CONFIGURATION (IMPORTANT) ---

  // 1. URL: Yahan Netlify nahi, GitHub ka URL aayega
  url: "https://rabiasohail098.github.io",

  // 2. BaseUrl: Ye aapke Repository ka naam hona chahiye (slashes ke sath)
  // Agar repo ka naam 'ai-spec-hackathone' hai to ye sahi hai.
  baseUrl: "/ai-spec-hackathone/",

  // 3. Organization & Project Name
  organizationName: "rabiasohail098",
  projectName: "ai-spec-hackathone", // Make sure ye repo name se match kare

  // 4. Trailing Slash: GitHub Pages ke liye ise 'false' rakhna zaroori hai
  // Warna CSS/JS load nahi honge aur 404 error aayega.
  trailingSlash: false,

  // 5. Deployment Branch: Usually 'gh-pages' hoti hai
  deploymentBranch: "gh-pages",

  // 6. Error Handling: 'throw' ki jagah 'warn' karein taaki choti moti link broken hone par deploy na ruke
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // ----------------------------------------------

  future: {
    v4: true,
  },

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
          editUrl:
            "https://github.com/rabiasohail098/ai-spec-hackathone/tree/main/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          editUrl:
            "https://github.com/rabiasohail098/ai-spec-hackathone/tree/main/",
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
    // --- IMPORTANT NOTE FOR BACKEND ---
    // GitHub Pages par 'localhost:8000' kaam nahi karega.
    // Aapko apna Python Backend (FastAPI) kahin cloud pe deploy karna padega (jaise Render, Railway, AWS).
    // Filhal build hone ke liye hum ise aise hi rehne dete hain, par Live site par Chatbot/Login nahi chalega.
    mcp: {
      serverUrl:
        process.env.MCP_SERVER_URL ||
        (process.env.NODE_ENV === "production"
          ? `${window.location.origin}` // For GitHub Pages deployment
          : "http://localhost:8000"),
      apiKey: process.env.MCP_API_KEY,
      contextSources: [
        {
          type: "book-content",
          path: "/docs",
          format: "mdx",
        },
      ],
    },

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
        // ... (Baaki items same rahenge)
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
          href: "https://github.com/rabiasohail098/ai-spec-hackathone",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        // ... (Footer links same rahenge)
        {
          title: "Book Resources",
          items: [
            {
              label: "Physical AI Fundamentals",
              to: "/docs/chapter-1/introduction-to-physical-ai",
            },
          ],
        },
        // ... (Add other footer items as needed)
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
