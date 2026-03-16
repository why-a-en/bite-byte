'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LenisSmoothScroll from './smooth-scroll-provider';
import SplitText from './split-text';
import HorizontalScrollSection from './horizontal-scroll-section';
import MagneticCursor from './magnetic-cursor';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { end: 60, suffix: 's', label: 'Average order time' },
  { end: 0, suffix: '', label: 'Apps to download' },
  { end: 5, suffix: 'min', label: 'Setup time' },
  { end: 100, suffix: '%', label: 'Mobile friendly' },
];

const steps = [
  { num: '01', title: 'Create Your Venue', desc: 'Sign up, add your restaurant or food truck, and build your menu with drag-and-drop.' },
  { num: '02', title: 'Print Your QR Code', desc: 'Download your unique QR code and place it on tables or at the counter.' },
  { num: '03', title: 'Start Taking Orders', desc: 'Customers scan, order, and pay. You see it all in real time on your dashboard.' },
];

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

const QRIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/>
    <rect width="5" height="5" x="3" y="16" rx="1"/><rect width="5" height="5" x="16" y="16" rx="1"/>
    <path d="M11 3h2"/><path d="M11 8h2"/><path d="M3 11v2"/><path d="M8 11v2"/>
    <path d="M16 11v2"/><path d="M21 11v2"/><path d="M11 16h2"/><path d="M11 21h2"/>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
    <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

const PaymentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Horizontal Scroll Panels                                           */
/* ------------------------------------------------------------------ */

