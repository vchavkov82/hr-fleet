import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
  })

  test('should load header', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should display main content', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Link Validation', () => {
  test('all links should have href or aria-label', async ({ page }) => {
    await page.goto('/')

    const allLinks = await page.locator('a').all()
    const invalidLinks: string[] = []

    for (const link of allLinks) {
      const href = await link.getAttribute('href')
      const ariaLabel = await link.getAttribute('aria-label')

      if (!href && !ariaLabel) {
        const text = await link.textContent()
        invalidLinks.push(`Link without href/aria-label: "${text}"`)
      }
    }

    expect(invalidLinks.length).toBe(0)
  })
})
