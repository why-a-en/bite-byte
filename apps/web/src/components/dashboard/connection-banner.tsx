'use client';

interface ConnectionBannerProps {
  connected: boolean;
}

export function ConnectionBanner({ connected }: ConnectionBannerProps) {
  if (connected) return null;

  return (
    <div className="w-full bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 text-sm text-center font-medium">
      Connection lost — reconnecting...
    </div>
  );
}