const panels = [
  {
    number: '01',
    title: 'Instant QR Ordering',
    desc: 'Customers scan a QR code and browse your full menu on their phone. No app install needed. No account. No friction.',
    icon: <QRIcon />,
    image: 'https://plus.unsplash.com/premium_photo-1681293215038-2717d2b84c0d?w=800&q=80',
    imageAlt: 'Customer scanning a QR code on their phone at a restaurant',
  },
  {
    number: '02',
    title: 'Real-Time Dashboard',
    desc: 'Watch orders flow in live. Accept, update status, and complete orders from any device with zero lag.',
    icon: <DashboardIcon />,
    image: 'https://plus.unsplash.com/premium_photo-1663050797598-cd88452f81f3?w=800&q=80',
    imageAlt: 'Chef using tablet to manage kitchen orders',
  },
  {
    number: '03',
    title: 'Flexible Payments',
    desc: 'Accept card payments via Stripe or let customers pay at the counter. Two modes, one seamless flow.',
    icon: <PaymentIcon />,
    image: 'https://plus.unsplash.com/premium_photo-1744231749700-cbdeb30e7054?w=800&q=80',
    imageAlt: 'Customer paying with phone at a cafe',
  },
  {
    number: '04',
    title: 'Analytics at a Glance',
    desc: 'See top-selling items, daily revenue, and order volume. Make smart menu decisions backed by real data.',
    icon: <AnalyticsIcon />,
    image: 'https://plus.unsplash.com/premium_photo-1664391712177-8573419bf063?w=800&q=80',
    imageAlt: 'Beautifully plated restaurant dish',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AnimatedLanding() {
  const statsRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Match body bg to landing page so pinned scroll gaps don't show white
    document.body.style.backgroundColor = '#0C0C0C';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* NAV */
      gsap.from(navRef.current, {
        y: -20, opacity: 0, duration: 0.8, ease: 'power3.out',
      });

      /* Hero background parallax — slow zoom + upward drift */
      gsap.to('[data-blob-1]', {
        scale: 1.1, y: -60, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      });
      gsap.to('[data-blob-2]', {
        y: -80, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      });
      gsap.to('[data-blob-3]', {
        y: -50, x: 20, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      });

      /* Floating orbs */
      document.querySelectorAll('[data-float]').forEach((el, i) => {
        gsap.to(el, {
          y: 'random(-20, 20)',
          x: 'random(-15, 15)',
          duration: 'random(3, 5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });
      });

      /* STATS counters */
      const statEls = document.querySelectorAll('[data-stat-value]');
      statEls.forEach((el) => {
        const endVal = parseInt(el.getAttribute('data-end') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const obj = { val: 0 };

        gsap.from(el.parentElement!, {
          y: 30, opacity: 0, scale: 0.9, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%' },
        });

        gsap.to(obj, {
          val: endVal,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%' },
          onUpdate: () => {
            (el as HTMLElement).textContent = Math.round(obj.val) + suffix;
          },
        });
      });

      /* HOW IT WORKS — slower reveal so users can read step by step */
      gsap.from('[data-steps-heading] > *', {
        y: 40, opacity: 0, duration: 1, stagger: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
      });

      const line = document.querySelector('[data-connecting-line]');
      if (line) {
        gsap.from(line, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 2,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 75%' },
        });
      }

      gsap.from('[data-step-circle]', {
        scale: 0, rotation: -180, duration: 1, stagger: 0.6,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: stepsRef.current, start: 'top 75%' },
      });

      gsap.from('[data-step-text]', {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.6, delay: 0.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: stepsRef.current, start: 'top 75%' },
      });

      /* Horizontal scroll panel images */
      gsap.from('[data-panel-image]', {
        scale: 1.15,
        duration: 1.2,
        ease: 'power2.out',
        stagger: 0.2,
        scrollTrigger: { trigger: '[data-panel-image]', start: 'top 80%' },
      });

      /* CTA */
      gsap.from('[data-cta-inner]', {
        y: 40, opacity: 0, scale: 0.95, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 80%' },
      });

      document.querySelectorAll('[data-cta-shape]').forEach((shape, i) => {
        gsap.to(shape, {
          y: 'random(-30, 30)',
          x: 'random(-20, 20)',
          rotation: 'random(-15, 15)',
          duration: 'random(4, 7)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.8,
        });
      });

      /* FOOTER */
      gsap.from('[data-footer] > *', {
        y: 15, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-footer]', start: 'top 95%' },
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <LenisSmoothScroll>
      <div className="min-h-screen flex flex-col bg-[#0C0C0C] overflow-x-hidden text-white">
        <MagneticCursor />

        {/* ═══════════════ NAV ═══════════════ */}
        <header ref={navRef} className="sticky top-0 z-50 bg-[#0C0C0C]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Bite <span className="text-orange-500">Byte</span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                data-magnetic
                href="/login"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Button
                asChild
                data-magnetic
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5 shadow-md shadow-orange-500/20"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1">

          {/* ═══════════════ HERO ═══════════════ */}
          <section ref={heroRef} className="relative overflow-hidden pt-20 pb-32 md:pt-28 md:pb-44 px-4">
            {/* Background image */}
            <div className="absolute inset-0" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1770816307454-892c27fc625e?w=1920&q=80"
                alt=""
                className="w-full h-full object-cover"
                data-blob-1
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-[#0C0C0C]/75" />
              {/* Orange accent glow */}
              <div
                data-blob-2
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-200 h-200 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 55%)', filter: 'blur(80px)' }}
              />
              <div
                data-blob-3
                className="absolute bottom-0 right-0 w-150 h-150 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }}
              />
              {/* Bottom gradient for smooth transition to page bg */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0C0C0C] to-transparent" />
            </div>

            {/* Floating decorative orbs */}
            <div data-float className="absolute top-24 left-[10%] w-3 h-3 rounded-full bg-orange-500/20" aria-hidden="true" />
            <div data-float className="absolute top-40 right-[15%] w-2 h-2 rounded-full bg-amber-500/15" aria-hidden="true" />
            <div data-float className="absolute bottom-32 left-[20%] w-4 h-4 rounded-full bg-orange-400/10" aria-hidden="true" />
            <div data-float className="absolute top-32 right-[25%] w-2.5 h-2.5 rounded-full bg-orange-500/15" aria-hidden="true" />
            <div data-float className="absolute bottom-20 right-[10%] w-3 h-3 rounded-full bg-amber-400/10" aria-hidden="true" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: 'backOut' }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  QR Code Ordering for Restaurants and Food Trucks
                </span>
              </motion.div>

              {/* Headline with SplitText */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08] mb-6">
                <SplitText
                  text="From QR Scan to Kitchen"
                  className="text-white"
                  delay={0.2}
                />
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  <SplitText
                    text="in 60 Seconds"
                    className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent"
                    delay={0.5}
                  />
                </span>
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.8, ease: 'easeOut' }}
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Let your customers order from their phone. No app download. No account required.
                Just scan, order, done.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  asChild
                  data-magnetic
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 text-base shadow-xl shadow-orange-500/25 transition-shadow hover:shadow-2xl hover:shadow-orange-500/40"
                >
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <a
                  data-magnetic
                  href="#how-it-works"
                  className="inline-flex items-center justify-center h-11 rounded-full px-8 text-base font-medium border border-white/30 text-white bg-transparent hover:border-orange-400 hover:bg-orange-500/10 transition-all"
                >
                  See How It Works
                </a>
              </motion.div>
            </div>
          </section>

          {/* ═══════════════ STATS ═══════════════ */}
          <section ref={statsRef} className="bg-white/[0.03] py-14 px-4 border-y border-white/[0.06]">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-center">
                    <span
                      data-stat-value
                      data-end={s.end}
                      data-suffix={s.suffix}
                      className="text-4xl md:text-5xl font-bold text-orange-500 mb-1 tabular-nums"
                    >
                      0{s.suffix}
                    </span>
                    <span className="text-sm font-medium text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════ HORIZONTAL SCROLL SHOWCASE ═══════════════ */}
          <section className="py-16 md:py-0">
            {/* Section heading */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center py-16 md:py-20 px-4"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-orange-500/20">
                Features
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                  Modernize
                </span>{' '}
                Ordering
              </h2>
            </motion.div>

            {/* Mobile: vertical cards */}
            <div className="md:hidden px-4 pb-16 space-y-6">
              {panels.map((panel) => (
                <div key={panel.number} className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={panel.image}
                      alt={panel.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-8">
                    <div className="text-7xl font-black text-white/[0.04] mb-4 leading-none">{panel.number}</div>
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                      {panel.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{panel.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{panel.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: horizontal pinned scroll */}
            <div className="hidden md:block">
              <HorizontalScrollSection panelCount={panels.length}>
                {panels.map((panel, i) => (
                  <div
                    key={panel.number}
                    className="w-screen h-screen shrink-0 flex items-center bg-[#0C0C0C] relative"
                    style={{ minWidth: '100vw' }}
                  >
                    {/* Full-bleed background image with overlay */}
                    <div className="absolute inset-0">
                      <img
                        data-panel-image
                        src={panel.image}
                        alt={panel.imageAlt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Dark gradient overlay — heavier on text side */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: i % 2 === 0
                            ? 'linear-gradient(to right, rgba(12,12,12,0.92) 0%, rgba(12,12,12,0.75) 45%, rgba(12,12,12,0.3) 100%)'
                            : 'linear-gradient(to left, rgba(12,12,12,0.92) 0%, rgba(12,12,12,0.75) 45%, rgba(12,12,12,0.3) 100%)',
                        }}
                      />
                      {/* Subtle orange tint at the image edge */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: i % 2 === 0
                            ? 'radial-gradient(ellipse at 85% 50%, rgba(249,115,22,0.06) 0%, transparent 60%)'
                            : 'radial-gradient(ellipse at 15% 50%, rgba(249,115,22,0.06) 0%, transparent 60%)',
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className={`relative z-10 w-full h-full flex items-center ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                      {/* Text side */}
                      <div className="w-1/2 px-16 xl:px-24 relative">
                        {/* Large watermark number */}
                        <div className="absolute -top-20 -left-4 text-[200px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                          {panel.number}
                        </div>

                        <div className="relative z-10 max-w-xl">
                          {/* Number pill */}
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
                            <span className="text-orange-500 font-bold text-sm">{panel.number}</span>
                            <span className="w-1 h-1 rounded-full bg-orange-500/40" />
                            <span className="text-orange-400/70 text-xs font-medium uppercase tracking-wider">Feature</span>
                          </div>
                          <h3 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {panel.title}
                          </h3>
                          <p className="text-xl text-gray-400 leading-relaxed">
                            {panel.desc}
                          </p>
                        </div>
                      </div>

                      {/* Spacer for image side (image is in background) */}
                      <div className="w-1/2" />
                    </div>
                  </div>
                ))}
              </HorizontalScrollSection>
            </div>
          </section>

          {/* ═══════════════ HOW IT WORKS ═══════════════ */}
          <section ref={stepsRef} id="how-it-works" className="py-24 md:py-40 px-4 bg-gradient-to-b from-white/[0.02] to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} aria-hidden="true" />

            <div className="max-w-5xl mx-auto relative z-10">
              <div data-steps-heading className="text-center mb-20">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-orange-500/20">
                  How It Works
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                  Up and Running in{' '}
                  <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">3 Steps</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting line */}
                <div
                  data-connecting-line
                  className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-[3px] bg-gradient-to-r from-orange-500/40 via-orange-500 to-orange-500/40 rounded-full"
                  aria-hidden="true"
                />

                {steps.map((s) => (
                  <div key={s.num} className="text-center relative">
                    <div
                      data-step-circle
                      className="w-26 h-26 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/30 relative z-10"
                    >
                      {s.num}
                    </div>
                    <div data-step-text>
                      <h3 className="text-xl font-semibold mb-3 text-white">{s.title}</h3>
                      <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════ DARK STATS BANNER ═══════════════ */}
          <section className="py-20 px-4 bg-white/[0.03] border-y border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-100 h-100 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} aria-hidden="true" />
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              {[
                { value: 'Free', label: 'To get started' },
                { value: '2min', label: 'Menu setup' },
                { value: '24/7', label: 'Order availability' },
                { value: '100%', label: 'Mobile friendly' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                >
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-1">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ═══════════════ CTA ═══════════════ */}
          <section ref={ctaRef} className="relative py-32 md:py-40 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%)' }} aria-hidden="true" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 85% 80%, rgba(0,0,0,0.15) 0%, transparent 40%)' }} aria-hidden="true" />

            {/* Floating geometric shapes */}
            <div data-cta-shape className="absolute top-16 left-[10%] w-16 h-16 border-2 border-white/10 rounded-xl rotate-12 pointer-events-none" aria-hidden="true" />
            <div data-cta-shape className="absolute bottom-20 right-[15%] w-12 h-12 border-2 border-white/10 rounded-full pointer-events-none" aria-hidden="true" />
            <div data-cta-shape className="absolute top-1/2 left-[5%] w-8 h-8 bg-white/5 rounded-lg rotate-45 pointer-events-none" aria-hidden="true" />
            <div data-cta-shape className="absolute top-24 right-[8%] w-6 h-6 bg-white/5 rounded-full pointer-events-none" aria-hidden="true" />

            <div data-cta-inner className="max-w-3xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
                <SplitText text="Ready to Ditch the Paper Menu?" className="text-white" delay={0.1} />
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
                Join restaurants and food trucks already using Bite Byte to serve customers faster and smarter.
              </p>
              <Button
                asChild
                data-magnetic
                size="lg"
                className="bg-white text-orange-600 hover:bg-white/90 font-semibold rounded-full px-10 text-base shadow-2xl shadow-black/15 transition-shadow hover:shadow-3xl"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>

              {/* Footer integrated into CTA */}
              <div data-footer className="mt-20 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60 max-w-2xl mx-auto w-full">
                <span className="font-semibold text-white">
                  Bite <span className="text-white/90">Byte</span>
                </span>
                <span>Built for restaurants and food trucks</span>
                <span>&copy; {new Date().getFullYear()} Bite Byte</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </LenisSmoothScroll>
  );
}
