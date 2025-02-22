# AI Company Research Agent

A powerful AI-powered research tool that provides comprehensive company analysis and insights.

## Features

### Real-time Research

- 🔍 Instant company research using GPT-4
- 📊 Structured analysis with consistent formatting
- 🔄 Real-time streaming responses
- ⏹️ Ability to cancel ongoing research

### Comprehensive Analysis

- 🏢 Company Overview (industry, founding, location)
- 💼 Business Analysis (funding, products, market position)
- 👥 Key People (leadership and founders)
- 📈 Recent Developments
- 🌎 Verified Links & Sources
- ⭐ Key Highlights

### Data Management

- 📝 Save and organize research results
- 🔍 Full-width results table
- 📋 One-click copy of research content
- ✏️ Add custom notes to research entries
- 🗑️ Delete outdated research entries

### User Interface

- 🎨 Clean, modern design
- 📱 Responsive layout
- 💫 Smooth animations
- ⚡ Real-time updates
- 🚫 Research cancellation support

### Technical Features

- 🔒 Built with Convex for real-time data sync
- 🤖 OpenAI GPT-4 integration
- 📊 Vector embeddings for research storage
- 🔄 Automatic source validation
- 🏷️ Metadata extraction and storage

## Built With

- [Next.js](https://nextjs.org/)
- [Convex](https://www.convex.dev/)
- [OpenAI](https://openai.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

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

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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

[![Netlify Status](https://api.netlify.com/api/v1/badges/61515d34-cbb9-4933-ba64-b3eb60b436ea/deploy-status)](https://app.netlify.com/sites/researchagent/deploys)
