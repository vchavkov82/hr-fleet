import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginForm from '@/app/[locale]/auth/login/LoginForm'
import SignUpForm from '@/app/[locale]/auth/sign-up/SignUpForm'

const mockReplace = vi.fn()
vi.mock('@/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe('LoginForm', () => {
  const defaultProps = {
    emailLabel: 'Email',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    submit: 'Sign in',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders all form elements', () => {
    render(<LoginForm {...defaultProps} />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find((btn) => btn.getAttribute('tabindex') === '-1')
    expect(toggleButton).toBeDefined()

    if (toggleButton) {
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    }
  })

  it('submits valid form and stores tokens', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    await waitFor(() => {
      expect(localStorage.getItem('jobs_access_token')).toBe('test-access-token')
      expect(localStorage.getItem('jobs_refresh_token')).toBe('test-refresh-token')
    })

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays server error on failed login', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { message: 'Invalid credentials' },
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('displays network error message', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })

  it('calls onSwitchToSignUp when provided', async () => {
    const user = userEvent.setup()
    const onSwitchToSignUp = vi.fn()
    render(<LoginForm {...defaultProps} onSwitchToSignUp={onSwitchToSignUp} />)

    await user.click(screen.getByText('Sign up'))
    expect(onSwitchToSignUp).toHaveBeenCalled()
  })

  it('renders link to sign up when onSwitchToSignUp not provided', () => {
    render(<LoginForm {...defaultProps} />)

    const signUpLink = screen.getByText('Sign up')
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/auth/sign-up')
  })

  it('allows typing in email field', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'user@test.com')
    expect(emailInput).toHaveValue('user@test.com')
  })

  it('allows checking remember me', async () => {
    const user = userEvent.setup()
    render(<LoginForm {...defaultProps} />)

    const checkbox = screen.getByLabelText('Remember me')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})

describe('SignUpForm', () => {
  const defaultProps = {
    plan: 'starter',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    companyLabel: 'Company',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    termsText: 'I agree to the',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    submitFree: 'Get started free',
    submitTrial: 'Start trial',
    noCardNote: 'No credit card required',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders all form elements', () => {
    render(<SignUpForm {...defaultProps} />)

    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(screen.getByLabelText('Company')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText(/I agree to the/)).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get started free' })).toBeInTheDocument()
    expect(screen.getByText('No credit card required')).toBeInTheDocument()
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
  })

  it('shows password strength indicator', async () => {
    const user = userEvent.setup()
    render(<SignUpForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Password'), 'password')
    expect(screen.getByText('Weak')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'password1')
    expect(screen.getByText('Fair')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'Password1')
    expect(screen.getByText('Good')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'Password1!')
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<SignUpForm {...defaultProps} />)

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find((btn) => btn.getAttribute('tabindex') === '-1')
    expect(toggleButton).toBeDefined()

    if (toggleButton) {
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    }
  })

  it('submits valid form and stores tokens', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<SignUpForm {...defaultProps} />)

    await user.type(screen.getByLabelText('First name'), 'John')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Company'), 'Acme Inc')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Get started free' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    await waitFor(() => {
      expect(localStorage.getItem('jobs_access_token')).toBe('test-access-token')
      expect(localStorage.getItem('jobs_refresh_token')).toBe('test-refresh-token')
    })

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays server error on failed registration', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { message: 'Email already exists' },
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<SignUpForm {...defaultProps} />)

    await user.type(screen.getByLabelText('First name'), 'John')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Company'), 'Acme Inc')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Get started free' }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('displays network error message', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    render(<SignUpForm {...defaultProps} />)

    await user.type(screen.getByLabelText('First name'), 'John')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Company'), 'Acme Inc')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Get started free' }))

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
    })
  })

  it('calls onSwitchToLogin when provided', async () => {
    const user = userEvent.setup()
    const onSwitchToLogin = vi.fn()
    render(<SignUpForm {...defaultProps} onSwitchToLogin={onSwitchToLogin} />)

    await user.click(screen.getByText('Sign in'))
    expect(onSwitchToLogin).toHaveBeenCalled()
  })

  it('renders link to login when onSwitchToLogin not provided', () => {
    render(<SignUpForm {...defaultProps} />)

    const loginLink = screen.getByText('Sign in')
    expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/login')
  })

  it('shows plan info for growth plan', () => {
    render(
      <SignUpForm
        {...defaultProps}
        plan="growth"
        selectedPlan="Selected plan:"
        growthPlan="Growth"
        trialNote="14-day free trial"
      />
    )

    expect(screen.getByText(/Selected plan:/)).toBeInTheDocument()
    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getByText(/14-day free trial/)).toBeInTheDocument()
  })

  it('shows correct submit button for growth plan', () => {
    render(<SignUpForm {...defaultProps} plan="growth" />)

    expect(screen.getByRole('button', { name: 'Start trial' })).toBeInTheDocument()
  })

  it('hides plan info for starter plan', () => {
    render(<SignUpForm {...defaultProps} plan="starter" selectedPlan="Selected plan:" />)

    expect(screen.queryByText(/Selected plan:/)).not.toBeInTheDocument()
  })

  it('allows typing in all input fields', async () => {
    const user = userEvent.setup()
    render(<SignUpForm {...defaultProps} />)

    await user.type(screen.getByLabelText('First name'), 'Jane')
    expect(screen.getByLabelText('First name')).toHaveValue('Jane')

    await user.type(screen.getByLabelText('Last name'), 'Smith')
    expect(screen.getByLabelText('Last name')).toHaveValue('Smith')

    await user.type(screen.getByLabelText('Company'), 'Test Corp')
    expect(screen.getByLabelText('Company')).toHaveValue('Test Corp')

    await user.type(screen.getByLabelText('Email'), 'jane@test.com')
    expect(screen.getByLabelText('Email')).toHaveValue('jane@test.com')
  })
})
