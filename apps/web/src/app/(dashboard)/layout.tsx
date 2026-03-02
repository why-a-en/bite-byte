import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { fetchApi } from '@/lib/api';

interface Venue {
  id: string;
  name: string;
  slug: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let venues: Venue[] = [];

  try {
    venues = await fetchApi('/venues');
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    // Redirect to login on auth failure
    if (message.includes('401') || message.includes('Unauthorized')) {
      redirect('/login');
    }
    // For other errors (network, server down), render with empty venues
    venues = [];
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar venues={venues} />
      <main className="flex-1 p-6 pt-16 lg:pt-6 overflow-y-auto">{children}</main>
    </div>
  );
}
