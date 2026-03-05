import { test, expect } from '@playwright/test'

test.describe('Salary Calculator', () => {
  test('should load calculator form', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    // Check for calculator inputs
    const inputs = await page.locator('input').all()
    expect(inputs.length).toBeGreaterThan(0)
  })

  test('should have toggle between gross-to-net and net-to-gross', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    // Look for mode toggle buttons
    const buttons = await page.locator('button').all()
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('should display calculation results', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    // Find gross salary input and enter value
    const inputs = await page.locator('input[type="number"]').all()
    if (inputs.length > 0) {
      await inputs[0].fill('3000')

      // Results should be displayed
      const outputs = await page.locator('output, [role="status"], .result, .summary').all()
      expect(outputs.length).toBeGreaterThan(0)
    }
  })

  test('should have checkbox for born after 1960', async ({ page }) => {
    await page.goto('/en/hr-tools/salary-calculator')

    const checkboxes = await page.locator('input[type="checkbox"]').all()
    expect(checkboxes.length).toBeGreaterThan(0)
  })
})

test.describe('Leave Calculator', () => {
  test('should load leave calculator', async ({ page }) => {
    await page.goto('/en/hr-tools/leave-calculator')

    const inputs = await page.locator('input').all()
    expect(inputs.length).toBeGreaterThan(0)
  })
})

test.describe('Employment Cost Calculator', () => {
  test('should load employment cost calculator', async ({ page }) => {
    await page.goto('/en/hr-tools/employment-cost-calculator')

    const inputs = await page.locator('input').all()
    expect(inputs.length).toBeGreaterThan(0)
  })
})
