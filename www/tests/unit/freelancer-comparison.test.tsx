import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import FreelancerComparison from '@/components/calculators/freelancer-comparison'

/**
 * Build a complete mock labels Record with all keys used by the component.
 * Uses descriptive English strings for assertion-friendly testing.
 */
function buildMockLabels(): Record<string, string> {
  return {
    // Input section
    monthlyInvoiceAmount: 'Monthly Invoice Amount',
    bornAfter1960: 'Born after 1960',
    includeIllnessMaternity: 'Include illness/maternity',
    illnessMaternityRateNote: '3.5% rate note',
    vatRegistered: 'VAT registered',
    monthly: 'Monthly',
    annual: 'Annual',

    // Savings banner
    save: 'Save',
    perMonth: 'per month',
    perYear: 'per year',
    effectiveTaxRate: 'Effective tax rate',
    employment: 'Employment',

    // EOOD column
    eoodTitle: 'EOOD (Freelancer)',
    revenue: 'Revenue',
    selfInsurance: 'Self-insurance',
    base: 'base',
    overheadCosts: 'Overhead Costs',
    accountantFee: 'Accountant fee',
    bankFeesLabel: 'Bank fees',
    adminTimeLabel: 'Admin time',
    registrationLabel: 'Registration',
    totalOverhead: 'Total overhead',
    taxableProfit: 'Taxable profit',
    corporateTax: 'Corporate tax',
    afterTaxProfit: 'After-tax profit',
    dividendTax: 'Dividend tax',
    netToOwner: 'Net to owner',

    // VAT breakdown
    invoiceExclVat: 'Invoice excl. VAT',
    vat20: 'VAT 20%',
    totalInvoice: 'Total invoice',
    vatPassthroughNote: 'VAT is pass-through',

    // Employment column
    employmentTitle: 'Employment',
    recommended: 'Recommended',
    grossSalary: 'Gross Salary',
    employeeDeductions: 'Employee deductions',
    pension: 'Pension',
    illnessMaternity: 'Illness/Maternity',
    unemployment: 'Unemployment',
    health: 'Health',
    universalPension: 'Universal Pension',
    incomeTax: 'Income tax',
    netSalary: 'Net Salary',
    employerCost: 'Employer cost',

    // Benefits comparison
    benefitsComparison: 'Benefits Comparison',
    vacationDaysLabel: 'Vacation days',
    minDays: 'min. 20 days',
    benefit: 'Benefit',
    benefitPaidLeave: 'Paid leave',
    benefitPaidLeaveEoodNote: 'No paid leave for EOOD',
    benefitSickPay: 'Sick pay',
    benefitSickPayNote: '80% of salary',
    benefitMaternity: 'Maternity leave',
    benefitMaternityEoodNote: 'Minimum base only',
    benefitMaternityEmploymentNote: '90% of salary',
    benefitUnemployment: 'Unemployment benefits',
    benefitMortgage: 'Mortgage eligibility',
    benefitMortgageEoodNote: 'Harder to qualify',
    benefitLaborCode: 'Labor code protection',
    days: 'days',
    worth: 'worth',

    // Disclaimer
    footnoteDisclaimer: 'Disclaimer text',

    // CTA
    ctaTitle: 'Ready to switch?',
    ctaButton: 'Sign up now',
  }
}

