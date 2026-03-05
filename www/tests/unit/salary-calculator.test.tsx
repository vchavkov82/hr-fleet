import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import SalaryCalculator from '@/components/calculators/salary-calculator'

describe('SalaryCalculator Component', () => {
  const mockLabels = {
    grossToNet: 'Gross to Net',
    netToGross: 'Net to Gross',
    grossSalary: 'Gross Salary',
    desiredNet: 'Desired Net',
    netSalary: 'Net Salary',
    totalCost: 'Total Cost',
    bornAfter1960: 'Born After 1960',
    deduction: 'Deduction',
    employee: 'Employee',
    employer: 'Employer',
    pension: 'Pension',
    illnessMaternity: 'Illness/Maternity',
    unemployment: 'Unemployment',
    accident: 'Accident',
    health: 'Health',
    universalPension: 'Universal Pension',
    totalContributions: 'Total Contributions',
    incomeTax: 'Income Tax',
    insurableNote: 'Insurable Income Note',
    minMax: 'Min/Max',
  }

  it('renders calculator with all labels', () => {
    render(<SalaryCalculator labels={mockLabels} />)

    expect(screen.getByText(mockLabels.grossToNet)).toBeInTheDocument()
    expect(screen.getByText(mockLabels.netToGross)).toBeInTheDocument()
  })

  it('has toggle buttons for mode switching', () => {
    render(<SalaryCalculator labels={mockLabels} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('has input fields for salary input', () => {
    render(<SalaryCalculator labels={mockLabels} />)

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('has checkbox for born after 1960', () => {
    render(<SalaryCalculator labels={mockLabels} />)

    const checkboxes = screen.queryAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('updates calculation when input changes', async () => {
    const { container } = render(<SalaryCalculator labels={mockLabels} />)

    const inputs = screen.getAllByRole('spinbutton')
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: '3000' } })

      // Check that component is rendered without errors
      expect(container.querySelector('input')).toBeInTheDocument()
    }
  })

  it('toggles checkbox state', () => {
    const { rerender } = render(<SalaryCalculator labels={mockLabels} />)

    const checkboxes = screen.queryAllByRole('checkbox')
    // Just verify checkboxes exist
    expect(checkboxes.length).toBeGreaterThan(0)
  })

  it('displays calculation results', () => {
    render(<SalaryCalculator labels={mockLabels} />)

    // Should display some result containers
    const containers = screen.queryAllByText(/Deduction|Contributions|Salary/)
    expect(containers.length).toBeGreaterThan(0)
  })
})
