'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  ArrowRight,
  Zap,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import LenisSmoothScroll from './smooth-scroll-provider';

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
    image: '/images/qr-scan.jpg',
  },
  {
    icon: LayoutDashboard,
    title: 'Real-Time Dashboard',
    description:
      'Watch orders flow in live. Accept, update, and complete orders from any device.',
    image: '/images/phone-ordering.jpg',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    description:
      'Accept card payments via Stripe or let customers pay at the counter. Two modes, one flow.',
    image: '/images/happy-diners.jpg',
  },
  {
    icon: BarChart3,
    title: 'Analytics at a Glance',
    description:
      'See top-selling items, daily revenue, and order volume. Make data-driven menu decisions.',
    image: '/images/food-prep.jpg',
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
          <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-5 overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-20 blur-3xl bg-gradient-to-br from-orange-100 to-amber-50" />
            </div>

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
                    transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
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
                    transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                    className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
                  >
                    Let your customers order from their phone. No app download.
                    No account required. Just scan, order, done.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
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

                {/* Right column — hero image */}
                <motion.div
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hidden lg:block relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10">
                    <Image
                      src="/images/hero-restaurant.jpg"
                      alt="Modern restaurant interior with warm lighting"
                      width={1200}
                      height={800}
                      className="object-cover w-full h-[480px]"
                      priority
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    {/* Floating card on image */}
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">New order incoming</p>
                          <p className="text-xs text-gray-500">Table 4 &middot; 3 items &middot; $24.50</p>
                        </div>
                        <span className="ml-auto text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">Live</span>
                      </div>
                    </div>
                  </div>
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
          <section className="py-24 md:py-32 px-5">
            <div className="max-w-5xl mx-auto">
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
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.title}
                      variants={fadeUp}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
                    >
                      {/* Feature image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={f.image}
                          alt={f.title}
                          width={800}
                          height={400}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm text-orange-500 flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      {/* Feature text */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {f.title}
                        </h3>
                        <p className="text-gray-500 leading-relaxed text-[15px]">
                          {f.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* ═══════════════ HOW IT WORKS ═══════════════ */}
          <section
            id="how-it-works"
            className="py-24 md:py-32 px-5 bg-gray-50/70"
          >
            <div className="max-w-5xl mx-auto">
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
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.num}
                      variants={fadeUp}
                      transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
                      className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-5 border border-orange-100">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="inline-block text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                        Step {s.num}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {s.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-[15px]">
                        {s.description}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* ═══════════════ CTA ═══════════════ */}
          <section className="py-24 md:py-32 px-5">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  {/* Background image */}
                  <Image
                    src="/images/restaurant-interior.jpg"
                    alt="Restaurant interior"
                    width={1200}
                    height={900}
                    className="object-cover w-full h-full absolute inset-0"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-500/80" />

                  <div className="relative z-10 p-10 md:p-16 flex flex-col lg:flex-row items-center gap-10">
                    <div className="flex-1 text-center lg:text-left">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                        Ready to modernize your ordering?
                      </h2>
                      <p className="text-orange-100 text-lg mb-8 lg:mb-0 leading-relaxed">
                        Free to set up. No credit card required.
                      </p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded-full px-10 text-base shadow-lg transition-all shrink-0"
                    >
                      <Link href="/register">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
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
