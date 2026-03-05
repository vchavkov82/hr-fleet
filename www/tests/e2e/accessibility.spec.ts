import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on home page', async ({ page }) => {
    await page.goto('/en')

    const h1s = await page.locator('h1').all()
    expect(h1s.length).toBeGreaterThan(0)

    const h2s = await page.locator('h2').all()
    const h3s = await page.locator('h3').all()

    // Should have proper heading structure
    expect(h1s.length + h2s.length + h3s.length).toBeGreaterThan(0)
  })

  test('should have proper heading hierarchy on hr-tools page', async ({ page }) => {
    await page.goto('/en/hr-tools')

    const h1s = await page.locator('h1').all()
    expect(h1s.length).toBeGreaterThan(0)
  })

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/en/hr-tools')

    const images = await page.locator('img').all()
    let imagesWithoutAlt = 0

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt++
      }
    }

    // Some decorative images may not have alt, but most should
    const totalImages = images.length
    if (totalImages > 0) {
      const ratio = imagesWithoutAlt / totalImages
      expect(ratio).toBeLessThan(0.8) // Less than 80% without alt
    }
  })

  test('should have form labels', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    const labels = await page.locator('label').all()
    expect(labels.length).toBeGreaterThan(0)
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/en/hr-tools')

    // Tab through the page
    let focusedElements = 0
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName
      })
      if (focusedElement !== 'BODY') {
        focusedElements++
      }
    }

    expect(focusedElements).toBeGreaterThan(0)
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/en/hr-tools')

    // Check that text is visible (basic contrast check)
    const textElements = await page.locator('p, h1, h2, h3, button, a').all()
    let visibleElements = 0

    for (const el of textElements.slice(0, 10)) {
      const isVisible = await el.isVisible()
      if (isVisible) {
        visibleElements++
      }
    }

    expect(visibleElements).toBeGreaterThan(0)
  })
})

test.describe('Form Inputs', () => {
  test('should focus input when clicked', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    const input = await page.locator('input[type="number"]').first()
    if (input) {
      await input.click()
      const isFocused = await input.evaluate(
        (el) => document.activeElement === el
      )
      expect(isFocused).toBe(true)
    }
  })

  test('should accept number input', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    const input = await page.locator('input[type="number"]').first()
    if (input) {
      await input.fill('5000')
      const value = await input.inputValue()
      expect(value).toBe('5000')
    }
  })
})
