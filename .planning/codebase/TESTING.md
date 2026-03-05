# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Runner:**
- **Vitest** - All admin packages (`api-v4`, `manager`, `shared`, `ui`, `utilities`)
- **Cypress** - E2E testing for manager app (admin panel)
- **No tests** - Jobs app and HR app (Next.js apps lack test coverage)

**Configuration:**
- Admin packages: `vitest.config.ts` in each package root
  - Shared setup via `testSetup.ts` (e.g., `/admin/packages/shared/testSetup.ts`)
  - Environment: `jsdom` for UI packages, `node` for API SDK
  - Coverage: v8 provider with reporters: text, json, html
  - Excludes: test files themselves, node_modules, lib/

**Run Commands:**
```bash
# Admin packages
cd admin && bun test                 # Run all tests
cd admin/packages/api-v4 && bun test # Run tests in one package
cd admin && bun test:watch           # Watch mode (if configured)
```

**Assertion Library:**
- **Vitest** built-in assertions
- **@testing-library/jest-dom** matchers (for UI tests)
  - Extended via `expect.extend(matchers)` in testSetup.ts

## Test File Organization

**Location:**
- **Admin packages**: Co-located with source files
  - Example: `admin/packages/api-v4/src/users.ts` → `admin/packages/api-v4/src/users.test.ts`
  - Example: `admin/packages/manager/src/features/Dashboard/Dashboard.tsx` → same directory with `.test.tsx`

**Naming:**
- API SDK: `*.test.ts` suffix (`auth.test.ts`, `users.test.ts`, `taxonomy.test.ts`)
- Components: `*.test.tsx` suffix (`Dashboard.test.tsx`, `UserList.test.tsx`)

**Structure:**
```
admin/
├── packages/
│   ├── api-v4/
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── auth.test.ts
│   │   │   ├── users.ts
│   │   │   └── users.test.ts
│   │   ├── vitest.config.ts
│   │   └── testSetup.ts
│   └── manager/
│       ├── src/
│       │   ├── test/
│       │   │   └── test-utils.tsx
│       │   └── features/
│       │       ├── Dashboard/
│       │       │   ├── Dashboard.tsx
│       │       │   └── Dashboard.test.tsx
│       │       └── Users/
│       │           ├── UserList.tsx
│       │           └── UserList.test.tsx
│       └── vitest.config.ts
```

## Test Structure

**Suite Organization:**
```typescript
// Example from admin/packages/api-v4/src/auth.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login, logout, getMe, refreshToken } from './auth';

vi.mock('axios');
vi.mock('./request', () => ({
  baseRequest: {
    post: vi.fn(),
    get: vi.fn(),
  },
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      // Test body
    });
  });

  describe('getMe', () => {
    it('should get current user', async () => {
      // Test body
    });
  });
});
```

**Patterns:**
- **Setup**: `beforeEach(() => { vi.clearAllMocks(); })`
- **Teardown**: `afterEach()` in testSetup.ts for cleanup (`cleanup()` from @testing-library/react)
- **Nested describe blocks**: Group related tests by function/feature
- **Test naming**: `it('should [action]')` or `it('should [action] [condition]')`

## Mocking

**Framework:** **Vitest** with `vi` (vitest module)

**Patterns:**

**1. Module mocking (API functions):**
```typescript
vi.mock('@jobs/api-client');

// In test:
const { baseRequest } = await import('./request');
vi.mocked(baseRequest.get).mockResolvedValue({ data: mockResponse });

// Assert:
expect(baseRequest.get).toHaveBeenCalledWith('/admin/users', { params: {...} });
```

**2. Mock data fixtures:**
```typescript
const mockStats = {
  total_users: 150,
  total_companies: 25,
  published_jobs: 42,
  pending_jobs: 5,
  total_jobs: 100,
  total_applications: 300,
  pending_applications: 18,
};

const mockUser = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin',
  roles: ['platform_admin'],
  created_at: '2024-01-01T00:00:00Z',
};
```

**3. Mock responses (axios):**
```typescript
vi.mocked(apiClient.getDashboardStats).mockResolvedValue(mockStats);
vi.mocked(apiClient.getDashboardStats).mockImplementation(
  () => new Promise(() => {}),  // Infinite pending for loading state tests
);
```

**4. Clearing mocks:**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

