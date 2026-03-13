'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  plan: string
  selectedPlan?: string
  growthPlan?: string
  trialNote?: string
  firstNameLabel: string
  lastNameLabel: string
  companyLabel: string
  emailLabel: string
  passwordLabel: string
  termsText: string
  termsLink: string
  and: string
  privacyLink: string
  submitFree: string
  submitTrial: string
  noCardNote: string
  hasAccount: string
  loginLink: string
  onSwitchToLogin?: () => void
}

export default function SignUpForm({
  plan,
  selectedPlan,
  growthPlan,
  trialNote,
  firstNameLabel,
  lastNameLabel,
  companyLabel,
  emailLabel,
  passwordLabel,
  termsText,
  termsLink,
  and,
  privacyLink,
  submitFree,
  submitTrial,
  noCardNote,
  hasAccount,
  loginLink,
  onSwitchToLogin,
}: SignUpFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { terms: false },
  })

  const passwordValue = watch('password', '')

  const passwordStrength = (() => {
    if (!passwordValue) return 0
    let score = 0
    if (passwordValue.length >= 8) score++
    if (/[A-Z]/.test(passwordValue)) score++
    if (/[0-9]/.test(passwordValue)) score++
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++
    return score
  })()

  const strengthColor = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

  async function onSubmit(data: SignUpFormData) {
    setServerError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080'
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          password: data.password,
          company_name: data.company,
          plan,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setServerError(body.error || 'Registration failed. Please try again.')
        return
      }

      const body = await res.json()
      if (body.access_token) {
        localStorage.setItem('jobs_access_token', body.access_token)
        if (body.refresh_token) {
          localStorage.setItem('jobs_refresh_token', body.refresh_token)
        }
      }
      router.replace('/dashboard')
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  const inputClass = (field: keyof SignUpFormData) =>
    `w-full rounded-xl border py-3 px-4 text-sm text-navy placeholder-gray-400 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      errors[field] ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
    }`

  return (
    <>
      {plan !== 'starter' && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-blue-50/60 p-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <p className="text-sm text-primary font-medium">
            {selectedPlan}{' '}
            <span className="font-bold capitalize">{plan === 'growth' ? growthPlan : 'Enterprise'}</span>
            {plan === 'growth' && ` — ${trialNote}`}
          </p>
        </div>
      )}

      {serverError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-navy">
              {firstNameLabel}
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              {...register('firstName')}
              className={inputClass('firstName')}
            />
            {errors.firstName && <p className="mt-1.5 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-navy">
              {lastNameLabel}
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              {...register('lastName')}
              className={inputClass('lastName')}
            />
            {errors.lastName && <p className="mt-1.5 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-navy">
            {companyLabel}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <input
              id="company"
              type="text"
              autoComplete="organization"
              {...register('company')}
              className={`${inputClass('company')} pl-10`}
            />
          </div>
          {errors.company && <p className="mt-1.5 text-xs text-red-600">{errors.company.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
            {emailLabel}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ivan@company.bg"
              {...register('email')}
              className={`${inputClass('email')} pl-10`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy">
            {passwordLabel}
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              className={`${inputClass('password')} pl-10 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}

          {/* Password strength */}
          {passwordValue && (
            <div className="mt-2.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      level <= passwordStrength ? strengthColor[passwordStrength] : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1 text-xs ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 2 ? 'text-orange-500' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                {strengthLabel[passwordStrength]}
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="terms"
              type="checkbox"
              {...register('terms')}
              className={`mt-0.5 h-4 w-4 rounded focus:ring-primary/50 ${
                errors.terms ? 'border-red-300' : 'border-gray-300'
              } text-primary transition-colors`}
            />
            <label htmlFor="terms" className="text-sm text-gray-600 select-none">
              {termsText}{' '}
              <Link href="#" className="text-primary hover:underline">{termsLink}</Link>
              {' '}{and}{' '}
              <Link href="#" className="text-primary hover:underline">{privacyLink}</Link>
            </label>
          </div>
          {errors.terms && <p className="mt-1.5 text-xs text-red-600">{errors.terms.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none transition-all duration-200"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : plan === 'starter' ? (
            submitFree
          ) : (
            submitTrial
          )}
        </button>
      </form>

      <div className="mt-8 space-y-2 text-center">
        <p className="text-xs text-gray-400">{noCardNote}</p>
        <p className="text-sm text-gray-500">
          {hasAccount}{' '}
          {onSwitchToLogin ? (
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-primary hover:text-primary/80 transition-colors">
              {loginLink}
            </button>
          ) : (
            <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              {loginLink}
            </Link>
          )}
        </p>
      </div>
    </>
  )
}
