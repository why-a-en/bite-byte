'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  ArrowRight,
  Smartphone,
  Zap,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import LenisSmoothScroll from './smooth-scroll-provider';
import { PhoneMockup } from './phone-mockup';
import { DashboardMockup } from './dashboard-mockup';
import {
  GradientBlob,
  DotGrid,
  GlowOrb,
  FloatingShapes,
} from './decorative-elements';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: '60s', label: 'Average order time' },
  { value: '0', label: 'Apps to download' },
  { value: '5min', label: 'Setup time' },
  { value: '100%', label: 'Mobile friendly' },
];

const features = [
  {
    icon: QrCode,
    title: 'QR Code Ordering',
    description:
      'Customers scan a QR code and browse your full menu on their phone. No app install, no account needed.',
    mockup: 'qr' as const,
  },
  {
    icon: LayoutDashboard,
    title: 'Real-Time Dashboard',
    description:
      'Watch orders flow in live. Accept, update, and complete orders from any device.',
    mockup: 'dashboard' as const,
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    description:
      'Accept card payments via Stripe or let customers pay at the counter. Two modes, one flow.',
    mockup: null,
  },
  {
    icon: BarChart3,
    title: 'Analytics at a Glance',
    description:
      'See top-selling items, daily revenue, and order volume. Make data-driven menu decisions.',
    mockup: null,
  },
];

const steps = [
  {
    num: '01',
    title: 'Create Your Venue',
    description:
      'Sign up, add your restaurant or food truck, and build your menu with drag-and-drop.',
    icon: Zap,
  },
  {
    num: '02',
    title: 'Print Your QR Code',
    description:
      'Download your unique QR code and place it on tables or at the counter.',
    icon: QrCode,
  },
  {
    num: '03',
    title: 'Start Taking Orders',
    description:
      'Customers scan, order, and pay. You see it all in real time on your dashboard.',
    icon: CheckCircle2,
  },
];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-8 md:hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 text-gray-500 hover:text-gray-900"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>
      <Link
        href="/login"
        onClick={onClose}
        className="text-lg font-medium text-gray-700 hover:text-gray-900"
      >
        Log in
      </Link>
      <Button
        asChild
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
      >
        <Link href="/register" onClick={onClose}>
          Get Started
        </Link>
      </Button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline QR Code SVG for How It Works                                */
/* ------------------------------------------------------------------ */

function StylizedQrCode({ className = '' }: { className?: string }) {
  const pattern = [
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
  ];

  return (
    <svg
      viewBox="0 0 90 90"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * 10}
              y={y * 10}
              width={9}
              height={9}
              rx={2}
              fill={
                (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5)
                  ? '#f97316'
                  : '#fb923c'
              }
            />
          ) : null
        )
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini browser mockup for "Create Venue" step                        */
/* ------------------------------------------------------------------ */

function MiniBrowserMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`${className}`} aria-hidden="true">
      {/* Chrome */}
      <div className="bg-gray-100 rounded-t-lg px-2.5 py-1.5 flex items-center gap-1.5 border border-gray-200">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[7px] text-gray-400 font-mono">
          bitebyte.app/venues/new
        </div>
      </div>
      {/* Content */}
      <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 p-3 space-y-2">
        <div className="h-1.5 w-16 bg-gray-800 rounded-full" />
        <div className="space-y-1.5">
          <div className="h-6 bg-gray-50 rounded border border-gray-200" />
          <div className="h-6 bg-gray-50 rounded border border-gray-200" />
        </div>
        <div className="h-5 w-20 bg-orange-500 rounded-md" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AnimatedLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <LenisSmoothScroll>
      <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
        {/* Mobile menu overlay */}
        <MobileNav
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* ═══════════════ NAV ═══════════════ */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900"
            >
              Bite <span className="text-orange-500">Byte</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-full"
              >
                Log in
              </Link>
              <Button
                asChild
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 shadow-sm"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main>
          {/* ═══════════════ HERO ═══════════════ */}
          <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-5 overflow-hidden">
            {/* Decorative background */}
            <GradientBlob
              color="orange"
              size="w-[700px] h-[700px]"
              position="top-[-200px] left-[-200px]"
              opacity={0.15}
            />
            <GradientBlob
              color="amber"
              size="w-[500px] h-[500px]"
              position="top-[-100px] right-[-150px]"
              opacity={0.12}
            />
            <GradientBlob
              color="rose"
              size="w-[400px] h-[400px]"
              position="bottom-[-100px] left-[30%]"
              opacity={0.08}
            />
            <DotGrid opacity={0.035} />
            <FloatingShapes />

            <div className="max-w-6xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left column — text */}
                <div className="text-center lg:text-left">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="mb-8"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-medium border border-orange-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      QR Code Ordering Platform
                    </span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.15,
                      ease: 'easeOut',
                    }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                  >
                    From QR Scan to Kitchen
                    <br />
                    <span className="text-orange-500">in 60 Seconds</span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3,
                      ease: 'easeOut',
                    }}
                    className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
                  >
                    Let your customers order from their phone. No app download.
                    No account required. Just scan, order, done.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.45,
                      ease: 'easeOut',
                    }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 text-base shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30"
                    >
                      <Link href="/register">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-full px-8 text-base border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all"
                    >
                      <a href="#how-it-works">See How It Works</a>
                    </Button>
                  </motion.div>
                </div>

                {/* Right column — phone mockups */}
                <motion.div
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="hidden lg:flex justify-center items-center relative"
                >
                  {/* Background phone (QR variant) — behind */}
                  <div className="absolute -left-4 top-8 opacity-40 scale-90 -rotate-6">
                    <PhoneMockup variant="qr" className="w-56 h-[440px]" />
                  </div>

                  {/* Foreground phone (menu variant) */}
                  <div className="relative z-10 rotate-2">
                    <PhoneMockup variant="menu" className="w-64 h-[500px]" />
                  </div>

                  {/* Accent glow behind phones */}
                  <GlowOrb
                    color="bg-orange-400"
                    size="w-48 h-48"
                    position="-bottom-12 -right-8"
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* ═══════════════ STATS ═══════════════ */}
          <section className="py-16 px-5 relative">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/60 shadow-sm px-6 py-8 md:py-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={stagger}
                  className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                >
                  {stats.map((s, i) => (
                    <motion.div
                      key={s.label}
                      variants={fadeUp}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: 'easeOut',
                      }}
                      className="text-center"
                    >
                      <p className="text-3xl md:text-4xl font-bold text-orange-500 mb-1">
                        {s.value}
                      </p>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-orange-300 to-orange-500 mx-auto mb-2 rounded-full" />
                      <p className="text-sm text-gray-500 font-medium">
                        {s.label}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* ═══════════════ FEATURES ═══════════════ */}
          <section className="py-24 md:py-32 px-5 relative overflow-hidden">
            <GradientBlob
              color="orange"
              size="w-[600px] h-[600px]"
              position="top-[10%] -right-[200px]"
              opacity={0.08}
            />

            <div className="max-w-5xl mx-auto relative z-10">
              <AnimatedSection className="text-center mb-16">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-4 border border-orange-100">
                  Features
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Everything you need to modernize ordering
                </h2>
              </AnimatedSection>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {features.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      variants={fadeUp}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-8 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden"
                    >
                      {/* Subtle gradient bg for non-mockup cards */}
                      {!f.mockup && (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-orange-50/40 to-transparent pointer-events-none"
                          aria-hidden="true"
                        />
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                              <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {f.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                              {f.description}
                            </p>
                          </div>

                          {/* QR phone mockup */}
                          {f.mockup === 'qr' && (
                            <div className="hidden sm:block flex-shrink-0 -mr-2 -mt-2">
                              <PhoneMockup
                                variant="qr"
                                className="w-28 h-[220px]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Dashboard mockup */}
                        {f.mockup === 'dashboard' && (
                          <div className="hidden sm:block mt-5 -mx-2 -mb-2">
                            <DashboardMockup className="max-w-full" />
                          </div>
                        )}
                      </div>

                      {/* Glow orb for non-mockup cards */}
                      {!f.mockup && (
                        <GlowOrb
                          color={
                            idx === 2
                              ? 'bg-orange-300'
                              : 'bg-amber-300'
                          }
                          size="w-24 h-24"
                          position="-bottom-8 -right-8"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* ═══════════════ HOW IT WORKS ═══════════════ */}
          <section
            id="how-it-works"
            className="py-24 md:py-32 px-5 bg-gray-50/70 relative overflow-hidden"
          >
            <DotGrid opacity={0.025} />

            <div className="max-w-5xl mx-auto relative z-10">
              <AnimatedSection className="text-center mb-16 md:mb-20">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-4 border border-orange-100">
                  How It Works
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  Up and running in 3 steps
                </h2>
              </AnimatedSection>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={stagger}
                className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative"
              >
                {/* Connecting line (desktop only) — thicker with glow */}
                <div
                  className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"
                  aria-hidden="true"
                />
                <div
                  className="hidden md:block absolute top-16 left-[20%] right-[20%] h-1 bg-gradient-to-r from-orange-200/0 via-orange-400/30 to-orange-200/0 blur-sm"
                  aria-hidden="true"
                />

                {/* Step 1 — Create Venue */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: 0, ease: 'easeOut' }}
                  className="text-center relative"
                >
                  <div className="w-28 h-32 mx-auto mb-6 relative z-10">
                    <MiniBrowserMockup className="w-full" />
                  </div>
                  <span className="inline-block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                    Step 01
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Create Your Venue
                  </h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-[15px]">
                    Sign up, add your restaurant or food truck, and build your
                    menu with drag-and-drop.
                  </p>
                </motion.div>

                {/* Step 2 — Print QR */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
                  className="text-center relative"
                >
                  <div className="w-24 h-24 mx-auto mb-6 relative z-10 bg-white rounded-2xl border-2 border-orange-200 shadow-sm flex items-center justify-center p-3">
                    <StylizedQrCode className="w-full h-full" />
                  </div>
                  <span className="inline-block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                    Step 02
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Print Your QR Code
                  </h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-[15px]">
                    Download your unique QR code and place it on tables or at
                    the counter.
                  </p>
                </motion.div>

                {/* Step 3 — Take Orders */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                  className="text-center relative"
                >
                  <div className="mx-auto mb-6 relative z-10 flex justify-center">
                    <PhoneMockup
                      variant="order"
                      className="w-24 h-[188px]"
                    />
                  </div>
                  <span className="inline-block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                    Step 03
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Start Taking Orders
                  </h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-[15px]">
                    Customers scan, order, and pay. You see it all in real time
                    on your dashboard.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ═══════════════ CTA ═══════════════ */}
          <section className="py-24 md:py-32 px-5 relative overflow-hidden">
            <GradientBlob
              color="orange"
              size="w-[500px] h-[500px]"
              position="top-[-100px] left-[-100px]"
              opacity={0.06}
            />
            <FloatingShapes />

            <div className="max-w-4xl mx-auto relative z-10">
              <AnimatedSection>
                <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-10 md:p-16 shadow-xl shadow-orange-500/15 overflow-hidden">
                  {/* Decorative circles inside CTA */}
                  <div
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5"
                    aria-hidden="true"
                  />

                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                    <div className="flex-1 text-center lg:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                        Ready to modernize your ordering?
                      </h2>
                      <p className="text-orange-100 text-lg mb-8 lg:mb-0 leading-relaxed">
                        Free to set up. No credit card required.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <Button
                        asChild
                        size="lg"
                        className="bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded-full px-10 text-base shadow-lg transition-all"
                      >
                        <Link href="/register">
                          Get Started Free
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>

                      {/* Small phone hint */}
                      <div className="hidden lg:block opacity-60 -mb-16">
                        <PhoneMockup
                          variant="order"
                          className="w-20 h-[156px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </main>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="border-t border-gray-100 py-10 px-5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span className="font-semibold text-gray-600">
              Bite <span className="text-orange-500">Byte</span>
            </span>
            <span>Built for restaurants and food trucks</span>
            <span>&copy; {new Date().getFullYear()} Bite Byte</span>
          </div>
        </footer>
      </div>
    </LenisSmoothScroll>
  );
}
