'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';

import { loginAction, type AuthFormState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

const DEMO_EMAIL = 'demo@bitebyte.app';
const DEMO_PASSWORD = 'password123';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Sign in to manage your venue
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state.error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600"
          >
            {state.error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!state.fieldErrors?.email}
            className="h-11 rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-200"
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-500">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!state.fieldErrors?.password}
            className="h-11 rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-200"
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-500">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm shadow-orange-500/20 transition-all"
        >
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 rounded-lg bg-gray-50 border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Demo Account
          </p>
          <button
            type="button"
            onClick={fillDemo}
            className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Use demo credentials
          </button>
        </div>
        <div className="space-y-1 text-sm text-gray-600 font-mono">
          <p>
            <span className="text-gray-400">email:</span> {DEMO_EMAIL}
          </p>
          <p>
            <span className="text-gray-400">pass:</span>&nbsp; {DEMO_PASSWORD}
          </p>
        </div>
      </div>

      {/* Sign up link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
