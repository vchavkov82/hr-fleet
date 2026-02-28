'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignUpFormProps {
  plan: string;
  selectedPlan?: string;
  growthPlan?: string;
  trialNote?: string;
  firstNameLabel: string;
  lastNameLabel: string;
  companyLabel: string;
  emailLabel: string;
  passwordLabel: string;
  termsText: string;
  termsLink: string;
  and: string;
  privacyLink: string;
  submitFree: string;
  submitTrial: string;
  noCardNote: string;
  hasAccount: string;
  loginLink: string;
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
}: SignUpFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    password: '',
    terms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.company.trim()) errors.company = 'Company is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!form.terms) errors.terms = 'You must agree to the terms';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          password: form.password,
          company_name: form.company,
          plan,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('jobs_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('jobs_refresh_token', data.refresh_token);
        }
      }
      router.replace('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      fieldErrors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <>
      {plan !== 'starter' && (
        <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary/20">
          <p className="text-sm text-primary font-medium">
            {selectedPlan}{' '}
            <span className="font-bold capitalize">
              {plan === 'growth' ? growthPlan : 'Enterprise'}
            </span>
            {plan === 'growth' && ` ${trialNote}`}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-navy mb-1.5">
              {firstNameLabel}
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={inputClass('firstName')}
            />
            {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-navy mb-1.5">
              {lastNameLabel}
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={inputClass('lastName')}
            />
            {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-navy mb-1.5">
            {companyLabel}
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
            className={inputClass('company')}
          />
          {fieldErrors.company && <p className="mt-1 text-xs text-red-600">{fieldErrors.company}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
            {emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="ivan@company.bg"
            className={inputClass('email')}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">
            {passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className={inputClass('password')}
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="terms"
              type="checkbox"
              checked={form.terms}
              onChange={(e) => update('terms', e.target.checked)}
              className={`mt-0.5 h-4 w-4 rounded focus:ring-primary ${
                fieldErrors.terms ? 'border-red-300' : 'border-gray-300'
              } text-primary`}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              {termsText}{' '}
              <Link href="#" className="text-primary hover:underline">{termsLink}</Link>
              {' '}{and}{' '}
              <Link href="#" className="text-primary hover:underline">{privacyLink}</Link>
            </label>
          </div>
          {fieldErrors.terms && <p className="mt-1 text-xs text-red-600">{fieldErrors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : plan === 'starter' ? submitFree : submitTrial}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-400">{noCardNote}</p>
        <p className="text-sm text-gray-500">
          {hasAccount}{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            {loginLink}
          </Link>
        </p>
      </div>
    </>
  );
}
