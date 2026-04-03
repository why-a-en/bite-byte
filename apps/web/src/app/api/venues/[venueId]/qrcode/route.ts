import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import QRCode from 'qrcode';
import { fetchApi } from '@/lib/api';

interface Venue {
  id: string;
  name: string;
  slug: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ venueId: string }> },
) {
  const { venueId } = await params;

  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ message: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch venue to get slug
  let venue: Venue;
  try {
    venue = await fetchApi(`/venues/${venueId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('404')) {
      return new Response(JSON.stringify({ message: 'Venue not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: 'Failed to fetch venue' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:7000';
  const menuUrl = `${appUrl}/menu/${venue.slug}`;

  // Generate PNG buffer
  const pngBuffer = await QRCode.toBuffer(menuUrl, {
    type: 'png',
    width: 512,
    margin: 2,
  });
  // Convert Node.js Buffer to Uint8Array for Response compatibility
  const png = new Uint8Array(pngBuffer);

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qrcode-${venue.slug}.png"`,
      'Cache-Control': 'no-store',
    },
  });
}
