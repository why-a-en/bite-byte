import { notFound } from 'next/navigation';
import { fetchPublicApi } from '@/lib/api-public';
import { MenuPage } from '@/components/ordering/menu-page';

// Types for the public menu API response
export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: PublicMenuItem[];
}

export interface PublicVenue {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  paymentMode: 'PREPAY_REQUIRED' | 'PAY_AT_COUNTER' | 'BOTH';
  categories: PublicCategory[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuSlugPage({ params }: PageProps) {
  const { slug } = await params;

  let venue: PublicVenue;
  try {
    venue = await fetchPublicApi(`/public/venues/${slug}/menu`);
  } catch {
    notFound();
  }

  return <MenuPage venue={venue} />;
}
