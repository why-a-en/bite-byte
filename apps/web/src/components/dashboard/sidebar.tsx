'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Store, Plus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/actions/auth';

interface Venue {
  id: string;
  name: string;
  slug: string;
}

interface SidebarProps {
  venues: Venue[];
}

function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Link>
  );
}

export function Sidebar({ venues }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / branding */}
      <div className="px-4 py-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand">Bite Byte</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        {/* Venues section */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Venues
            </span>
            <Link
              href="/venues/new"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Add new venue"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>

          {venues.length === 0 ? (
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">No venues yet</p>
              <Link
                href="/venues/new"
                className="text-xs text-primary hover:underline mt-1 inline-block"
              >
                Create your first venue
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {venues.map((venue) => (
                <NavLink key={venue.id} href={`/venues/${venue.id}`}>
                  <Store className="h-4 w-4 shrink-0" />
                  <span className="truncate">{venue.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t">
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-background h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-background h-full shadow-xl">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
