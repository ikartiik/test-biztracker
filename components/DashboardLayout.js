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
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches));
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.theme = newTheme ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Purchase', href: '/dashboard/purchase', icon: ShoppingCartIcon },
    { name: 'Pending', href: '/dashboard/pending', icon: ClockIcon },
    { name: 'Shipping', href: '/dashboard/shipping', icon: TruckIcon },
    { name: 'Import', href: '/dashboard/import', icon: BanknotesIcon },
    { name: 'Expense', href: '/dashboard/expense', icon: CurrencyDollarIcon },
    { name: 'Vendors', href: '/dashboard/vendors', icon: BuildingOfficeIcon },
  ];

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card backdrop-blur-sm border-r shadow-xl">
            <div className="flex flex-col h-full p-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-accent transition-all ${
                    pathname === item.href ? 'bg-primary text-primary-foreground font-semibold shadow-lg' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-accent transition-all"
              >
                {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                Toggle {isDark ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-all"
              >
                <ChevronDownIcon className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-card/80 backdrop-blur-sm border-r border-border shadow-xl">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              BizTracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{session.user.username}</p>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-accent transition-all group ${
                  pathname === item.href ? 'bg-primary text-primary-foreground shadow-lg font-semibold border border-primary/20' : ''
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-accent transition-all"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-all"
            >
              <ChevronDownIcon className="w-5 h-5 rotate-180" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-20">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{pathname.split('/').pop()?.replace('-', ' ').toUpperCase()}</span>
              </div>
            </div>
          </header>
          
          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
