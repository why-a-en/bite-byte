'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Store,
  Plus,
  Menu,
  X,
  UtensilsCrossed,
  Settings,
  LogOut,
  ClipboardList,
  History,
  BarChart3,
} from 'lucide-react';
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

function NavItem({
  href,
  icon: Icon,
  children,
  exact = false,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={[
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  );
}

function SubNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

function SidebarContent({ venues }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-brand flex items-center justify-center shrink-0">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-base tracking-tight">Bite Byte</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {/* Main */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
            Main
          </p>
          <NavItem href="/dashboard" icon={LayoutDashboard} exact>
            Dashboard
          </NavItem>
        </div>

        {/* Venues */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Venues
            </p>
            <Link
              href="/venues/new"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="New venue"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          {venues.length === 0 ? (
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">No venues yet.</p>
              <Link href="/venues/new" className="text-xs text-primary hover:underline mt-0.5 inline-block">
                Create one →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {venues.map((venue) => (
                <div key={venue.id}>
                  <NavItem href={`/venues/${venue.id}`} icon={Store}>
                    <span className="truncate">{venue.name}</span>
                  </NavItem>
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l pl-3">
                    <SubNavItem href={`/venues/${venue.id}/orders`}>
                      <ClipboardList className="h-3 w-3 shrink-0" />
                      Orders
                    </SubNavItem>
                    <SubNavItem href={`/venues/${venue.id}/history`}>
                      <History className="h-3 w-3 shrink-0" />
                      History
                    </SubNavItem>
                    <SubNavItem href={`/venues/${venue.id}/analytics`}>
                      <BarChart3 className="h-3 w-3 shrink-0" />
                      Analytics
                    </SubNavItem>
                    <SubNavItem href={`/venues/${venue.id}/menu`}>
                      <UtensilsCrossed className="h-3 w-3 shrink-0" />
                      Menu
                    </SubNavItem>
                    <SubNavItem href={`/venues/${venue.id}`}>
                      <Settings className="h-3 w-3 shrink-0" />
                      Settings
                    </SubNavItem>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ venues }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:bg-background h-screen sticky top-0 shrink-0">
        <SidebarContent venues={venues} />
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 bg-background h-full shadow-xl border-r">
            <div className="absolute top-3 right-3">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent venues={venues} />
          </aside>
        </div>
      )}
    </>
  );
}
