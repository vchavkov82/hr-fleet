# Technology Stack

**Analysis Date:** 2025-02-22

## Monorepo Overview

This is a full-stack monorepo with four independent deployable applications:
- **Backend API**: Go REST API (`backend/`, port 8080)
- **Jobs App**: Next.js job board (`app/jobs/`, port 3000)
- **HR App**: Next.js marketing/landing site (`app/hr/`, port 3001)
- **Admin Panel**: React + Vite admin interface (`admin/`, port 5173)

---

## Backend (Go API)

### Languages & Runtime

**Primary:**
- Go 1.25.7 - API backend

**Build & Runtime:**
- Alpine 3.20 - Container base image
- Multi-stage Docker build for minimal image size

### Core Framework

**API:**
- Chi v5.2.5 - HTTP router/multiplexer
- CORS middleware via github.com/go-chi/cors

**HTTP/Swagger:**
- Swaggo (http-swagger 1.3.4, swag 1.16.6) - OpenAPI/Swagger documentation

### Data & Persistence

**Database:**
- PostgreSQL 16 (Alpine image in compose)
- pgx v5.8.0 - PostgreSQL driver
- SQL migrations with up/down files (`backend/migrations/000001-000013`)

**Search:**
- Meilisearch v1.6 - Full-text search engine
- meilisearch-go v0.36.0 - Go client
- Two indices: `jobs` (job listings) and `candidates` (candidate profiles)

### Authentication & Security

**JWT:**
- golang-jwt/jwt v5.3.1 - JWT token generation/validation
- Configured via `JWT_SECRET` environment variable

**Cryptography:**
- golang.org/x/crypto v0.47.0 - Standard crypto utilities

### Web Scraping

**Headless Browser:**
- Chromedp v0.14.2 - Chrome DevTools Protocol client
- cdproto v0.0.0 - Chrome protocol definitions
- Browserless Chrome container (port 9222 internal → 3000)

**HTML Parsing:**
- goquery v1.11.0 - jQuery-like HTML parsing
- PuerkitoBio/goquery - CSS selectors

**Web Crawling:**
- robotstxt v1.1.2 - robots.txt parser

### AI & NLP

**Text Processing:**
- go-edlib v1.7.0 - Levenshtein distance for string similarity
- pdf v0.0.2 - PDF parsing for resumes

### Utilities

- uuid v1.6.0 - GUID generation
- slug v1.15.0 - URL-safe slug generation
- robotstxt v1.1.2 - robots.txt compliance

### Build & Development

**API Binary:**
- Single statically-linked executable: `/api` (no CGO)
- Built with `CGO_ENABLED=0` for Alpine Linux compatibility

---

## Jobs App (Next.js Job Board)

### Languages & Runtime

**Primary:**
- TypeScript 5.9.3 - Type safety
- JavaScript (JSX/TSX) - React components
- CSS (Tailwind) - Styling

**Runtime:**
- Node.js >=20.0.0 (pinned to 22.19.0 via Volta in `admin/`)
- Bun - Package manager & task runner

### Framework & Core

**Framework:**
- Next.js 14.2.35 - React meta-framework
- App Router - File-based routing
- React 18.3.1 - UI framework
- React DOM 18.3.1

### Authentication & Sessions

**NextAuth.js:**
- next-auth 5.0.0-beta.30 - Session management & OAuth
- @auth/prisma-adapter 2.11.1 - Prisma session persistence
- Providers: Credentials (email/password), Google OAuth

### Data Layer

**ORM:**
- Prisma 6.19.2 - Database ORM
- @prisma/client 6.19.2 - Auto-generated DB client
- Adapter for NextAuth.js

**Search:**
- meilisearch 0.41.0 - JavaScript search client

**Backend Communication:**
- tRPC 11.8.1 - Type-safe RPC
  - @trpc/client 11.8.1
  - @trpc/next 11.8.1
  - @trpc/server 11.8.1
  - @trpc/react-query 11.8.1
- Custom fetch-based API client in `src/lib/api-client.ts`

**Query Management:**
- @tanstack/react-query 5.90.19 - Server state management

### UI & Styling

**Component Libraries:**
- @headlessui/react 2.1.2 - Unstyled accessible components
- @headlessui/tailwindcss 0.2.0 - Headless UI Tailwind utilities
- @radix-ui/react-collapsible 1.1.12 - Collapsible components
- @radix-ui/react-toast 1.2.2 - Toast notifications
- @radix-ui/react-tooltip 1.1.4 - Tooltip components

**Styling:**
- Tailwind CSS 3.4.3 - Utility-first CSS framework
- PostCSS 8.4.38 - CSS transformation
  - postcss-import 16.1.0 - @import support
  - autoprefixer 10.4.19 - Vendor prefixes
- tailwind-merge 3.4.0 - Smart class merging
- @tailwindcss/typography - Prose/content styling
- tailwindcss-safe-area 0.5.1 - Safe area support

