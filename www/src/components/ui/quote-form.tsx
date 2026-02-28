'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const MODULE_KEYS = [
  'coreHr',
  'ats',
  'leave',
  'payroll',
  'performance',
  'onboarding',
] as const

const quoteSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().min(1, 'Company name is required'),
  employees: z.string().min(1, 'Please select company size'),
  modules: z.array(z.string()).min(1, 'Please select at least one module'),
  message: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  selectedModule?: string
  labels: {
    title: string
    subtitle: string
    name: string
    namePlaceholder: string
    email: string
    emailPlaceholder: string
    company: string
    companyPlaceholder: string
    employees: string
    employeesPlaceholder: string
    employeeSizes: string[]
    modules: string
    moduleNames: Record<string, string>
    message: string
    messagePlaceholder: string
    submit: string
    successTitle: string
    successMessage: string
    submitAnother: string
    required: string
    selectModule: string
  }
}

export function QuoteForm({ selectedModule, labels }: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      employees: '',
      modules: selectedModule ? [selectedModule] : [],
      message: '',
    },
  })

  const onSubmit = (data: QuoteFormData) => {
    const existing = JSON.parse(localStorage.getItem('quote_requests') || '[]')
    existing.push({ ...data, submittedAt: new Date().toISOString() })
    localStorage.setItem('quote_requests', JSON.stringify(existing))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold font-heading text-navy mb-2">{labels.successTitle}</h3>
        <p className="text-gray-600 mb-6">{labels.successMessage}</p>
        <button
          onClick={() => { setSubmitted(false); reset() }}
          className="text-primary font-semibold hover:underline"
        >
          {labels.submitAnother}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="quote-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            {labels.name} <span className="text-red-500">*</span>
          </label>
          <input
            id="quote-name"
            type="text"
            {...register('name')}
            placeholder={labels.namePlaceholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="quote-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            {labels.email} <span className="text-red-500">*</span>
          </label>
          <input
            id="quote-email"
            type="email"
            {...register('email')}
            placeholder={labels.emailPlaceholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="quote-company" className="block text-sm font-medium text-gray-700 mb-1.5">
            {labels.company} <span className="text-red-500">*</span>
          </label>
          <input
            id="quote-company"
            type="text"
            {...register('company')}
            placeholder={labels.companyPlaceholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
          />
          {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
        </div>

        {/* Company Size */}
        <div>
          <label htmlFor="quote-employees" className="block text-sm font-medium text-gray-700 mb-1.5">
            {labels.employees} <span className="text-red-500">*</span>
          </label>
          <select
            id="quote-employees"
            {...register('employees')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
          >
            <option value="">{labels.employeesPlaceholder}</option>
            {labels.employeeSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          {errors.employees && <p className="mt-1 text-xs text-red-500">{errors.employees.message}</p>}
        </div>
      </div>

      {/* Modules */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {labels.modules} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MODULE_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 cursor-pointer hover:border-primary/40 hover:bg-primary-50/50 transition has-[:checked]:border-primary has-[:checked]:bg-primary-50"
            >
              <input
                type="checkbox"
                value={key}
                {...register('modules')}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-gray-700">{labels.moduleNames[key]}</span>
            </label>
          ))}
        </div>
        {errors.modules && <p className="mt-1 text-xs text-red-500">{errors.modules.message}</p>}
      </div>

      {/* Message */}
      <div className="mt-6">
        <label htmlFor="quote-message" className="block text-sm font-medium text-gray-700 mb-1.5">
          {labels.message}
        </label>
        <textarea
          id="quote-message"
          rows={4}
          {...register('message')}
          placeholder={labels.messagePlaceholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition resize-none"
        />
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto bg-primary text-white font-semibold rounded-xl px-8 py-3 text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '...' : labels.submit}
        </button>
      </div>
    </form>
  )
}
