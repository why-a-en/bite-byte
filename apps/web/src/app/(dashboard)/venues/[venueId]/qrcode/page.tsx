import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:7000';
  const menuUrl = `${appUrl}/menu/${venue.slug}`;

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
      <div className="mb-8">
        <Link
          href={`/venues/${venueId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {venue.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          QR Code
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Customers scan this to view your menu. Print and display it at your
          venue.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
        {/* QR code preview */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`QR code for ${venue.name} menu`}
            className="w-56 h-56 rounded-xl border border-gray-100"
          />
        </div>

        {/* Menu URL */}
        <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1">
            Menu URL
          </p>
          <p className="text-sm font-mono text-gray-600 break-all">
            {menuUrl}
          </p>
        </div>

        {/* Download */}
        <Button
          asChild
          className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm shadow-orange-500/20"
        >
          <a
            href={`/api/venues/${venueId}/qrcode`}
            download={`qrcode-${venue.slug}.png`}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </a>
        </Button>

        <p className="text-xs text-gray-400 text-center">
          512 &times; 512 pixels &mdash; suitable for print and display.
        </p>
      </div>
    </div>
  );
}
