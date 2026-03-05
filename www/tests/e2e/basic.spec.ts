import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/en\/?$/)
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

  test('should navigate to hr-tools page', async ({ page }) => {
    await page.goto('/en/hr-tools')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/en/about')
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('HR Tools Pages', () => {
  test('should load salary calculator', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')
    await expect(page.locator('h1')).toContainText(/Salary|салар/i)
  })

  test('should load leave calculator', async ({ page }) => {
    await page.goto('/en/hr-tools/leave-calculator')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should load employment cost calculator', async ({ page }) => {
    await page.goto('/en/hr-tools/employment-cost-calculator')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should load templates page', async ({ page }) => {
    await page.goto('/en/hr-tools/templates')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should load AI assistant page', async ({ page }) => {
    await page.goto('/en/hr-tools/ai-assistant')
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/en/hr-tools')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/en/hr-tools')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/en/hr-tools')
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})

test.describe('Link Validation', () => {
  test('should have valid links on home page', async ({ page }) => {
    await page.goto('/en')
    const links = await page.locator('a[href]').all()
    expect(links.length).toBeGreaterThan(0)
  })

  test('should have valid links on hr-tools page', async ({ page }) => {
    await page.goto('/en/hr-tools')
    const links = await page.locator('a[href]').all()
    expect(links.length).toBeGreaterThan(0)
  })
})

test.describe('Internationalization', () => {
  test('should load Bulgarian locale', async ({ page }) => {
    await page.goto('/bg')
    await expect(page).toHaveURL(/\/bg\/?$/)
  })

  test('should load English locale', async ({ page }) => {
    await page.goto('/en')
    await expect(page).toHaveURL(/\/en\/?$/)
  })

  test('should have different content for different locales', async ({ page }) => {
    await page.goto('/en/hr-tools')
    const enContent = await page.locator('h1').textContent()

    await page.goto('/bg/hr-tools')
    const bgContent = await page.locator('h1').textContent()

    expect(enContent).not.toEqual(bgContent)
  })
})
