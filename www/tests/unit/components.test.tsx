import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Test utility component
function Button({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Card({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

describe('Button Component', () => {
  it('renders button with label', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    const button = screen.getByRole('button', { name: /click me/i })
    button.click()

    expect(handleClick).not.toHaveBeenCalled()
  })
})

describe('Card Component', () => {
  it('renders card with title and description', () => {
    render(
      <Card
        title="Test Title"
        description="Test Description"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('has proper heading structure', () => {
    render(
      <Card
        title="Test Title"
        description="Test Description"
      />
    )

    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
  })
})
