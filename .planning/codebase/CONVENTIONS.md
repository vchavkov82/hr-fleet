# Coding Conventions

**Analysis Date:** 2026-02-22

## Naming Patterns

**Files:**

**Frontend (Next.js - app/jobs):**
- Components: kebab-case (e.g., `hero.jsx`, `job-card.tsx`, `job-filters-panel.jsx`)
- Pages: `page.tsx` or `page.jsx` for route files
- Test files: `*.test.{js,jsx,ts,tsx}` (co-located with component)
- Config: kebab-case (`vitest.config.js`, `.eslintrc.json`)

**HR App (Next.js - app/hr):**
- Same as jobs app: kebab-case for components, `.eslintrc.json` with Next.js rules

**Admin (React + MUI - admin/packages):**
- Components: PascalCase (e.g., `Dashboard.tsx`, `UserList.tsx`, `CompanyDetail.tsx`)
- API SDK: camelCase (e.g., `api-v4/src/users.ts`, `api-v4/src/auth.ts`)
- Test files: `*.test.tsx` (e.g., `Dashboard.test.tsx`)

**Backend (Go):**
- Files: snake_case (e.g., `company_handler.go`, `auth_handler.go`, `response.go`)
- Tests: `*_test.go` (e.g., `auth_test.go`, `rbac_test.go`)
- Packages: lowercase single word (e.g., `package server`, `package middleware`)

**Functions/Methods:**

**Frontend/TypeScript:**
- camelCase for all functions: `handleSubmit`, `formatSalary`, `searchJobs`, `parseFiltersFromParams`
- React component functions: PascalCase `export default function LoginPage() {}`

**Backend (Go):**
- Exported (public) functions: PascalCase `func New()`, `func JSON()`
- Unexported (private) handler methods: camelCase with receiver `func (s *Server) handleLogin(...)`
- Pattern: HTTP handlers named `handle{Action}` (e.g., `handleLogin`, `handleListCompanies`, `handleUpdateCompanyProfile`)

**Variables:**

**Frontend:**
- camelCase for all: `jobCount`, `isSearching`, `debounceRef`, `searchQuery`, `fieldErrors`
- Constants: UPPER_SNAKE_CASE `DEBOUNCE_MS = 300`

**Backend (Go):**
- Local variables: camelCase `err`, `companies`, `limit`
- Struct fields: PascalCase when exported `type updateProfileRequest struct { Name string }`
- Constants: UPPER_SNAKE_CASE or normal case `validLayoutStyles = map[string]bool{ ... }`

**Types & Interfaces:**

**Frontend (TypeScript):**
- PascalCase: `interface JobDetail {}`, `type SearchJobsParams = {}`, `interface FilterState {}`

**Backend (Go):**
- Request/response structs: lowerCamelCase `type loginRequest struct`, `type updateProfileRequest struct`
- Response helpers: PascalCase interface if exported
- Type aliases: PascalCase when exported

## Code Style

**Formatting:**

**Frontend (jobs app):**
- prettier 3.7.4
- ESLint with Airbnb config
- Line width: 80 characters
- Tab width: 2 spaces
- Trailing commas: ES5 style

**HR App (app/hr):**
- ESLint: `extends "next/core-web-vitals"` with disabled `@next/next/no-html-link-for-pages`
- .prettierrc: `{ semi: false, singleQuote: true, tabWidth: 2, trailingComma: 'es5', printWidth: 100 }`

**Admin (packages):**
- No explicit linter config; TypeScript strict mode
- prettier runs via lint-staged

**Backend (Go):**
- Standard `go fmt` for formatting
- `goimports` for import organization
- Tab width: 1 tab (Go standard)

## Import Organization

**Frontend/TypeScript Order:**
1. React/Next.js imports (`react`, `next/...`)
2. Third-party libraries (`@mui/material`, `axios`, etc.)
3. Internal project imports (`@/lib`, `@jobs/api-client`, relative `./`)
4. Type imports (`import type {...}`)

**Example from `api-client.ts`:**
```typescript
// External (implicit fetch from browser/Node)

// Internal types
export interface JobSearchHit { ... }
export interface SearchJobsResponse { ... }

// Internal functions
async function apiFetch<T>() { ... }
export async function searchJobs() { ... }
```

