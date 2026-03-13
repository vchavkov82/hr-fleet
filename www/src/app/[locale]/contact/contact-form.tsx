'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().min(2, 'Company name is required'),
  companySize: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  privacy: z.boolean().refine((v) => v === true, 'You must agree to the privacy policy'),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  labels: {
    firstName: string
    lastName: string
    email: string
    phone: string
    company: string
    companySize: string
    selectCompanySize: string
    companySizes: {
      small: string
      medium: string
      large: string
      enterprise: string
    }
    subject: string
    selectSubject: string
    subjects: {
      general: string
      sales: string
      demo: string
      support: string
      partnership: string
      feedback: string
      other: string
    }
    message: string
    privacy: string
    privacyLink: string
    submit: string
    submitting: string
    successTitle: string
    successMessage: string
    successAction: string
  }
}

export function ContactForm({ labels }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = (data: ContactFormData) => {
    const existing = JSON.parse(localStorage.getItem('contact-submissions') || '[]')
    existing.push({ ...data, submittedAt: new Date().toISOString() })
    localStorage.setItem('contact-submissions', JSON.stringify(existing))
    setSubmitted(true)
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border py-3 px-4 text-sm text-navy placeholder-gray-400 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      hasError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
    }`

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-green-800">{labels.successTitle}</h3>
        <p className="mb-6 text-green-700">{labels.successMessage}</p>
        <button
          onClick={() => {
            reset()
            setSubmitted(false)
          }}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {labels.successAction}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Name row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-navy">
            {labels.firstName} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            placeholder="John"
            {...register('firstName')}
            className={inputClass(!!errors.firstName)}
          />
          {errors.firstName && <p className="mt-1.5 text-xs text-red-600">{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-navy">
            {labels.lastName} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            placeholder="Doe"
            {...register('lastName')}
            className={inputClass(!!errors.lastName)}
          />
          {errors.lastName && <p className="mt-1.5 text-xs text-red-600">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
            {labels.email} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              placeholder="john@company.com"
              {...register('email')}
              className={`${inputClass(!!errors.email)} pl-10`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-navy">
            {labels.phone}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <input
              type="tel"
              id="phone"
              placeholder="+359 888 123 456"
              {...register('phone')}
              className={`${inputClass(!!errors.phone)} pl-10`}
            />
          </div>
        </div>
      </div>

      {/* Company & Size */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-navy">
            {labels.company} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <input
              type="text"
              id="company"
              placeholder="Acme Inc."
              {...register('company')}
              className={`${inputClass(!!errors.company)} pl-10`}
            />
          </div>
          {errors.company && <p className="mt-1.5 text-xs text-red-600">{errors.company.message}</p>}
        </div>
        <div>
          <label htmlFor="companySize" className="mb-1.5 block text-sm font-medium text-navy">
            {labels.companySize}
          </label>
          <select
            id="companySize"
            {...register('companySize')}
            className={inputClass(false)}
          >
            <option value="">{labels.selectCompanySize}</option>
            <option value="1-10">{labels.companySizes.small}</option>
            <option value="11-50">{labels.companySizes.medium}</option>
            <option value="51-200">{labels.companySizes.large}</option>
            <option value="201+">{labels.companySizes.enterprise}</option>
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-navy">
          {labels.subject} <span className="text-red-400">*</span>
        </label>
        <select
          id="subject"
          {...register('subject')}
          className={inputClass(!!errors.subject)}
        >
          <option value="">{labels.selectSubject}</option>
          <option value="general">{labels.subjects.general}</option>
          <option value="sales">{labels.subjects.sales}</option>
          <option value="demo">{labels.subjects.demo}</option>
          <option value="support">{labels.subjects.support}</option>
          <option value="partnership">{labels.subjects.partnership}</option>
          <option value="feedback">{labels.subjects.feedback}</option>
          <option value="other">{labels.subjects.other}</option>
        </select>
        {errors.subject && <p className="mt-1.5 text-xs text-red-600">{errors.subject.message}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-navy">
          {labels.message} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Please provide details about your inquiry..."
          {...register('message')}
          className={`${inputClass(!!errors.message)} resize-none`}
        />
        {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message.message}</p>}
        <p className="mt-1 text-xs text-gray-400">Minimum 20 characters</p>
      </div>

      {/* Privacy */}
      <div>
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="privacy"
            {...register('privacy')}
            className={`mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary/50 transition-colors ${
              errors.privacy ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <label htmlFor="privacy" className="text-sm text-gray-600 select-none">
            {labels.privacy}{' '}
            <a href="/privacy" className="text-primary hover:underline font-medium">
              {labels.privacyLink}
            </a>
          </label>
        </div>
        {errors.privacy && <p className="mt-1.5 text-xs text-red-600">{errors.privacy.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isSubmitting ? labels.submitting : labels.submit}
      </button>
    </form>
  )
}
