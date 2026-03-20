import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

import SidebarNav from '@/components/dashboard/sidebar-nav'

describe('SidebarNav', () => {
  it('renders navigation items', () => {
    render(<SidebarNav />)
    expect(screen.getByText('overview')).toBeInTheDocument()
    expect(screen.getByText('employees')).toBeInTheDocument()
  })

  it('renders the logo section', () => {
    render(<SidebarNav />)
    expect(screen.getByText('HR')).toBeInTheDocument()
    expect(screen.getByText('HR Platform')).toBeInTheDocument()
  })

  it('renders user section', () => {
    render(<SidebarNav />)
    expect(screen.getByText('Elena Todorova')).toBeInTheDocument()
    expect(screen.getByText('HR Officer')).toBeInTheDocument()
  })

  it('shows "Soon" badge for disabled items', () => {
    render(<SidebarNav />)
    const soonBadges = screen.getAllByText('Soon')
    expect(soonBadges.length).toBeGreaterThan(0)
  })

  it('renders mobile hamburger button', () => {
    render(<SidebarNav />)
    const hamburger = screen.getByRole('button', { name: /toggle navigation/i })
    expect(hamburger).toBeInTheDocument()
  })

  it('toggles mobile navigation on click', () => {
    render(<SidebarNav />)
    const hamburger = screen.getByRole('button', { name: /toggle navigation/i })

    fireEvent.click(hamburger)
    const overlay = document.querySelector('.backdrop-blur-sm')
    expect(overlay).toBeInTheDocument()
  })

  it('closes mobile navigation when clicking overlay', () => {
    render(<SidebarNav />)
    const hamburger = screen.getByRole('button', { name: /toggle navigation/i })

    fireEvent.click(hamburger)
    const overlay = document.querySelector('.backdrop-blur-sm')
    if (overlay) {
      fireEvent.click(overlay)
    }
    const closedOverlay = document.querySelector('.backdrop-blur-sm')
    expect(closedOverlay).not.toBeInTheDocument()
  })

  it('renders settings section', () => {
    render(<SidebarNav />)
    const settingsLabels = screen.getAllByText('settings')
    expect(settingsLabels.length).toBeGreaterThan(0)
  })

  it('shows employee count badge', () => {
    render(<SidebarNav />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
