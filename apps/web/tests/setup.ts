import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup, render, RenderOptions } from '@testing-library/react'
import * as React from 'react'
import { ReactElement } from 'react'

// Make React globally available for JSX
globalThis.React = React

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations() {
    return (key: string) => key
  },
  useLocale() {
    return 'en'
  },
}))

// Mock @/navigation
vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}))

/**
 * Custom render function that wraps components with providers.
 * Use this for components that need context providers.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string
  pathname?: string
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { locale = 'en', pathname = '/', ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children)
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Create a mock API response factory
 */
export function createMockResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }
}

/**
 * Mock fetch for API testing
 */
export function mockFetch(responses: Record<string, unknown>) {
  return vi.fn().mockImplementation((url: string) => {
    const response = responses[url]
    if (response) {
      return Promise.resolve(createMockResponse(response))
    }
    return Promise.resolve(createMockResponse({ error: 'Not found' }, 404))
  })
}

/**
 * Wait for async operations in tests
 */
export async function waitForAsync(ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock employee data factory
 */
export function createMockEmployee(overrides = {}) {
  return {
    id: 1,
    name: 'Test Employee',
    workEmail: 'test@example.com',
    jobTitle: 'Developer',
    department: { id: 1, name: 'Engineering' },
    job: { id: 1, name: 'Developer' },
    manager: null,
    workPhone: '+1234567890',
    mobilePhone: '',
    employeeType: 'employee' as const,
    active: true,
    createDate: '2024-01-01',
    writeDate: '2024-01-01',
    ...overrides,
  }
}

/**
 * Mock dashboard metrics data factory
 */
export function createMockMetrics(overrides = {}) {
  return {
    totalEmployees: 100,
    activeEmployees: 95,
    newHires: 5,
    onLeave: 3,
    pendingApprovals: 2,
    ...overrides,
  }
}

// Re-export testing utilities
export { render, cleanup }
export * from '@testing-library/react'