**Backend (Go):**
```go
package server

import (
  "context"
  "net/http"

  "github.com/go-chi/chi/v5"

  "github.com/jobs/platform/db"
  "github.com/jobs/platform/platform/response"
)
```
- Standard library first
- Third-party packages second
- Internal packages last

**Path Aliases:**
- **Frontend**: `@/` → `apps/www/src/`
- **Admin**: `src/*` → local imports
- **Backend**: Full module paths `github.com/jobs/platform/...`

## Error Handling

**Frontend Patterns:**

**Try-catch with state management:**
```typescript
try {
  const user = await login(email, password);
  setEmail('');
  setPassword('');
  // redirect
} catch (err) {
  if (err instanceof AuthError) {
    if (err.fieldErrors) {
      setFieldErrors(err.fieldErrors);
    } else {
      setError(err.message);
    }
  } else {
    setError('Unexpected error occurred');
  }
} finally {
  setLoading(false);
}
```

**API client pattern (lib/api-client.ts):**
- Fetch errors logged to `console.error()` with context
- Function returns null on failure; caller provides fallback
- Example: `return result || { hits: [], total: 0, facets: {}, cursor: null }`

**Component error display:**
- Use `useState` for error state
- Display in error alert/div with class `text-red-700` or `border-red-300`
- Provide Retry button when applicable

**Backend (Go) Patterns:**

**Error logging with context:**
```go
if err != nil {
  slog.Error("operation_name", "error", err)
  response.Error(w, http.StatusInternalServerError, "error message")
  return
}
```

**Response helper:**
- `response.JSON(w, http.StatusOK, data)` for success
- `response.Error(w, http.StatusBadRequest, "message")` for errors

**Validation errors:**
- Return `http.StatusBadRequest` with `response.Error()`
- Include helpful message for client

## Logging

**Framework:**
- **Frontend**: `console` only (no structured logging library)
- **Backend (Go)**: `log/slog` (standard library, structured logging)

**Patterns:**

**Frontend:**
```typescript
console.error(`API fetch error for ${endpoint}:`, error);
console.error('Search failed:', error);
```

**Backend:**
```go
slog.Error("listing companies", "error", err)
slog.Info("user logged in", "user_id", userID)
```

**When to Log:**
- Frontend: API errors, authentication failures
- Backend: Database errors, validation issues, middleware events
- Avoid: Logging sensitive data (tokens, passwords)

## Comments

**When to Comment:**
- Complex business logic or algorithms
- Non-obvious intent (especially in backend)
- TODO/FIXME for tracked issues
- Workarounds with explanation

**No comments needed for:**
- Variable assignments (self-explanatory names)
- Simple conditionals
- Standard utility operations

**Documentation Comments:**

**Backend (Go - Swagger/godoc):**
```go
// handleLogin godoc
// @Summary      User login
// @Description  Authenticate user and return JWT tokens
// @Tags         auth
// @Accept       json
// @Produce      json
func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) { ... }
```

**Frontend (TypeScript):**
- No mandatory JSDoc; types provide documentation
- Optional brief comments for complex logic

## Function Design

**Size:**
- Frontend components: 20-150 lines
- Frontend utilities: 5-40 lines
- Backend handlers: 30-150 lines, split into helpers
- Backend utilities: 5-50 lines

**Parameters:**

**Frontend:**
```typescript
// Components: props object
export default function Hero({ jobCount = 0, companyCount = 0 }) { ... }

// Utilities: named parameters object
export async function searchJobs(params: SearchJobsParams = {}): Promise<SearchJobsResponse> { ... }
```

**Backend:**
```go
// Handlers: request struct + response writer + http.Request
func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) { ... }

// Utilities: standard params
func apiFetch<T>(endpoint: string, options?: { revalidate?: number | false }): Promise<T | null> { ... }
```

**Return Values:**
- Frontend async: `Promise<T>` or `null` on error
- Frontend components: JSX/React.ReactNode
- Backend handlers: void (write response via helper)
- Backend utilities: typed returns `(error, data)` or `error`

## Module Design

**Exports:**

