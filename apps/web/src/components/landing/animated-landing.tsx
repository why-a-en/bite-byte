'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedLanding() {
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroSubtextRef = useRef<HTMLParagraphElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const heroBlob1Ref = useRef<HTMLDivElement>(null);
  const heroBlob2Ref = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const decorDot1Ref = useRef<HTMLDivElement>(null);
  const decorDot2Ref = useRef<HTMLDivElement>(null);
  const decorCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // a) Hero entrance animations
      if (heroHeadlineRef.current) {
        gsap.from(heroHeadlineRef.current, {
          y: 30,
          opacity: 0,
          scale: 0.95,
          duration: 1,
          ease: 'power3.out',
        });
      }

      if (heroSubtextRef.current) {
        gsap.from(heroSubtextRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          delay: 0.2,
          ease: 'power3.out',
        });
      }

      if (heroCTARef.current) {
        const buttons = heroCTARef.current.querySelectorAll('a');
        gsap.from(buttons, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.4,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }

      // b) Parallax background drift on hero blobs
      if (heroBlob1Ref.current) {
        gsap.to(heroBlob1Ref.current, {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: heroBlob1Ref.current.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (heroBlob2Ref.current) {
        gsap.to(heroBlob2Ref.current, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: heroBlob2Ref.current.parentElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // c) Social proof bar stagger
      if (socialProofRef.current) {
        const cols = socialProofRef.current.querySelectorAll('[data-social-col]');
        gsap.from(cols, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: socialProofRef.current,
            start: 'top 80%',
          },
        });
      }

      // d) Feature cards staggered reveal
      if (featureCardsRef.current) {
        const cards = featureCardsRef.current.querySelectorAll('[data-feature-card]');
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: 'top 80%',
          },
        });
      }

      // e) How-it-works sequential reveal
      if (howItWorksRef.current) {
        const steps = howItWorksRef.current.querySelectorAll('[data-step]');
        gsap.from(steps, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: 'top 80%',
          },
        });

        const circles = howItWorksRef.current.querySelectorAll('[data-step-circle]');
        gsap.from(circles, {
          scale: 0,
          duration: 0.6,
          stagger: 0.2,
          delay: 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: 'top 80%',
          },
        });
      }

      // f) CTA section parallax
      if (ctaSectionRef.current) {
        const inner = ctaSectionRef.current.querySelector('[data-cta-inner]');
        if (inner) {
          gsap.from(inner, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: 'top 80%',
            },
          });
        }
      }

      // Decorative floating elements parallax
      if (decorDot1Ref.current) {
        gsap.to(decorDot1Ref.current, {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (decorDot2Ref.current) {
        gsap.to(decorDot2Ref.current, {
          y: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (decorCircleRef.current) {
        gsap.to(decorCircleRef.current, {
          y: -120,
          ease: 'none',
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
        aria-hidden="true"
      />

      {/* Nav bar — glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Bite <span className="text-orange-500">Byte</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Button asChild className="bg-brand hover:bg-brand-dark text-white">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-24 md:py-32 text-center px-4 relative overflow-hidden">
          {/* Parallax gradient blobs */}
          <div
            ref={heroBlob1Ref}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            aria-hidden="true"
          />
          <div
            ref={heroBlob2Ref}
            className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <h1
              ref={heroHeadlineRef}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              From QR Scan to Kitchen in{' '}
              <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent">
                60 Seconds
              </span>
            </h1>
            <p
              ref={heroSubtextRef}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Let your customers order from their phone. No app download. No account required.
              Just scan, order, done.
            </p>
            <div ref={heroCTARef} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-brand hover:bg-brand-dark text-white">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Wave divider */}
        <div className="relative h-12 -mt-1 overflow-hidden" aria-hidden="true">
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z"
              fill="hsl(var(--muted))"
            />
          </svg>
        </div>

        {/* Social proof bar */}
        <section className="bg-muted py-10 px-4">
          <div ref={socialProofRef} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div data-social-col>
                <p className="text-lg font-semibold">Zero friction ordering</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Customers order in seconds, no barriers
                </p>
              </div>
              <div data-social-col>
                <p className="text-lg font-semibold">Works on any phone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Any browser, any device, no install
                </p>
              </div>
              <div data-social-col>
                <p className="text-lg font-semibold">Setup in minutes</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Build your menu and go live today
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Wave divider (reverse) */}
        <div className="relative h-12 -mt-1 overflow-hidden bg-muted" aria-hidden="true">
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>

        {/* Features grid */}
        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
          {/* Decorative floating elements */}
          <div
            ref={decorDot1Ref}
            className="absolute top-16 left-8 pointer-events-none opacity-[0.07]"
            aria-hidden="true"
          >
            <svg width="120" height="120" viewBox="0 0 120 120">
              {Array.from({ length: 25 }).map((_, i) => (
                <circle
                  key={i}
                  cx={(i % 5) * 24 + 12}
                  cy={Math.floor(i / 5) * 24 + 12}
                  r="3"
                  fill="currentColor"
                  className="text-orange-500"
                />
              ))}
            </svg>
          </div>
          <div
            ref={decorDot2Ref}
            className="absolute bottom-16 right-8 pointer-events-none opacity-[0.07]"
            aria-hidden="true"
          >
            <svg width="100" height="100" viewBox="0 0 100 100">
              {Array.from({ length: 16 }).map((_, i) => (
                <circle
                  key={i}
                  cx={(i % 4) * 24 + 12}
                  cy={Math.floor(i / 4) * 24 + 12}
                  r="3"
                  fill="currentColor"
                  className="text-orange-400"
                />
              ))}
            </svg>
          </div>
          <div
            ref={decorCircleRef}
            className="absolute top-1/2 -right-24 w-64 h-64 rounded-full border border-orange-200/20 pointer-events-none opacity-[0.08]"
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              Everything You Need to Modernize Ordering
            </h2>
            <div ref={featureCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                data-feature-card
                className="border border-border/50 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle>Instant QR Ordering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Customers scan a QR code at their table and browse your full menu on their
                    phone. No app install needed.
                  </p>
                </CardContent>
              </Card>
              <Card
                data-feature-card
                className="border border-border/50 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle>Real-Time Order Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Orders appear on your live dashboard the moment they are placed. Track status
                    from received to completed.
                  </p>
                </CardContent>
              </Card>
              <Card
                data-feature-card
                className="border border-border/50 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle>Flexible Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Accept card payments via Stripe or let customers pay at the counter. You
                    choose.
                  </p>
                </CardContent>
              </Card>
              <Card
                data-feature-card
                className="border border-border/50 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    See your top-selling items, daily revenue, and order volume at a glance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Wave divider */}
        <div className="relative h-12 -mt-1 overflow-hidden" aria-hidden="true">
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z"
              fill="hsl(var(--muted))"
            />
          </svg>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 px-4 bg-muted">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              Up and Running in 3 Steps
            </h2>
            <div ref={howItWorksRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div data-step className="text-center">
                <div
                  data-step-circle
                  className="w-12 h-12 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center mx-auto mb-4"
                >
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Venue</h3>
                <p className="text-muted-foreground">
                  Sign up, add your restaurant or food truck, and build your menu.
                </p>
              </div>
              <div data-step className="text-center">
                <div
                  data-step-circle
                  className="w-12 h-12 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center mx-auto mb-4"
                >
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Print Your QR Code</h3>
                <p className="text-muted-foreground">
                  Download your unique QR code and place it on tables or at the counter.
                </p>
              </div>
              <div data-step className="text-center">
                <div
                  data-step-circle
                  className="w-12 h-12 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center mx-auto mb-4"
                >
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Taking Orders</h3>
                <p className="text-muted-foreground">
                  Customers scan, order, and pay. You see it all in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Wave divider (reverse) */}
        <div className="relative h-12 -mt-1 overflow-hidden bg-muted" aria-hidden="true">
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>

        {/* Bottom CTA */}
        <section
          ref={ctaSectionRef}
          className="py-16 md:py-24 px-4 bg-linear-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          <div data-cta-inner className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to Ditch the Paper Menu?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Join restaurants and food trucks already using Bite Byte to serve customers faster
              and smarter.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90 font-semibold"
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            Bite <span className="text-orange-500">Byte</span>
          </span>
          <span>Built for restaurants and food trucks</span>
          <span>&copy; {new Date().getFullYear()} Bite Byte. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
