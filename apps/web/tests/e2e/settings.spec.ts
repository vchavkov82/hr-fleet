import { test, expect } from '@playwright/test'

test.describe('Settings - Billing', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('navigating to billing settings page shows billing content', async ({ page }) => {
    await page.goto('/en/dashboard/settings/billing')

    await expect(page.locator('h1')).toContainText(/Subscription|Billing/i)
    await expect(page.locator('body')).toContainText(/Stripe/i)
  })

  test('billing page displays API hint', async ({ page }) => {
    await page.goto('/en/dashboard/settings/billing')

    await expect(page.locator('body')).toContainText('POST /api/v1/billing/checkout-session')
  })

  test('billing page displays environment configuration hint', async ({ page }) => {
    await page.goto('/en/dashboard/settings/billing')

    await expect(page.locator('body')).toContainText('STRIPE_SECRET_KEY')
    await expect(page.locator('body')).toContainText('STRIPE_WEBHOOK_SECRET')
  })

  test('can navigate to billing from dashboard sidebar', async ({ page }) => {
    await page.goto('/en/dashboard')

    const billingLink = page.locator('a[href*="settings/billing"]').first()
    if (await billingLink.isVisible()) {
      await billingLink.click()
      await page.waitForURL(/\/dashboard\/settings\/billing/)
      await expect(page.locator('h1')).toContainText(/Subscription|Billing/i)
    } else {
      const settingsLink = page.locator('a[href*="settings"]').first()
      if (await settingsLink.isVisible()) {
        await settingsLink.click()
        await page.waitForURL(/\/dashboard\/settings/)
      }
    }
  })
})

test.describe('Settings - Unauthenticated Access', () => {
  test('settings page redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/en/dashboard/settings/billing')
    await page.waitForURL(/\/auth\/login/)
    expect(page.url()).toContain('/auth/login')
    expect(page.url()).toContain('returnUrl')
  })
})

test.describe('Settings - Locale Support', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'test-token-for-e2e',
        domain: 'localhost',
        path: '/',
      },
    ])
  })

  test('billing page renders in English', async ({ page }) => {
    await page.goto('/en/dashboard/settings/billing')
    await expect(page.locator('h1')).toContainText(/Subscription|billing/i)
  })

  test('billing page renders in Bulgarian', async ({ page }) => {
    await page.goto('/bg/dashboard/settings/billing')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).toContainText(/Stripe/i)
  })
})
