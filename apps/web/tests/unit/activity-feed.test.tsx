import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
  },
}))

import ActivityFeed from '@/components/dashboard/activity-feed'

describe('ActivityFeed', () => {
  it('renders the title', () => {
    render(<ActivityFeed title="Recent Activity" />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders "View all" button', () => {
    render(<ActivityFeed title="Recent Activity" />)
    expect(screen.getByText('View all')).toBeInTheDocument()
  })

  it('renders activity items', () => {
    render(<ActivityFeed title="Recent Activity" />)

    expect(screen.getByText('Nikolay Stoyanov')).toBeInTheDocument()
    expect(screen.getByText('Maria Ivanova')).toBeInTheDocument()
    expect(screen.getByText('Ivan Petrov')).toBeInTheDocument()
    expect(screen.getByText('Elena Todorova')).toBeInTheDocument()
  })

  it('renders activity descriptions', () => {
    render(<ActivityFeed title="Recent Activity" />)

    expect(screen.getByText('joined as QA Engineer')).toBeInTheDocument()
    expect(screen.getByText('requested 5 days leave')).toBeInTheDocument()
    expect(screen.getByText('promoted to Tech Lead')).toBeInTheDocument()
  })

  it('renders time stamps', () => {
    render(<ActivityFeed title="Recent Activity" />)

    expect(screen.getByText('2h ago')).toBeInTheDocument()
    expect(screen.getByText('4h ago')).toBeInTheDocument()
    expect(screen.getAllByText('1d ago').length).toBe(2)
  })

  it('renders avatar initials', () => {
    render(<ActivityFeed title="Recent Activity" />)

    expect(screen.getByText('NS')).toBeInTheDocument()
    expect(screen.getByText('MI')).toBeInTheDocument()
    expect(screen.getByText('IP')).toBeInTheDocument()
    expect(screen.getByText('ET')).toBeInTheDocument()
  })

  it('renders all 6 activity items', () => {
    render(<ActivityFeed title="Recent Activity" />)

    const avatars = ['NS', 'MI', 'IP', 'ET', 'DK', 'PA']
    avatars.forEach((avatar) => {
      expect(screen.getByText(avatar)).toBeInTheDocument()
    })
  })

  it('renders activity type icons', () => {
    const { container } = render(<ActivityFeed title="Recent Activity" />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(6)
  })

  it('has correct structure for activity items', () => {
    const { container } = render(<ActivityFeed title="Recent Activity" />)

    const hireBackground = container.querySelector('.bg-emerald-50')
    const leaveBackground = container.querySelector('.bg-amber-50')
    const promotionBackground = container.querySelector('.bg-violet-50')

    expect(hireBackground).toBeInTheDocument()
    expect(leaveBackground).toBeInTheDocument()
    expect(promotionBackground).toBeInTheDocument()
  })
})
