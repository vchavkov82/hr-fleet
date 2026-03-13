import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Form Validation with Zod', () => {
  describe('Time-Off Request Validation', () => {
    const timeOffSchema = z.object({
      startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid start date format',
      }),
      endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid end date format',
      }),
      type: z.enum(['vacation', 'sick', 'personal']),
      reason: z.string().optional(),
    })

    it('validates correct time-off request', () => {
      const validRequest = {
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        type: 'vacation' as const,
      }

      const result = timeOffSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('rejects invalid start date', () => {
      const invalidRequest = {
        startDate: 'invalid-date',
        endDate: '2024-03-20',
        type: 'vacation' as const,
      }

      const result = timeOffSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('rejects invalid type', () => {
      const invalidRequest = {
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        type: 'invalid' as any,
      }

      const result = timeOffSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('allows optional reason', () => {
      const requestWithReason = {
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        type: 'sick' as const,
        reason: 'Medical appointment',
      }

      const result = timeOffSchema.safeParse(requestWithReason)
      expect(result.success).toBe(true)
    })
  })

  describe('Salary Input Validation', () => {
    const salarySchema = z.object({
      grossSalary: z.number().positive('Salary must be positive'),
      bornAfter1960: z.boolean().optional(),
    })

    it('validates positive salary', () => {
      const validInput = {
        grossSalary: 3000,
        bornAfter1960: true,
      }

      const result = salarySchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects negative salary', () => {
      const invalidInput = {
        grossSalary: -1000,
      }

      const result = salarySchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('rejects zero salary', () => {
      const invalidInput = {
        grossSalary: 0,
      }

      const result = salarySchema.safeParse(invalidInput)
      expect(result.success).toBe(false)
    })

    it('allows optional born after 1960', () => {
      const validInput = {
        grossSalary: 3000,
      }

      const result = salarySchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })
  })

  describe('Contact Form Validation', () => {
    const contactSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      subject: z.string().min(5, 'Subject must be at least 5 characters'),
      message: z.string().min(10, 'Message must be at least 10 characters'),
    })

    it('validates correct contact form', () => {
      const validForm = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Help with calculator',
        message: 'I need help with the salary calculator',
      }

      const result = contactSchema.safeParse(validForm)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidForm = {
        name: 'John Doe',
        email: 'not-an-email',
        subject: 'Help with calculator',
        message: 'I need help with the salary calculator',
      }

      const result = contactSchema.safeParse(invalidForm)
      expect(result.success).toBe(false)
    })

    it('rejects short name', () => {
      const invalidForm = {
        name: 'J',
        email: 'john@example.com',
        subject: 'Help with calculator',
        message: 'I need help with the salary calculator',
      }

      const result = contactSchema.safeParse(invalidForm)
      expect(result.success).toBe(false)
    })

    it('rejects short message', () => {
      const invalidForm = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Help with calculator',
        message: 'Short',
      }

      const result = contactSchema.safeParse(invalidForm)
      expect(result.success).toBe(false)
    })
  })
})

describe('Form Error Messages', () => {
  it('provides clear error messages for validation failures', () => {
    const schema = z.object({
      email: z.string().email('Please enter a valid email address'),
    })

    const result = schema.safeParse({ email: 'invalid' })
    expect(result.success).toBe(false)
    if (!result.success && result.error.issues) {
      const message = result.error.issues[0]?.message || ''
      expect(message.length).toBeGreaterThan(0)
    }
  })

  it('supports multiple field validation errors', () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    })

    const result = schema.safeParse({ name: 'J', email: 'invalid' })
    expect(result.success).toBe(false)
    if (!result.success && result.error.issues) {
      expect(result.error.issues.length).toBeGreaterThan(1)
    }
  })
})
