import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left — branded visual panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/restaurant-interior.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-gray-950/60 to-orange-950/40" />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12">
          <Link href="/" className="inline-block mb-10">
            <span className="text-3xl font-bold tracking-tight text-white">
              Bite <span className="text-orange-400">Byte</span>
            </span>
          </Link>
          <h2 className="text-2xl font-semibold text-white/90 leading-snug mb-4">
            From QR scan to kitchen in 60 seconds.
          </h2>
          <p className="text-white/50 leading-relaxed">
            The modern ordering platform for restaurants and food trucks. No app
            downloads, no friction — just scan, order, done.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">60s</p>
              <p className="text-xs text-white/40 mt-0.5">Avg. order</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">0</p>
              <p className="text-xs text-white/40 mt-0.5">Apps needed</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">5min</p>
              <p className="text-xs text-white/40 mt-0.5">Setup time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-8 pb-4">
          <Link href="/">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Bite <span className="text-orange-500">Byte</span>
            </span>
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Bite Byte. Built for restaurants
            and food trucks.
          </p>
        </div>
      </div>
    </div>
  );
}
