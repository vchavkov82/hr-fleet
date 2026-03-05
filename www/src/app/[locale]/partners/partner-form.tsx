'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const partnerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().url('Please enter a valid URL').or(z.literal('')),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  partnerType: z.string().min(1, 'Please select a partner type'),
  companySize: z.string().min(1, 'Please select a company size'),
  agreement: z.boolean().refine(v => v === true, 'You must agree to the terms'),
})

type PartnerFormData = z.infer<typeof partnerSchema>

interface PartnerFormProps {
  labels: {
    companyName: string
    website: string
    contactName: string
    email: string
    partnerType: string
    selectType: string
    types: {
      referral: string
      integration: string
      reseller: string
      technology: string
    }
    companySize: string
    selectSize: string
    sizes: {
      small: string
      medium: string
      large: string
      enterprise: string
    }
    agreement: string
    submit: string
    successTitle: string
    successMessage: string
  }
}

export function PartnerForm({ labels }: PartnerFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
  })

  const onSubmit = (data: PartnerFormData) => {
    const existing = JSON.parse(localStorage.getItem('partner-applications') || '[]')
    existing.push({ ...data, submittedAt: new Date().toISOString() })
    localStorage.setItem('partner-applications', JSON.stringify(existing))
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
        <p className="text-green-700">{labels.successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.companyName} *
          </label>
          <input
            type="text"
            id="companyName"
            {...register('companyName')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
          {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>}
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.website}
          </label>
          <input
            type="url"
            id="website"
            {...register('website')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
          {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.contactName} *
          </label>
          <input
            type="text"
            id="contactName"
            {...register('contactName')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
          {errors.contactName && <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>}
        </div>
        <div>
          <label htmlFor="partner-email" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.email} *
          </label>
          <input
            type="email"
            id="partner-email"
            {...register('email')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="partnerType" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.partnerType} *
          </label>
          <select
            id="partnerType"
            {...register('partnerType')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          >
            <option value="">{labels.selectType}</option>
            <option value="referral">{labels.types.referral}</option>
            <option value="integration">{labels.types.integration}</option>
            <option value="reseller">{labels.types.reseller}</option>
            <option value="technology">{labels.types.technology}</option>
          </select>
          {errors.partnerType && <p className="mt-1 text-sm text-red-600">{errors.partnerType.message}</p>}
        </div>
        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
            {labels.companySize} *
          </label>
          <select
            id="companySize"
            {...register('companySize')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          >
            <option value="">{labels.selectSize}</option>
            <option value="small">{labels.sizes.small}</option>
            <option value="medium">{labels.sizes.medium}</option>
            <option value="large">{labels.sizes.large}</option>
            <option value="enterprise">{labels.sizes.enterprise}</option>
          </select>
          {errors.companySize && <p className="mt-1 text-sm text-red-600">{errors.companySize.message}</p>}
        </div>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="agreement"
          {...register('agreement')}
          className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
          {labels.agreement}
        </label>
      </div>
      {errors.agreement && <p className="text-sm text-red-600">{errors.agreement.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {labels.submit}
      </button>
    </form>
  )
}
