# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## App

Main HR SaaS web application (`@hr/www`). Next.js 15 App Router with React 19.

## Commands

```bash
pnpm dev                # Dev server on port 5010
pnpm build              # Production build
pnpm lint               # ESLint
pnpm lint:fix           # ESLint with auto-fix
pnpm typecheck          # tsc --noEmit
pnpm test               # Vitest unit tests (run once)
pnpm test:watch         # Vitest watch mode
pnpm test:ui            # Vitest browser UI
pnpm test:e2e           # Playwright e2e (Firefox, needs running dev server)
pnpm test:e2e:debug     # Playwright with debugger
pnpm format             # Prettier
```

## Tech Stack

- **Framework**: Next.js 15.2 (App Router, standalone output)
- **Styling**: Tailwind CSS 3.4 with custom theme (Inter + Mulish fonts)
- **Forms**: React Hook Form + Zod validation
- **i18n**: next-intl
- **Dark mode**: next-themes
- **AI**: Vercel AI SDK + @an-sdk/* internal SDKs
- **Tables**: TanStack React Table
- **Animations**: Framer Motion
- **Accessible components**: Headless UI
- **Content**: MDX via next-mdx-remote
- **Testing**: Vitest (unit, jsdom env), Playwright (e2e, Firefox only)
- **Images**: Cloudflare Image Resizing (custom loader)

## Architecture

```
src/
├── app/            # Next.js App Router pages and layouts
├── components/     # React components
├── content/        # Static content (MDX)
├── i18n/           # Internationalization config and messages
├── lib/            # Utilities (image loader, helpers)
├── agent.ts        # AI agent configuration
├── middleware.ts   # Next.js middleware
└── navigation.ts   # Navigation config
```

## Key Config

- Path alias: `@/*` → `./src/*`
- TypeScript strict mode
- Output: standalone (for containerized deployment)
- Bundle analyzer available: `ANALYZE=true pnpm build`
- CORS origins: localhost:5010, hr.vchavkov.com

## Conventions

- Use `clsx` + `tailwind-merge` for conditional classnames
- Zod schemas for all form validation
- Unit tests go in `tests/unit/`
- E2e tests use Playwright with Firefox project only
