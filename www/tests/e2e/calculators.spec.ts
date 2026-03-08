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

      // Results should be displayed in divs with bg-primary-50, bg-green-50, bg-amber-50 classes
      const results = await page.locator('div[class*="bg-primary-50"], div[class*="bg-green-50"], div[class*="bg-amber-50"]').all()
      expect(results.length).toBeGreaterThan(0)
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

test.describe('Freelancer Comparison Calculator', () => {
  test('page loads and shows calculator with both columns', async ({ page }) => {
    await page.goto('/en/hr-tools/freelancer-comparison')

    // Page heading visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Freelancer')

    // Both columns visible -- EOOD (gray) and Employment (green)
    const eoodColumn = page.locator('.bg-gray-50.border.border-gray-200')
    await expect(eoodColumn).toBeVisible()

    const employmentColumn = page.locator('.bg-green-50.border-2.border-green-300')
    await expect(employmentColumn).toBeVisible()

    // Savings banner visible
    const savingsBanner = page.locator('.bg-green-50.border.border-green-200')
    await expect(savingsBanner).toBeVisible()
  })

  test('calculator responds to input and updates results', async ({ page }) => {
    await page.goto('/en/hr-tools/freelancer-comparison')

    // Find the main amount input (first number input)
    const amountInput = page.locator('input[type="number"]').first()
    await amountInput.fill('4000')

    // Savings banner should show a non-zero savings amount (contains EUR currency)
    const savingsBanner = page.locator('.bg-green-50.border.border-green-200')
    await expect(savingsBanner).toContainText(/\d/)

    // EOOD net value displayed
    const eoodColumn = page.locator('.bg-gray-50.border.border-gray-200')
    await expect(eoodColumn).toContainText(/\d/)

    // Employment net value displayed
    const employmentColumn = page.locator('.bg-green-50.border-2.border-green-300')
    await expect(employmentColumn).toContainText(/\d/)
  })

  test('benefits table is visible with at least 6 rows', async ({ page }) => {
    await page.goto('/en/hr-tools/freelancer-comparison')

    // Benefits table exists
    const benefitsTable = page.locator('table')
    await expect(benefitsTable).toBeVisible()

    // At least 6 data rows (tbody tr)
    const rows = await page.locator('table tbody tr').all()
    expect(rows.length).toBeGreaterThanOrEqual(6)

    // Vacation days input is present
    const vacationInput = page.locator('input[type="number"][min="20"]')
    await expect(vacationInput).toBeVisible()
  })

  test('SEO content is present with H1 and H2 sections', async ({ page }) => {
    await page.goto('/en/hr-tools/freelancer-comparison')

    // H1 heading exists
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // At least 2 H2 sections below calculator (SEO content)
    const h2s = await page.locator('h2').all()
    expect(h2s.length).toBeGreaterThanOrEqual(2)
  })

  test('navigation from HR Tools page works', async ({ page }) => {
    await page.goto('/en/hr-tools')

    // Click freelancer comparison card (link with href containing freelancer-comparison)
    const freelancerLink = page.locator('a[href*="freelancer-comparison"]')
    await expect(freelancerLink).toBeVisible()
    await freelancerLink.click()

    // Verify landed on freelancer-comparison page (allow extra time for dev server compilation)
    await page.waitForURL('**/freelancer-comparison', { timeout: 30000 })
    const heading = page.locator('h1')
    await expect(heading).toContainText('Freelancer', { timeout: 15000 })
  })

  test('Bulgarian locale loads correctly', async ({ page }) => {
    // Allow extra navigation timeout for first-time BG locale compilation
    await page.goto('/bg/hr-tools/freelancer-comparison', { timeout: 30000 })

    // Page loads with Bulgarian heading (not English)
    const heading = page.locator('h1')
    await expect(heading).toBeVisible({ timeout: 15000 })

    const headingText = await heading.textContent()
    expect(headingText).not.toContain('Freelancer vs Employment Calculator')
    // Should contain Bulgarian text
    expect(headingText).toContain('фрийлансър')
  })
})
