'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from '@/navigation'
import { apiBaseUrl } from '@/lib/api-base'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  emailLabel: string
  passwordLabel: string
  forgotPassword: string
  rememberMe: string
  submit: string
  noAccount: string
  signUpLink: string
  onSwitchToSignUp?: () => void
}

export default function LoginForm({
  emailLabel,
  passwordLabel,
  forgotPassword,
  rememberMe,
  submit,
  noAccount,
  signUpLink,
  onSwitchToSignUp,
}: LoginFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    try {
      const res = await fetch(`${apiBaseUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: { message?: string }
        }
        setServerError(body.error?.message || 'Invalid email or password.')
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

  return (
    <>
      {serverError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
              className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-navy placeholder-gray-400 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
              }`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-navy">
              {passwordLabel}
            </label>
            <Link href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              {forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={`w-full rounded-xl border py-3 pl-10 pr-11 text-sm text-navy placeholder-gray-400 transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
              }`}
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
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <input
            id="remember"
            type="checkbox"
            {...register('remember')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/50 transition-colors"
          />
          <label htmlFor="remember" className="text-sm text-gray-600 select-none">
            {rememberMe}
          </label>
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
              Signing in...
            </span>
          ) : (
            submit
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        {noAccount}{' '}
        {onSwitchToSignUp ? (
          <button type="button" onClick={onSwitchToSignUp} className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {signUpLink}
          </button>
        ) : (
          <Link href="/auth/sign-up" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {signUpLink}
          </Link>
        )}
      </p>
    </>
  )
}
