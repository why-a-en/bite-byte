import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu — Bite Byte',
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">{children}</div>
  );
}