**Frontend:**
- Named exports for utilities: `export function searchJobs() {}`
- Default exports for components/pages: `export default function LoginPage() {}`

**Backend:**
- Exported (public): Capitalized `func New()`, `func JSON()`
- Unexported (private): lowercase `func (s *Server) handleLogin()`

**File Responsibilities (Single Responsibility):**
- `api-client.ts`: Job search and retrieval operations only
- `auth-client.ts`: Authentication operations (login, register, logout)
- `users.ts`: User admin operations (list, get, assign roles)
- `company_handler.go`: All company HTTP handlers
- `response.go`: JSON response helpers (JSON, Error)
- `middleware/auth.go`: Authentication middleware, context helpers

**Barrel Files:**
- Not commonly used
- Exception: API SDK packages may export from `index.ts`

## Component Patterns (Frontend/Next.js)

**Server vs Client Components:**

**Server Components (default):**
- No `'use client'` directive
- Use for: data fetching, Prisma queries, metadata generation
- Example: `app/(home-page)/page.tsx` fetches job/company counts via Prisma

**Client Components:**
- Start with `'use client'` directive
- Use for: interactivity, state, hooks
- Example: `app/auth/login/page.tsx` manages form state

**Server/Client Split Pattern:**
- Create `page.tsx` as server component (data + layout)
- Create separate `*-client.jsx` for interactive sections
- Example:
  - `jobs/page.tsx` (server) imports from `jobs-client.tsx` ('use client')
  - `job-detail-client.jsx` ('use client') contains apply form logic

**Functional Components:**
- Arrow functions for presentational components
- `function` keyword for pages: `export default function LoginPage() {}`
- Single props object parameter

**Props & State:**
- Props typed with `interface ComponentProps {}`
- State via `useState` hook; multiple states allowed
- useCallback for event handlers
- useTransition for router operations

**Effects & Hooks:**
- useEffect for side effects
- useRouter/useSearchParams for client-side navigation (client component only)
- Cleanup functions: `return () => { ... }`

## HTML/Form Conventions (Server Components)

**Native HTML (not Next.js components):**

**Good - Server component with native form:**
```jsx
export default async function HomePage() {
  return (
    <form action="/jobs" method="get">
      <input name="q" type="text" placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
  );
}
```

**Use native `<a>` tags in server components:**
```jsx
<a href={LINKS.forEmployers} className="...">Post a Job</a>
```

**In client components, use Next.js components:**
```jsx
'use client';
import Link from 'next/link';
<Link href="/jobs">Browse Jobs</Link>
```

**Form Validation:**
- Client-side: `trim()`, type checks, length validation
- Error messages: class `text-red-600` font-size `text-xs`
- Required fields: `required` attribute or manual check

## Styling Conventions (Tailwind CSS)

**Core:**
- Utility-first approach; avoid custom CSS
- Responsive modifiers: `md:`, `lg:`, `xl:`, `sm:` for breakpoints

**Custom Colors:**
- Primary blue: `#215cff` (`bg-primary`, `text-primary`)
- Navy deep: `#021143` (`bg-navy-deep`)
- Accent pink: `#EC4899` (`bg-accent`)
- Navy: `#1E293B` (footer background)

**Container Sizes:**
- `960`: Hero section (narrow, centered)
- `1152`: Content sections (standard width)
- Named in tailwind config

**Class Merging:**
- Use `cn()` utility from `lib/utils.ts`
- Pattern: `cn("base", condition && "conditional")`
- Built on clsx + tailwind-merge

**Media Queries:**
- Mobile-first: write base styles, then `md:`, `lg:`, `xl:` overrides
- Avoid breakpoints smaller than `md:` unless necessary

## Database Patterns

**Frontend (Prisma):**
```typescript
import { prisma } from '@/lib/prisma';

// In async server component
const jobCount = await prisma.job.count({ where: { status: 'published' } });
```

**Backend (sqlc + pgx):**
```go
companies, err := s.queries.ListCompanies(ctx, db.ListCompaniesParams{
  Limit:  20,
  Offset: 0,
})
```

- Type-safe: queries generated by sqlc
- Connection pooling: pgxpool
- Error handling: check error, log with context

---

*Convention analysis: 2026-02-22*
