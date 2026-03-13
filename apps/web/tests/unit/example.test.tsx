import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Example component test
function TestButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>
}

describe('Button Component', () => {
  it('renders button with label', () => {
    const handleClick = () => {}
    render(<TestButton label="Click me" onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    let clicked = false
    const handleClick = () => {
      clicked = true
    }

    render(<TestButton label="Click me" onClick={handleClick} />)

    const button = screen.getByRole('button', { name: /click me/i })
    button.click()

    expect(clicked).toBe(true)
  })
})
