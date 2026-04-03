'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createVenueAction, type VenueFormState } from '@/actions/venues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const initialState: VenueFormState = {};

export default function NewVenuePage() {
  const [state, formAction, isPending] = useActionState(
    createVenueAction,
    initialState,
  );
  const [slug, setSlug] = useState('');

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value));
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create a new venue
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up a venue to manage its menu and generate a QR code for
          customers.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Venue name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="The Pizza Place"
              disabled={isPending}
              onChange={handleNameChange}
              aria-invalid={!!state.fieldErrors?.name}
              className="h-11 rounded-lg border-gray-200"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="slug"
              className="text-sm font-medium text-gray-700"
            >
              URL slug
            </Label>
            <Input
              id="slug"
              name="slug"
              placeholder="the-pizza-place"
              disabled={isPending}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              aria-invalid={!!state.fieldErrors?.slug}
              className="h-11 rounded-lg border-gray-200 font-mono text-sm"
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-red-500">
                {state.fieldErrors.slug[0]}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Your menu will be available at{' '}
              <code className="bg-gray-50 px-1.5 py-0.5 rounded text-[11px] text-gray-500 border border-gray-100">
                /menu/{slug || 'your-slug'}
              </code>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm shadow-orange-500/20"
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create venue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
