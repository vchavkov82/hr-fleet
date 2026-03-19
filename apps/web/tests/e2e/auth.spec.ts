import { test, expect } from '@playwright/test'

test.describe('Auth - Login Page', () => {
  test('login page renders with form fields', async ({ page }) => {
    await page.goto('/en/auth/login')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login with mocked API redirects to dashboard', async ({ page, context }) => {
    // Mock successful login response
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        }),
      })
    })

    // Set auth cookie so dashboard middleware doesn't redirect back
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock-access-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/en/auth/login')

    await page.fill('input#email', 'admin@hr.dev')
    await page.fill('input#password', 'HrDev2024!')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('login shows error on failed authentication (401)', async ({ page }) => {
    // Mock failed login response
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid email or password.',
        }),
      })
    })

    await page.goto('/en/auth/login')

    await page.fill('input#email', 'wrong@example.com')
    await page.fill('input#password', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Error message should appear
    const errorMessage = page.locator('text=Invalid email or password')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })

  test('login shows network error when API unreachable', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/auth/login', (route) => {
      route.abort('connectionrefused')
    })

    await page.goto('/en/auth/login')

    await page.fill('input#email', 'admin@hr.dev')
    await page.fill('input#password', 'HrDev2024!')
    await page.click('button[type="submit"]')

    // Network error message should appear
    const errorMessage = page.locator('text=Network error')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })
})
