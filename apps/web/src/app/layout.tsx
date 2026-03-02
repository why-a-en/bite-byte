export const metadata = { title: 'Bite Byte', description: 'QR ordering platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
