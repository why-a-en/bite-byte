// Minimal layout for public customer pages — no sidebar, no auth
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu',
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
