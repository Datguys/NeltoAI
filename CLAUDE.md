# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based startup platform called "Founder Launch Platform" that helps entrepreneurs build and manage their startup ideas. It's a Progressive Web App (PWA) built with Vite, TypeScript, React, shadcn-ui, and Tailwind CSS.

The application provides AI-powered tools for:
- Idea generation and validation
- Bill of Materials (BOM) creation
- Budget planning
- Timeline management
- Project tracking
- Deep analysis reports
- Affiliate program management

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI (interactive)
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Architecture

### Routing Structure
The app uses a dual-routing system:
- `main.tsx` splits routes between dashboard (`/dashboard/*`) and main app (`/*`)
- `AppDashboard.tsx` handles dashboard-specific routing
- `AppMain.tsx` (which includes `App.tsx`) handles public pages and authentication

### Key Directories
- `src/components/dashboard/` - Dashboard-specific components including features like BOM, Budget, Timeline
- `src/components/ui/` - shadcn-ui components
- `src/lib/` - Core utilities including AI integration, Firebase operations, Stripe integration
- `src/hooks/` - Custom React hooks for credits, authentication, onboarding
- `src/pages/` - Route components

### AI Integration
The platform uses OpenRouter and Groq APIs for AI features:
- Tiered model access (Free: DeepSeek R1, Pro: Gemini 2.0, Ultra: Gemini 2.5)
- Token-based usage tracking stored in localStorage
- Automatic fallback between AI models
- Key files: `src/lib/ai.ts`, `src/lib/openrouter.ts`

### Firebase Integration
- Authentication with Google and Microsoft providers
- Firestore for project data and user management
- Configuration via environment variables (VITE_FIREBASE_*)

### State Management
- React Query for API state management
- Context providers for templates and shared state
- localStorage for user credits and tier information

### Styling
- Tailwind CSS with custom configurations
- shadcn-ui component library
- Custom CSS files: `App.css`, `Database.css`
- Dark theme support via next-themes

## Environment Variables Required
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_OPENROUTER_API_KEY
VITE_GROQ_API_KEY
```

## Testing Framework
- **Vitest** as the test runner (compatible with Vite)
- **React Testing Library** for component testing
- **jsdom** for DOM simulation in tests
- Custom test utilities with provider wrappers
- Comprehensive test coverage for:
  - AI functionality and token management
  - Component interactions and user flows
  - Integration tests for cross-feature workflows
  - Error handling and edge cases

### Test Organization
- Unit tests: `src/lib/__tests__/` and `src/hooks/__tests__/`
- Component tests: `src/components/**/__tests__/`
- Integration tests: `src/test/integration/`
- Test utilities: `src/test/test-utils.tsx`
- Test setup: `src/test/setup.ts`

### Running Tests
- `npm run test` - Interactive test runner
- `npm run test:run` - Single test run (CI mode)
- `npm run test:coverage` - Generate coverage report
- `npm run test:ui` - Visual test interface

## TypeScript Configuration
- Relaxed TypeScript settings with `noImplicitAny: false` and `strictNullChecks: false`
- Path aliases configured: `@/*` maps to `./src/*`
- ESLint configured with React hooks and TypeScript rules

## Important Notes
- The app is configured as a PWA with offline capabilities
- Uses Lovable platform for development workflow
- Vercel deployment ready with `vercel.json` configuration
- Comprehensive test suite with 95%+ coverage on core features