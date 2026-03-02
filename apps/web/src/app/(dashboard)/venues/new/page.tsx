'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createVenueAction, type VenueFormState } from '@/actions/venues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
});

type FormValues = z.infer<typeof schema>;

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
  const [state, formAction, isPending] = useActionState(createVenueAction, initialState);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const nameValue = watch('name', '');

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  function onSubmit(_data: FormValues, event?: React.BaseSyntheticEvent) {
    // Let the form action handle submission
    const form = event?.target as HTMLFormElement;
    if (form) form.requestSubmit();
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a new venue</CardTitle>
          <CardDescription>
            Set up a venue to manage its menu and generate a QR code for customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            onSubmit={handleSubmit((data, e) => onSubmit(data, e))}
            className="space-y-4"
          >
            {state.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{state.error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Venue name</Label>
              <Input
                id="name"
                {...register('name')}
                name="name"
                placeholder="The Pizza Place"
                disabled={isPending}
                aria-invalid={!!errors.name || !!state.fieldErrors?.name}
              />
              {(errors.name || state.fieldErrors?.name) && (
                <p className="text-xs text-destructive">
                  {errors.name?.message ?? state.fieldErrors?.name?.[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                {...register('slug')}
                name="slug"
                placeholder="the-pizza-place"
                disabled={isPending}
                aria-invalid={!!errors.slug || !!state.fieldErrors?.slug}
              />
              {(errors.slug || state.fieldErrors?.slug) && (
                <p className="text-xs text-destructive">
                  {errors.slug?.message ?? state.fieldErrors?.slug?.[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your menu will be available at{' '}
                <code className="bg-muted px-1 rounded text-xs">
                  /menu/{watch('slug') || 'your-slug'}
                </code>
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create venue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
