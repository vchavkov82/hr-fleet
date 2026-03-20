import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { DashboardMetricCards } from '@/components/dashboard/dashboard-metric-cards'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

describe('DashboardMetricCards', () => {
  const defaultLabels = {
    totalEmployees: 'Total Employees',
    pendingLeave: 'Pending Leave',
    recentHires: 'Recent Hires',
    openPositions: 'Open Positions',
    vsLastMonth: 'vs last month',
  }

  it('renders all four metric cards', () => {
    render(<DashboardMetricCards labels={defaultLabels} totalEmployees={100} />)

    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('Pending Leave')).toBeInTheDocument()
    expect(screen.getByText('Recent Hires')).toBeInTheDocument()
    expect(screen.getByText('Open Positions')).toBeInTheDocument()
  })

  it('accepts numeric total employees value', () => {
    const { container } = render(<DashboardMetricCards labels={defaultLabels} totalEmployees={150} />)
    expect(container.textContent).toContain('Total Employees')
  })

  it('displays total employees as string when provided', () => {
    render(<DashboardMetricCards labels={defaultLabels} totalEmployees="N/A" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('displays all metric labels', () => {
    const { container } = render(<DashboardMetricCards labels={defaultLabels} totalEmployees={100} />)
    const cardTexts = container.textContent || ''
    expect(cardTexts).toContain('Total Employees')
    expect(cardTexts).toContain('Pending Leave')
    expect(cardTexts).toContain('Recent Hires')
    expect(cardTexts).toContain('Open Positions')
  })

  it('renders trend labels', () => {
    render(<DashboardMetricCards labels={defaultLabels} totalEmployees={100} />)
    const trendLabels = screen.getAllByText('vs last month')
    expect(trendLabels.length).toBeGreaterThan(0)
  })

  it('renders in a grid layout', () => {
    const { container } = render(
      <DashboardMetricCards labels={defaultLabels} totalEmployees={100} />
    )
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid?.classList.contains('grid-cols-1')).toBe(true)
  })

  it('displays icons for each metric', () => {
    const { container } = render(
      <DashboardMetricCards labels={defaultLabels} totalEmployees={100} />
    )
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(4)
  })
})
