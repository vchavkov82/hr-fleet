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
  privacy: z.literal(true, { errorMap: () => ({ message: 'You must agree to the privacy policy' }) }),
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

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">{labels.successTitle}</h3>
        <p className="text-green-700 mb-4">{labels.successMessage}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          {labels.successAction}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.firstName} *
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            placeholder="John"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.lastName} *
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            placeholder="Doe"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.email} *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            placeholder="john@company.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.phone}
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            placeholder="+359 888 123 456"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.company} *
          </label>
          <input
            type="text"
            id="company"
            {...register('company')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            placeholder="Acme Inc."
          />
          {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
        </div>

        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.companySize}
          </label>
          <select
            id="companySize"
            {...register('companySize')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          >
            <option value="">{labels.selectCompanySize}</option>
            <option value="1-10">{labels.companySizes.small}</option>
            <option value="11-50">{labels.companySizes.medium}</option>
            <option value="51-200">{labels.companySizes.large}</option>
            <option value="201+">{labels.companySizes.enterprise}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          {labels.subject} *
        </label>
        <select
          id="subject"
          {...register('subject')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
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
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          {labels.message} *
        </label>
        <textarea
          id="message"
          rows={6}
          {...register('message')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
          placeholder="Please provide details about your inquiry..."
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
        <p className="mt-1 text-xs text-gray-500">Minimum 20 characters</p>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="privacy"
          {...register('privacy')}
          className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="privacy" className="ml-2 text-sm text-gray-600">
          {labels.privacy} <a href="/privacy" className="text-primary hover:underline">{labels.privacyLink}</a>
        </label>
      </div>
      {errors.privacy && <p className="text-sm text-red-600">{errors.privacy.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isSubmitting ? labels.submitting : labels.submit}
      </button>
    </form>
  )
}