**What to Mock:**
- External API calls (@jobs/api-client functions)
- HTTP requests (axios, fetch)
- Auth context providers
- Router navigation (react-router-dom)
- Timers (if testing delays)

**What NOT to Mock:**
- React hooks (`useState`, `useEffect`, `useCallback`)
- Component rendering (test the real component)
- HTML elements and event handlers
- Testing library utilities

## Fixtures and Factories

**Test Data:**

Admin test utilities in `admin/packages/manager/src/test/test-utils.tsx`:
```typescript
export const mockAdminUser: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  roles: ['platform_admin'],
  email_verified_at: '2024-01-01T00:00:00Z',
  company_id: null,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockEmployerUser: User = {
  id: '2',
  email: 'employer@example.com',
  name: 'Employer User',
  roles: ['company_admin'],
  email_verified_at: '2024-01-01T00:00:00Z',
  company_id: 'company-1',
  created_at: '2024-01-01T00:00:00Z',
};
```

**Custom Render Function (with context providers):**
```typescript
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  isAuthenticated?: boolean;
}

export function render(
  ui: ReactElement,
  { user, isAuthenticated, ...options }: CustomRenderOptions = {},
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <TestProviders user={user} isAuthenticated={isAuthenticated}>
        {children}
      </TestProviders>
    ),
    ...options,
  });
}

// Usage in tests:
render(<Dashboard />, {
  user: mockAdminUser,
  isAuthenticated: true,
});
```

**Location:**
- `admin/packages/manager/src/test/test-utils.tsx` — Custom render, mock users, providers

## Coverage

**Requirements:** Not enforced (no CI checks blocking PRs)

**View Coverage:**
```bash
# After running tests with coverage
cd admin/packages/api-v4
bun test --coverage  # or vitest run --coverage
# Opens coverage/index.html in browser
```

**Coverage configuration:**
```typescript
// vitest.config.ts
test: {
  globals: true,
  environment: 'node',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: ['**/*.test.ts', '**/node_modules/**', 'lib/**'],
  },
}
```

## Test Types

**Unit Tests:**
- **API SDK tests** (`admin/packages/api-v4/src/*.test.ts`)
  - Scope: Individual API function (getUsers, login, createCategory, etc.)
  - Approach: Mock request layer, assert correct HTTP calls and response handling
  - Example: `admin/packages/api-v4/src/users.test.ts` tests pagination, error handling, role management
- **Component tests** (`admin/packages/manager/src/features/**/*.test.tsx`)
  - Scope: Single React component
  - Approach: Render with test utilities, assert rendering and user interactions
  - Example: `Dashboard.test.tsx` tests loading state, stats display, error state

**Integration Tests:**
- Not explicitly defined, but component tests with real API SDK calls (mocked at HTTP layer) function as integration tests

**E2E Tests:**
- **Cypress** for admin panel (`admin/packages/manager/cypress/`)
  - Full user workflows: login → navigate → interact → verify
  - Real browser automation
- **Not used** in Jobs app or HR app (no E2E test coverage)

## Common Patterns

**Async Testing:**
```typescript
it('should render all 7 stats cards with data', async () => {
  vi.mocked(apiClient.getDashboardStats).mockResolvedValue(mockStats);

  render(<Dashboard />, {
    user: mockAdminUser,
    isAuthenticated: true,
  });

  await waitFor(() => {
    expect(screen.getByText('150')).toBeInTheDocument();
  });
});
```

**Loading State Testing:**
```typescript
it('should render loading state', () => {
  vi.mocked(apiClient.getDashboardStats).mockImplementation(
    () => new Promise(() => {}),  // Pending forever
  );

  render(<Dashboard />, {
    user: mockAdminUser,
    isAuthenticated: true,
  });

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
```

**Error Testing:**
```typescript
it('should show error alert when API fails', async () => {
  const errorMessage = 'Network error';
  vi.mocked(apiClient.getUsers).mockRejectedValue(new Error(errorMessage));

  const { container } = render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
  });
});
```

**DOM Queries (Testing Library):**
```typescript
// Preferred order:
screen.getByRole('button')           // Accessibility-first
screen.getByLabelText('Username')    // User perspective
screen.getByPlaceholderText('Search') // Visible text
screen.getByText('Click me')          // Text content
screen.getByTestId('submit-btn')      // Last resort
container.querySelector('svg')        // Direct DOM if needed
```

---

*Testing analysis: 2026-02-22*