**Icons & Assets:**
- @svgr/webpack 7.0.0 - SVG as React components
- svgo-loader 4.0.0 - SVG optimization

### Forms & Validation

**Form Handling:**
- react-hook-form 7.51.3 - Efficient form state
- @hookform/resolvers 3.3.4 - Validation integration

**Validation:**
- zod 4.3.5 - Schema validation
- yup 1.4.0 - Alternative schema validation

### Animation & Motion

- framer-motion 11.18.2 - Declarative animations
- GSAP (via script) - Advanced animations
- Lottie (via script) - JSON-based animations
- Spline (via script) - 3D graphics

### Content & Media

**Image Processing:**
- sharp 0.34.5 - Image manipulation (JPEG, PNG, WebP)

**API Client Libraries:**
- graphql-request 7.4.0 - GraphQL client
- async-retry 1.3.3 - Retry logic for API calls

### Utilities

- clsx 2.1.1 - Classname composition
- prop-types 15.8.1 - Runtime type checking
- react-use 17.5.0 - React hooks collection
- superjson 2.2.6 - JSON extension for serialization
- bcryptjs 3.0.3 - Password hashing

### Localization

- next-intl 4.8.3 - Internationalization (i18n removed in favor of English-only)

### Theming

- next-themes 0.3.0 - Dark/light mode support

### Build & Optimization

**Build Tool:**
- Next.js built-in build system

**Bundler Analysis:**
- @next/bundle-analyzer 14.2.2 - Analyze bundle size

**File Loaders:**
- file-loader 6.2.0 - Asset loaders
- url-loader 4.1.1 - Data URLs for small assets

### Testing

**E2E Testing:**
- Cypress 13.8.0 - End-to-end testing (Playwright alternative in progress)

**Vitest:**
- vitest 4.0.2 - Unit test runner
- @vitest/ui 4.0.2 - Test UI dashboard
- happy-dom 20.0.8 - DOM implementation

### Monorepo Workspace

**Root package.json workspace packages:**
- `apps/www/` - Main job board application
- `apps/employers/` - Employer dashboard (shared build infrastructure)
- `packages/types/` - Shared TypeScript types
- `packages/ui/` - Shared UI component library
- `packages/utils/` - Shared utility functions

### Development

**Code Quality:**
- ESLint 8.57.0 - JavaScript/TypeScript linting
  - airbnb config
  - Prettier integration
  - React, React Hooks plugins
- Prettier 3.7.4 - Code formatting
- prettier-plugin-tailwindcss 0.5.14 - Tailwind class sorting
- Markdownlint 0.39.0 - Markdown linting

**Package Management:**
- Bun workspaces for multi-app development
- Resolutions for Babel to prevent version conflicts

---

## HR App (Next.js Marketing Site)

### Languages & Runtime

**Primary:**
- TypeScript 5.5.4 - Type safety
- JavaScript (JSX/TSX) - React components
- CSS (Tailwind) - Styling

**Runtime:**
- Node.js >=20.0.0
- Bun - Package manager

### Framework & Core

**Framework:**
- Next.js 14.2.35 - React meta-framework
- React 18.3.1 - UI framework
- React DOM 18.3.1

### Styling

**CSS Framework:**
- Tailwind CSS 3.4.14 - Utility-first CSS
- @tailwindcss/forms 0.5.9 - Form styling
- @tailwindcss/typography 0.5.15 - Prose/content
- PostCSS 8.4.47 - CSS processing
  - autoprefixer 10.4.20 - Vendor prefixes

**Styling Utilities:**
- clsx 2.1.1 - Class composition
- tailwind-merge 2.5.4 - Smart class merging
- next-themes 0.4.3 - Dark/light mode

### UI & Animation

**Components:**
- @headlessui/react 2.2.0 - Accessible primitives

**Carousel/Slider:**
- swiper 12.1.2 - Touch slider library

**Animation:**
- framer-motion 11.11.17 - Declarative animations

### Forms & Validation

**Form Handling:**
- react-hook-form 7.53.2 - Form state
- @hookform/resolvers 3.9.1 - Validation integration

**Validation:**
- zod 3.23.8 - Schema validation

### Theming

- next-themes 0.4.3 - Dark/light mode support

### Build & Development

**Linting:**
- ESLint 8.57.1 - JavaScript linting
- eslint-config-next 14.2.35 - Next.js ESLint config

**Formatting:**
- Prettier 3.3.3 - Code formatting

**Type Checking:**
- TypeScript 5.5.4 - Type checker

### Testing

**Unit Testing:**
- Vitest 2.1.4 - Fast unit test runner

### Standalone Deployment

- No shared packages dependency
- Independent from Jobs App monorepo structure
- Can be deployed separately to different domain/port

---

## Admin Panel (React + Vite)

### Languages & Runtime

**Primary:**
- TypeScript 5.7.3 - Type safety
- JavaScript - JavaScript components
- CSS (Emotion) - Dynamic styling

