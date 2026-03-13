# Frontend Testing Guide

This project includes comprehensive unit and E2E testing to ensure code quality and catch regressions early.

## Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: V8 coverage provider

## Running Tests

### Unit Tests
```bash
# Run unit tests once
pnpm run test

# Watch mode (rerun on file changes)
pnpm run test:watch

# UI dashboard
pnpm run test:ui
```

### E2E Tests
```bash
# Run all E2E tests
pnpm run test:e2e

# UI mode (interactive)
pnpm run test:e2e:ui

# Debug mode (step through)
pnpm run test:e2e:debug

# Specific browser
pnpm run test:e2e -- --project=chromium
```

### All Tests
```bash
# Run unit tests only (recommended for CI)
pnpm run test:all
```

### E2E Tests Setup

**Important:** E2E tests require additional system dependencies to be installed.

#### Prerequisites
1. Playwright browsers must be installed:
```bash
cd www
pnpm dlx playwright install
```

2. System dependencies (Linux):
```bash
# Ubuntu/Debian
sudo apt-get install libxrandr2 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 libgtk-3-0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 libcairo-gobject2 libcairo2 libgdk-pixbuf-2.0-0 libasound2

# Or install all at once
sudo npx playwright install-deps
```

#### Running E2E Tests
```bash
# Run E2E tests (requires browsers installed)
pnpm run test:e2e

# Debug mode (interactive browser)
pnpm run test:e2e:debug

# UI mode
pnpm run test:e2e:ui
```

> **Note:** E2E tests are optional in most development workflows. Focus on unit tests for rapid iteration, and run E2E tests before deployment or in CI pipelines.

## Test Structure

```
tests/
├── setup.ts              # Shared test configuration
├── unit/                 # Unit tests for components
│   └── example.test.tsx
└── e2e/                  # End-to-end tests
    └── navigation.spec.ts
```

## Unit Tests

Located in `tests/unit/`, these test individual components and utilities in isolation.

### Example:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })
})
```

## E2E Tests

Located in `tests/e2e/`, these test complete user workflows across the running application.

### Test Coverage:

1. **Navigation**: Basic routing and header functionality
2. **Link Integrity**:
   - Validates all internal links return 200 status
   - Checks external links for server errors
   - Ensures all links have proper href or aria-label attributes
3. **Responsive Design**: Mobile, tablet, and desktop viewports
4. **Accessibility**: Basic accessibility checks

### Example:
```typescript
test('should validate all internal links work', async ({ page }) => {
  await page.goto('/')
  // Test implementation
})
```

## Configuration Files

### `vitest.config.ts`
- Unit test configuration
- jsdom environment for DOM testing
- Path aliases matching Next.js

### `playwright.config.ts`
- E2E test configuration
- Multi-browser testing (Chromium, Firefox, Safari)
- Automatic server startup
- Screenshot on failure
- HTML report generation

## CI/CD Integration

Tests are configured for CI environments:

```bash
# In CI, tests use:
# - Single worker (sequential)
# - 2 retry attempts for flaky tests
# - Strict forbidOnly mode

PLAYWRIGHT_BASE_URL=https://staging.example.com pnpm run test:e2e
```

## Debugging

### Unit Tests
```bash
# With Vitest UI
pnpm run test:ui

# With console output
pnpm run test:watch
```

### E2E Tests
```bash
# Interactive debug mode
pnpm run test:e2e:debug

# With UI
pnpm run test:e2e:ui

# With tracing (generates video/trace)
playwright test --trace on
```

## Best Practices

1. **Unit tests**: Write tests for components, utilities, and business logic
2. **E2E tests**: Test critical user journeys (navigation, forms, payments)
3. **Naming**: Describe what the test does, not how
4. **Isolation**: Each test should be independent
5. **Cleanup**: Global setup handles cleanup automatically
6. **Mocking**: Use `vi.mock()` for dependencies that shouldn't be tested

## Troubleshooting

### Hydration Errors
- These can indicate Next.js SSR/client mismatch
- Check for `suppressHydrationWarning` overuse
- Ensure consistent rendering on server/client

### Flaky Tests
- Increase timeout for slow operations
- Use `waitFor()` for async operations
- Avoid fixed waits (`setTimeout`)

### Port Already in Use
- E2E tests auto-start the dev server
- Kill any existing process: `lsof -ti:3010 | xargs kill -9`

### E2E Tests: Missing Browser Dependencies
If E2E tests fail with "browserType.launch: Executable doesn't exist":

1. Install Playwright browsers:
```bash
cd www
pnpm dlx playwright install
```

2. Install system dependencies (Linux):
```bash
# Option 1: Use Playwright's helper
sudo npx playwright install-deps

# Option 2: Manual install (Ubuntu/Debian)
sudo apt-get install libxrandr2 libxcomposite1 libxcursor1 libxdamage1 \
  libxfixes3 libxi6 libgtk-3-0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
  libcairo-gobject2 libcairo2 libgdk-pixbuf-2.0-0 libasound2
```

3. On macOS/Windows: Browsers should work automatically after `playwright install`

### E2E Tests Timeout
- Ensure the dev server starts successfully: `pnpm dev`
- Check if port 3010 is accessible
- Increase timeout in playwright.config.ts if needed

## Reports

- **Unit test coverage**: `coverage/` directory
- **E2E test report**: `playwright-report/` directory

Open HTML reports in a browser to visualize test results.