describe('FreelancerComparison Component', () => {
  const mockLabels = buildMockLabels()

  it('renders input section with amount field, born-after-1959 checkbox, and toggles', () => {
    render(<FreelancerComparison labels={mockLabels} />)

    // Amount input label
    expect(screen.getByText('Monthly Invoice Amount')).toBeInTheDocument()

    // Number input for amount
    const numberInputs = screen.getAllByRole('spinbutton')
    expect(numberInputs.length).toBeGreaterThan(0)

    // Checkboxes: born after 1960, illness/maternity, VAT
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(3)

    // Born after 1960 label
    expect(screen.getByText('Born after 1960')).toBeInTheDocument()

    // Monthly/Annual toggle buttons
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('renders EOOD column with muted styling', () => {
    const { container } = render(<FreelancerComparison labels={mockLabels} />)

    // EOOD title visible
    const eoodHeaders = screen.getAllByText('EOOD (Freelancer)')
    expect(eoodHeaders.length).toBeGreaterThan(0)

    // EOOD column has gray/muted background
    const eoodColumn = container.querySelector('.bg-gray-50.border.border-gray-200')
    expect(eoodColumn).toBeInTheDocument()

    // Shows financial breakdown rows
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Net to owner')).toBeInTheDocument()
  })

  it('renders Employment column with highlighted styling', () => {
    const { container } = render(<FreelancerComparison labels={mockLabels} />)

    // Employment title visible
    const empHeaders = screen.getAllByText('Employment')
    expect(empHeaders.length).toBeGreaterThan(0)

    // Employment column has green highlighted background
    const empColumn = container.querySelector('.bg-green-50.border-2.border-green-300')
    expect(empColumn).toBeInTheDocument()

    // Recommended badge
    expect(screen.getByText('Recommended')).toBeInTheDocument()

    // Shows employment breakdown
    expect(screen.getByText('Gross Salary')).toBeInTheDocument()
    expect(screen.getByText('Net Salary')).toBeInTheDocument()
  })

  it('renders savings banner with savings amount text', () => {
    const { container } = render(<FreelancerComparison labels={mockLabels} />)

    // Savings banner with green background
    const savingsBanner = container.querySelector('.bg-green-50.border.border-green-200')
    expect(savingsBanner).toBeInTheDocument()

    // "Save" text is rendered (actual amount is dynamic)
    expect(screen.getAllByText(/Save/).length).toBeGreaterThan(0)
  })

  it('renders benefits comparison table with all 6 rows', () => {
    render(<FreelancerComparison labels={mockLabels} />)

    // Section heading
    expect(screen.getByText('Benefits Comparison')).toBeInTheDocument()

    // All 6 benefit rows
    expect(screen.getByText('Paid leave')).toBeInTheDocument()
    expect(screen.getByText('Sick pay')).toBeInTheDocument()
    expect(screen.getByText('Maternity leave')).toBeInTheDocument()
    expect(screen.getByText('Unemployment benefits')).toBeInTheDocument()
    expect(screen.getByText('Mortgage eligibility')).toBeInTheDocument()
    expect(screen.getByText('Labor code protection')).toBeInTheDocument()
  })

  it('renders CTA section with sign-up link', () => {
    render(<FreelancerComparison labels={mockLabels} />)

    // CTA title
    expect(screen.getByText('Ready to switch?')).toBeInTheDocument()

    // CTA buttons (desktop + mobile sticky)
    const ctaButtons = screen.getAllByText('Sign up now')
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1)

    // CTA links to sign-up
    const links = screen.getAllByRole('link')
    const signUpLinks = links.filter(
      (link) => link.getAttribute('href') === '/auth/sign-up',
    )
    expect(signUpLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders editable overhead fields (accountant, bank, admin, registration)', () => {
    render(<FreelancerComparison labels={mockLabels} />)

    // Overhead section heading
    expect(screen.getByText('Overhead Costs')).toBeInTheDocument()

    // Overhead field labels
    expect(screen.getByText('Accountant fee')).toBeInTheDocument()
    expect(screen.getByText('Bank fees')).toBeInTheDocument()
    expect(screen.getByText('Admin time')).toBeInTheDocument()
    expect(screen.getByText('Registration')).toBeInTheDocument()

    // Overhead fields are editable number inputs (4 overhead + 1 main amount + 1 vacation)
    const allInputs = screen.getAllByRole('spinbutton')
    expect(allInputs.length).toBeGreaterThanOrEqual(6)
  })

  it('renders vacation days input in benefits section', () => {
    render(<FreelancerComparison labels={mockLabels} />)

    // Vacation days label
    expect(screen.getByText('Vacation days')).toBeInTheDocument()

    // Min days note
    expect(screen.getByText('min. 20 days')).toBeInTheDocument()

    // Vacation days input exists and defaults to 20
    const vacationInput = screen.getAllByRole('spinbutton').find(
      (input) => (input as HTMLInputElement).value === '20',
    )
    expect(vacationInput).toBeDefined()
  })
})
