'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  emailLabel: string;
  passwordLabel: string;
  forgotPassword: string;
  rememberMe: string;
  submit: string;
  noAccount: string;
  signUpLink: string;
}

export default function LoginForm({
  emailLabel,
  passwordLabel,
  forgotPassword,
  rememberMe,
  submit,
  noAccount,
  signUpLink,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid email or password.');
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

  return (
    <>
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
            {emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="ivan@company.bg"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-navy">
              {passwordLabel}
            </label>
            <Link href="#" className="text-sm text-primary hover:underline">
              {forgotPassword}
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            {rememberMe}
          </label>
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
              Signing in...
            </span>
          ) : submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {noAccount}{' '}
        <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
          {signUpLink}
        </Link>
      </p>
    </>
  );
}
