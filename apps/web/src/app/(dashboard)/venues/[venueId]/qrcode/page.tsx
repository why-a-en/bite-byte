import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Venue {
  id: string;
  name: string;
  slug: string;
}

export default async function VenueQrCodePage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;

  let venue: Venue;
  try {
    venue = await fetchApi(`/venues/${venueId}`);
  } catch {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const menuUrl = `${appUrl}/menu/${venue.slug}`;

  // Generate QR code data URL for preview
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href={`/venues/${venueId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {venue.name}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code — {venue.name}</CardTitle>
          <CardDescription>
            Customers scan this QR code to view your menu. Print and display it at your venue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR code preview */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR code for ${venue.name} menu`}
              className="w-64 h-64 rounded-lg border"
            />
          </div>

          {/* Menu URL display */}
          <div className="rounded-md bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Menu URL</p>
            <p className="text-sm font-mono break-all">{menuUrl}</p>
          </div>

          {/* Download button — links to route handler */}
          <Button asChild className="w-full">
            <a href={`/api/venues/${venueId}/qrcode`} download={`qrcode-${venue.slug}.png`}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </a>
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            The downloaded PNG is 512×512 pixels — suitable for print and display.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
