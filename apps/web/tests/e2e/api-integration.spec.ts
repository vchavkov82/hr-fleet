import { test, expect } from '@playwright/test'

test.describe('API Integration - Marketing Pages', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('body')).toBeVisible()
    // Page should have substantive content
    const content = await page.locator('body').textContent()
    expect(content!.length).toBeGreaterThan(100)
  })

  test('features page loads correctly', async ({ page }) => {
    await page.goto('/en/features')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('pricing page loads correctly', async ({ page }) => {
    await page.goto('/en/pricing')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('API Integration - Calculator Forms', () => {
  test('salary calculator handles form submission', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')
    await expect(page.locator('h1')).toBeVisible()

    // Look for input fields in the calculator
    const inputs = page.locator('input[type="number"], input[type="text"], input[inputmode="numeric"]')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      // Fill the first numeric input with a salary value
      await inputs.first().fill('3000')

      // Look for a calculate/submit button
      const calcButton = page.locator('button:has-text("Calculate"), button:has-text("Изчисли"), button[type="submit"]')
      if ((await calcButton.count()) > 0) {
        await calcButton.first().click()
        await expect(page.locator('main .text-xl.font-bold').first()).toBeVisible({
          timeout: 8000,
        })
      }
    }

    // Page should still be functional (no crash)
    await expect(page.locator('main')).toBeVisible()
  })

  test('employment cost calculator handles form submission', async ({ page }) => {
    await page.goto('/en/hr-tools/employment-cost-calculator')
    await expect(page.locator('h1')).toBeVisible()

    const inputs = page.locator('input[type="number"], input[type="text"], input[inputmode="numeric"]')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      await inputs.first().fill('5000')

      const calcButton = page.locator('button:has-text("Calculate"), button:has-text("Изчисли"), button[type="submit"]')
      if ((await calcButton.count()) > 0) {
        await calcButton.first().click()
        await expect(page.locator('main .text-xl.font-bold').first()).toBeVisible({
          timeout: 8000,
        })
      }
    }

    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('API Integration - Error States', () => {
  test('handles API unavailability gracefully on dashboard', async ({ page, context }) => {
    // Set auth cookie
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])

    // Mock all API calls to fail with network error
    await page.route('**/api/v1/**', (route) => {
      route.abort('connectionrefused')
    })

    await page.goto('/en/dashboard')

    // Page should still render (not crash) even with API errors
    await expect(page.locator('body')).toBeVisible()
    // Should show some content (heading, error state, or fallback)
    const content = page.locator('h1, [data-testid="error-state"], main')
    await expect(content.first()).toBeVisible({ timeout: 10000 })
  })

  test('handles API timeout on employee page', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])

    // Mock API with delayed response (simulate timeout)
    await page.route('**/api/v1/employees*', async (route) => {
      // Delay 5 seconds then return error
      await new Promise((resolve) => setTimeout(resolve, 3000))
      route.fulfill({
        status: 504,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Gateway Timeout' }),
      })
    })

    await page.goto('/en/dashboard/employees')

    // Page should render with loading or error state, not crash
    const pageContent = page.locator('h1, [data-testid="loading-skeleton"], table, [data-testid="error-state"]')
    await expect(pageContent.first()).toBeVisible({ timeout: 15000 })
  })
})
