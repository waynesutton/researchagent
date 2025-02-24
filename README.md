# AI Company Research Agent

A powerful AI-powered research tool that provides comprehensive company analysis and insights.

## Features

### Real-time Research

- 🔍 Instant company research using multiple AI models (GPT-4, Claude, Mistral, Grok)
- 📊 Structured analysis with consistent formatting
- 🔄 Real-time streaming responses
- ⏹️ Ability to cancel ongoing research
- 🌐 Web data fetching and validation

### Comprehensive Analysis

- 🏢 Company Overview (industry, founding, location)
- 💼 Business Analysis (funding, products, market position)
- 👥 Key People (leadership and founders)
- 📈 Recent Developments
- 🌎 Verified Links & Sources
- ⭐ Key Highlights
- 🔍 Vector-based similarity search

### Data Management

- 📝 Save and organize research results
- 🔍 Full-width results table with collapsible view
- 📋 One-click copy of research content
- ✏️ Add custom notes to research entries
- 🗑️ Delete outdated research entries
- 🔄 Real-time updates across sessions

### User Interface

- 🎨 Clean, modern black and white design
- 📱 Responsive layout with Tailwind CSS
- 💫 Smooth animations and transitions
- ⚡ Real-time updates with Convex
- 🚫 Research cancellation support
- 📝 Markdown formatting support
- 🎯 Modal views for detailed research

### Technical Features

- 🔒 Built with Convex for real-time data sync
- 🤖 Multi-model AI integration (GPT-4, Claude, Mistral, Grok)
- 📊 Vector embeddings for research storage
- 🔄 Automatic source validation
- 🏷️ Metadata extraction and storage
- 🔍 Full-text search capabilities
- 🔐 Type-safe database queries

## Built With

- [Next.js 14](https://nextjs.org/) - React framework
- [Convex](https://www.convex.dev/) - Backend and real-time sync
- [OpenAI GPT-4](https://openai.com/) - Primary AI model
- [Anthropic Claude](https://www.anthropic.com/) - Secondary AI model
- [Mistral AI](https://mistral.ai/) - Additional AI model
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Lucide React](https://lucide.dev/) - Icons

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

# Codebase Structure

## Frontend (src/)

### Components

- `ResearchInterface.tsx`: Main chat interface component with message handling and display
- `chat/Message.tsx`: Message components (System, User, Assistant) with styling
- `chat/ChatInput.tsx`: Chat input component with submit handling
- `providers/convex-client-provider.tsx`: Convex client configuration and provider

### App

- `app/page.tsx`: Main page component with layout and background
- `app/layout.tsx`: Root layout with providers and metadata
- `app/globals.css`: Global styles and Tailwind configuration

## Backend (convex/)

### Core

- `schema.ts`: Database schema definition for conversations, messages, and research
- `research.ts`: Research functionality with OpenAI integration and vector search
- `messages.ts`: Message handling and storage logic
- `conversations.ts`: Conversation management

## Configuration

- `next.config.mjs`: Next.js configuration with Convex setup
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts
- `.env.local`: Environment variables

## Documentation

- `features.md`: Feature documentation and changelog
- `promptlog.md`: System prompts and their evolution

## Key Features by File

1. `ResearchInterface.tsx`:

   - Chat UI management
   - Message display
   - Auto-scrolling
   - Conversation handling

2. `research.ts`:

   - OpenAI integration
   - Company research logic
   - Vector embeddings
   - Source validation

3. `schema.ts`:

   - Database structure
   - Table relationships
   - Indexing configuration
   - Type definitions

4. `Message.tsx`:
   - Message styling
   - Source display
   - Formatting components
   - Icon integration

## Deployment

The application is deployed on Netlify with automatic deployments from the main branch. Environment variables are managed through Netlify's environment configuration.

[![Netlify Status](https://api.netlify.com/api/v1/badges/61515d34-cbb9-4933-ba64-b3eb60b436ea/deploy-status)](https://app.netlify.com/sites/researchagent/deploys)
