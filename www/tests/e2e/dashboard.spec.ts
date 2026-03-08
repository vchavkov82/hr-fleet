import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('navigating to /dashboard redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/en/dashboard')
    // Should redirect to login page with returnUrl
    await page.waitForURL(/\/auth\/login/)
    expect(page.url()).toContain('/auth/login')
    expect(page.url()).toContain('returnUrl')
  })

  test('authenticated user can see dashboard overview', async ({ page, context }) => {
    // Set auth cookie to bypass middleware redirect
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/en/dashboard')
    // Dashboard overview should render
    await expect(page.locator('h1')).toContainText(/Dashboard|Overview/i)
  })

  test('authenticated user can navigate to employee directory', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/en/dashboard')
    // Click on Employees in sidebar
    const employeesLink = page.locator('a[href*="employees"]').first()
    await employeesLink.click()
    await page.waitForURL(/\/dashboard\/employees/)
    await expect(page.locator('h1')).toContainText(/Employee/i)
  })

  test('employee table renders with loading or error state', async ({ page, context }) => {
    // With a fake token, API calls will fail but the table component should render
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/en/dashboard/employees')
    // Should see either the table, loading skeleton, or error state
    const table = page.locator('table')
    const skeleton = page.locator('[data-testid="loading-skeleton"]')
    const errorState = page.locator('[data-testid="error-state"]')

    // Wait for one of the states to appear
    await expect(
      table.or(skeleton).or(errorState)
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dashboard - Full Stack (requires running backend)', () => {
  // These tests require: podman-compose up, Go backend running, Odoo initialized
  // Skip in CI or when backend is not available
  test.skip(
    !process.env.FULL_STACK_TESTS,
    'Set FULL_STACK_TESTS=1 to run with live backend'
  )

  test('employee table renders with data from API', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: process.env.TEST_AUTH_TOKEN || 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/en/dashboard/employees')
    // Should see at least one employee row
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15000 })
  })
})
