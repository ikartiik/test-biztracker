'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard',          icon: HomeIcon,           adminOnly: false },
  { name: 'Purchase',  href: '/dashboard/purchase',  icon: ShoppingCartIcon,   adminOnly: false },
  { name: 'Pending',   href: '/dashboard/pending',   icon: ClockIcon,          adminOnly: false },
  { name: 'Shipping',  href: '/dashboard/shipping',  icon: TruckIcon,          adminOnly: false },
  { name: 'Import',    href: '/dashboard/import',    icon: BanknotesIcon,      adminOnly: false },
  { name: 'Expense',   href: '/dashboard/expense',   icon: CurrencyDollarIcon, adminOnly: false },
  { name: 'Vendors',   href: '/dashboard/vendors',   icon: BuildingOfficeIcon, adminOnly: false },
  { name: 'Users',     href: '/dashboard/users',     icon: UsersIcon,          adminOnly: true  },
];

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const router            = useRouter();
  const pathname          = usePathname();
  const [isDark,          setIsDark]          = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);

  /* Initialise dark mode from localStorage / system preference */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.theme = next ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', next);
  };

  if (!session) return null;

  const initials = (session.user?.username ?? 'U')
    .slice(0, 2)
    .toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">BizTracker</p>
            <p className="text-slate-400 text-xs leading-tight capitalize">{session.user?.username}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation
          .filter(item => !item.adminOnly || session?.user?.role === 'admin')
          .map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-100
                ${active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }
              `}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-700/60 space-y-0.5">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          {isDark
            ? <SunIcon  className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
            : <MoonIcon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
          }
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay + drawer ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 flex flex-col animate-slide-down">
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              {mobileMenuOpen
                ? <XMarkIcon   className="w-5 h-5" />
                : <Bars3Icon   className="w-5 h-5" />
              }
            </button>
            <span className="text-sm font-semibold text-foreground capitalize">
              {pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 md:p-7">
          {children}
        </main>

      </div>
    </div>
  );
}
