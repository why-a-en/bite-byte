'use client';

import { useActionState, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { QrCode, Upload, Trash2 } from 'lucide-react';
import {
  updateVenueAction,
  deleteVenueAction,
  uploadLogoAction,
  type VenueFormState,
} from '@/actions/venues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

const updateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  paymentMode: z.enum(['PREPAY_REQUIRED', 'PAY_AT_COUNTER', 'BOTH']),
});

type FormValues = z.infer<typeof updateSchema>;

interface VenueSettingsFormProps {
  venue: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    paymentMode: 'PREPAY_REQUIRED' | 'PAY_AT_COUNTER' | 'BOTH';
  };
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  PREPAY_REQUIRED: 'Prepay Required',
  PAY_AT_COUNTER: 'Pay at Counter',
  BOTH: 'Both (Customer chooses)',
};

export function VenueSettingsForm({ venue }: VenueSettingsFormProps) {
  const boundUpdateAction = updateVenueAction.bind(null, venue.id);
  const [state, formAction, isPending] = useActionState<VenueFormState, FormData>(
    boundUpdateAction,
    {},
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string | null>(venue.logoUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: venue.name,
      slug: venue.slug,
      paymentMode: venue.paymentMode,
    },
  });

  const watchedSlug = watch('slug');
  const watchedPaymentMode = watch('paymentMode');

  function onSubmit(_data: FormValues, event?: React.BaseSyntheticEvent) {
    setSaveSuccess(false);
    const form = event?.target as HTMLFormElement;
    if (form) form.requestSubmit();
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('logo', file);

    const result = await uploadLogoAction(venue.id, formData);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.logoUrl) {
      setLogoUrl(result.logoUrl);
    }
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-8">
      {/* Venue details form */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Venue Details</h2>
        <form
          action={formAction}
          onSubmit={handleSubmit((data, e) => onSubmit(data, e))}
          className="space-y-4 max-w-lg"
        >
          {state.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-700">Venue settings saved.</p>
            </div>
          )}

          {/* Hidden field for paymentMode since Select is client-controlled */}
          <input type="hidden" name="paymentMode" value={watchedPaymentMode} />

          <div className="space-y-2">
            <Label htmlFor="name">Venue name</Label>
            <Input
              id="name"
              {...register('name')}
              name="name"
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
              disabled={isPending}
              aria-invalid={!!errors.slug || !!state.fieldErrors?.slug}
            />
            {(errors.slug || state.fieldErrors?.slug) && (
              <p className="text-xs text-destructive">
                {errors.slug?.message ?? state.fieldErrors?.slug?.[0]}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Public menu URL:{' '}
              <code className="bg-muted px-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/menu/{watchedSlug}
              </code>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment mode</Label>
            <Select
              value={watchedPaymentMode}
              onValueChange={(val) =>
                setValue('paymentMode', val as 'PREPAY_REQUIRED' | 'PAY_AT_COUNTER' | 'BOTH')
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREPAY_REQUIRED">Prepay Required</SelectItem>
                <SelectItem value="PAY_AT_COUNTER">Pay at Counter</SelectItem>
                <SelectItem value="BOTH">Both (Customer chooses)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {watchedPaymentMode === 'PREPAY_REQUIRED' &&
                'Customers must pay via the app before their order is placed.'}
              {watchedPaymentMode === 'PAY_AT_COUNTER' &&
                'Customers place the order via app and pay at the counter.'}
              {watchedPaymentMode === 'BOTH' &&
                'Customers can choose to prepay or pay at the counter.'}
            </p>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </div>

      <Separator />

      {/* Logo upload */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Venue Logo</h2>
        <div className="space-y-4 max-w-sm">
          {/* Logo preview */}
          <div className="w-24 h-24 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Venue logo"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">No logo</span>
            )}
          </div>

          {uploadError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-xs text-destructive">{uploadError}</p>
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              id="logo-upload"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : logoUrl ? 'Change logo' : 'Upload logo'}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, or WebP. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* QR code link */}
      <div>
        <h2 className="text-lg font-semibold mb-2">QR Code</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Generate a QR code that customers scan to view your menu at{' '}
          <code className="bg-muted px-1 rounded text-xs">
            {process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/menu/{venue.slug}
          </code>
        </p>
        <Button variant="outline" asChild>
          <Link href={`/venues/${venue.id}/qrcode`}>
            <QrCode className="h-4 w-4 mr-2" />
            View &amp; download QR code
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Danger zone */}
      <div>
        <h2 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Permanently delete this venue and all its menus, categories, and items. This cannot be
          undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete venue
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{venue.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the venue and all associated menus, categories, and
                items. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  await deleteVenueAction(venue.id);
                }}
              >
                Yes, delete venue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Export for use in venue page title
export { PAYMENT_MODE_LABELS };
