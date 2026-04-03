'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { registerAction, type AuthFormState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Start managing your venue with Bite Byte
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
            autoComplete="new-password"
            placeholder="••••••••"
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
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
