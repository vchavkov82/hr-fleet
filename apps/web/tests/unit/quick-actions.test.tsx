import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
  usePathname: () => '/dashboard',
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
  },
}))

import QuickActions from '@/components/dashboard/quick-actions'

describe('QuickActions', () => {
  it('renders the title', () => {
    render(<QuickActions title="Quick Actions" />)
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('renders all action items', () => {
    render(<QuickActions title="Quick Actions" />)

    expect(screen.getByText('Add Employee')).toBeInTheDocument()
    expect(screen.getByText('View Directory')).toBeInTheDocument()
    expect(screen.getByText('Request Leave')).toBeInTheDocument()
    expect(screen.getByText('Run Payroll')).toBeInTheDocument()
  })

  it('renders descriptions for actions', () => {
    render(<QuickActions title="Quick Actions" />)

    expect(screen.getByText('Onboard a new team member')).toBeInTheDocument()
    expect(screen.getByText('Browse all employees')).toBeInTheDocument()
    expect(screen.getByText('Submit a leave request')).toBeInTheDocument()
    expect(screen.getByText('Process monthly payroll')).toBeInTheDocument()
  })

  it('shows "Soon" badge for disabled actions', () => {
    render(<QuickActions title="Quick Actions" />)
    const soonBadges = screen.getAllByText('Soon')
    expect(soonBadges.length).toBe(2)
  })

  it('renders enabled actions as links', () => {
    render(<QuickActions title="Quick Actions" />)
    const addEmployeeLink = screen.getByText('Add Employee').closest('a')
    expect(addEmployeeLink).toHaveAttribute('href', '/dashboard/employees/new')
  })

  it('renders in a grid layout', () => {
    const { container } = render(<QuickActions title="Quick Actions" />)
    const grid = container.querySelector('.grid-cols-2')
    expect(grid).toBeInTheDocument()
  })

  it('displays icons for each action', () => {
    const { container } = render(<QuickActions title="Quick Actions" />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(4)
  })

  it('applies different colors to each action', () => {
    const { container } = render(<QuickActions title="Quick Actions" />)

    const primaryElement = container.querySelector('.text-primary')
    const violetElement = container.querySelector('.text-violet-600')
    const amberElement = container.querySelector('.text-amber-600')
    const emeraldElement = container.querySelector('.text-emerald-600')

    expect(primaryElement).toBeInTheDocument()
    expect(violetElement).toBeInTheDocument()
    expect(amberElement).toBeInTheDocument()
    expect(emeraldElement).toBeInTheDocument()
  })
})