**Runtime:**
- Node.js 22.19.0 (pinned via Volta)
- pnpm - Package manager (workspace enabled)

### Framework & Build

**Framework:**
- React 19.1.0 - UI library
- React DOM 19.1.0 - DOM rendering

**Build Tool:**
- Vite 7.2.2 - Fast bundler
- @vitejs/plugin-react-swc 4.0.1 - SWC-based JSX transform

### UI & Styling

**Component Library:**
- @mui/material 7.1.0 - Material Design components
- @mui/icons-material 7.1.0 - Material Design icons
- @emotion/react 11.11.1 - CSS-in-JS
- @emotion/styled 11.11.0 - Styled components

**Markdown Editor:**
- @uiw/react-md-editor 4.0.11 - Rich markdown editor for job descriptions

### HTTP Client

**API Communication:**
- axios 1.13.5 - HTTP client
- Custom SDK wrapper: `@jobs/api-client` package

### Navigation

- react-router-dom 7.1.0 - Client-side routing

### API Client SDK

**Package:** `@jobs/api-client` (workspace)
- Axios-based HTTP client
- Typed methods for all backend endpoints
- Built with tsup 8.4.0 (ES modules + CommonJS)
- TypeScript with declaration files

**Build Pipeline:**
- tsup - ES/CJS bundling
- TypeScript compiler (tsc) - Type declarations
- Concurrent build via `concurrently`

### Monorepo Workspace

**Root workspace packages:**
- `packages/manager/` - Admin panel app
- `packages/api-v4/` - API client SDK
- `packages/tsconfig/` - Shared TypeScript configs
- `packages/ui/` - Shared UI components (legacy)
- `packages/shared/` - Shared types (legacy)
- `packages/utilities/` - Helper functions (legacy)

### Development & Testing

**Code Quality:**
- TypeScript 5.7.3 - Type checker
- ESLint 7+ - Linting
- Prettier 3.5.3 - Formatting

**Testing:**
- Vitest 4.0.10 - Unit test runner
- @vitest/ui 4.0.18 - Test UI
- @testing-library/react 16.0.1 - Component testing
- @testing-library/jest-dom 6.4.8 - DOM matchers
- jsdom 28.0.0 - DOM implementation

**Build Tools:**
- concurrently 9.1.0 - Run parallel processes

---

## Containerization & Orchestration

### Container Runtime

**Platform:**
- Podman (Docker-compatible)
- podman-compose - Compose orchestration

### Container Images

**Database:**
- postgres:16-alpine - PostgreSQL database

**Search:**
- getmeili/meilisearch:v1.6 - Meilisearch search engine

**Browser:**
- browserless/chrome:latest - Headless Chrome for scraping

**Backend:**
- Custom: `backend/Dockerfile`
  - Build stage: golang:1.25-alpine
  - Runtime stage: alpine:3.20

**Frontend/Admin:**
- Optional containerization (usually run locally in dev)

### Compose Files

- `compose.yml` - Development compose with all services
- `compose.production.yml` - Production-hardened configuration
- Optional profiles: `scraping`, `ai` (for specialized workloads)

---

## Package Manager Configuration

### Node.js Monorepo

**Root (Jobs App workspace):**
- Bun workspaces
- Volta pinned to Node.js 22.19.0 (admin/ only)

**Admin Panel:**
- pnpm workspaces
- Volta pinned to Node.js 22.19.0

**HR App:**
- Standalone Bun project

### Engines

**Root package.json:**
```
"engines": {
  "node": ">=20.0.0",
  "npm": ">=8.0.0",
  "pnpm": ">=8.0.0"
}
```

---

## Configuration & Environment

### Environment Variables

**Backend (.env or Docker env):**
- `DATABASE_URL` - PostgreSQL connection
- `MEILI_URL`, `MEILI_MASTER_KEY` - Meilisearch
- `JWT_SECRET` - JWT signing key
- `PORT` - API port (default 8080)
- `ENV` - Environment: development/production
- `SMTP_*` - Email configuration (optional)
- `CHROME_WS_URL` - Headless Chrome WebSocket
- `SCRAPER_ENABLED` - Enable web scraping
- `OLLAMA_URL` - AI model server (optional)

**Jobs App (.env.local):**
- `NEXT_PUBLIC_API_URL` - Public API URL (client-side)
- `INTERNAL_API_URL` - Internal API URL (server-side Docker)
- `DATABASE_URL` - PostgreSQL connection (SSR)
- `NEXTAUTH_SECRET` - NextAuth.js encryption key

**Admin Panel:**
- Environment configured at build/runtime via Vite

### Build & Deployment

**Development:**
- Makefile targets: `make dev-jobs`, `make dev-admin`, `make dev-backend`
- Local file watchers for hot reload
- Docker compose for service dependencies

**Production:**
- Docker/Podman image builds
- Stateless API containers
- PostgreSQL & Meilisearch persistent volumes
- Optional profiles for scraping/AI features

---

*Stack analysis: 2025-02-22*
