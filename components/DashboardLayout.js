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
  ArchiveBoxIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  MoonIcon,
  SunIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const allNavigation = [
  { name: 'Dashboard',        href: '/dashboard',          icon: Squares2X2Icon,    roles: ['admin', 'user'] },
  { name: 'Purchase Tracker', href: '/dashboard/purchase', icon: ShoppingCartIcon,  roles: ['admin', 'user'] },
  { name: 'Import Tracker',   href: '/dashboard/import',   icon: GlobeAltIcon,      roles: ['admin'] },
  { name: 'Shipping Tracker', href: '/dashboard/shipping', icon: TruckIcon,         roles: ['admin'] },
  { name: 'Pending Tracker',  href: '/dashboard/pending',  icon: ClockIcon,         roles: ['admin', 'user'] },
  { name: 'Accounts',         href: '/dashboard/expense',  icon: CurrencyDollarIcon,roles: ['admin'] },
  { name: 'Vendors',          href: '/dashboard/vendors',  icon: BuildingOfficeIcon,roles: ['admin'] },
  { name: 'Users',            href: '/dashboard/users',    icon: UserIcon,          roles: ['admin'] },
];

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [isDark, setIsDark]           = useState(false);
  const { data: session }             = useSession();
  const router                        = useRouter();
  const pathname                      = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dark      = localStorage.getItem('theme') === 'dark';
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsDark(dark);
    setCollapsed(collapsed);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const navigation = allNavigation.filter(item =>
    item.roles.includes(session?.user?.role?.toLowerCase() || 'user')
  );

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const sidebarW = collapsed ? 'lg:w-[64px]' : 'lg:w-[220px]';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex">

      {/* ── Mobile overlay ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-slate-900 dark:bg-gray-950
          border-r border-slate-800 dark:border-gray-800
          transition-[width] duration-200 ease-in-out overflow-hidden
          ${sidebarW}
          w-[220px]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand row */}
        <div className={`flex items-center h-[56px] shrink-0 px-3 border-b border-slate-800 dark:border-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link
              href="/dashboard"
              className="text-sm font-bold text-white truncate tracking-wide"
              onClick={() => setMobileOpen(false)}
            >
              Concentric
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {collapsed
              ? <ChevronRightIcon className="w-4 h-4" />
              : <ChevronLeftIcon  className="w-4 h-4" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`
                  group flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-150 whitespace-nowrap
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white dark:hover:bg-gray-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + sign out */}
        <div className="shrink-0 border-t border-slate-800 dark:border-gray-800 px-2 py-3 space-y-0.5">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {isDark
              ? <SunIcon  className="w-[18px] h-[18px] shrink-0" />
              : <MoonIcon className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* User info row */}
          {!collapsed && session?.user && (
            <div className="px-2.5 py-2">
              <p className="text-xs font-semibold text-white truncate capitalize">
                {session.user.username}
              </p>
              <p className="text-xs text-slate-400 capitalize">{session.user.role}</p>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <ArrowRightOnRectangleIcon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Content area ───────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-[padding] duration-200 ${collapsed ? 'lg:pl-[64px]' : 'lg:pl-[220px]'}`}>

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex h-[56px] items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-900 dark:text-white">Concentric</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-5 lg:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
