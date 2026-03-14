import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
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
            <Button
              asChild
              className="bg-brand hover:bg-brand-dark text-white"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-24 md:py-32 text-center px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              From QR Scan to Kitchen in 60 Seconds
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Let your customers order from their phone. No app download. No account required.
              Just scan, order, done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-brand hover:bg-brand-dark text-white"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Social proof bar */}
        <section className="bg-muted py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-lg font-semibold">Zero friction ordering</p>
                <p className="text-sm text-muted-foreground mt-1">Customers order in seconds, no barriers</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Works on any phone</p>
                <p className="text-sm text-muted-foreground mt-1">Any browser, any device, no install</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Setup in minutes</p>
                <p className="text-sm text-muted-foreground mt-1">Build your menu and go live today</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              Everything You Need to Modernize Ordering
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
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
              <Card>
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
              <Card>
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
              <Card>
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

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 px-4 bg-muted">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              Up and Running in 3 Steps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Venue</h3>
                <p className="text-muted-foreground">
                  Sign up, add your restaurant or food truck, and build your menu.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Print Your QR Code</h3>
                <p className="text-muted-foreground">
                  Download your unique QR code and place it on tables or at the counter.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
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

        {/* Bottom CTA */}
        <section className="py-16 md:py-24 px-4 bg-linear-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-6xl mx-auto text-center">
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
