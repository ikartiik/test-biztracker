'use client';

<<<<<<< HEAD
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
=======
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
  HomeIcon,
  ChevronDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'user'] },
  { name: 'Purchase Tracker', href: '/dashboard/purchase', icon: ShoppingCartIcon, roles: ['admin', 'user'] },
  { name: 'Import Tracker', href: '/dashboard/import', icon: GlobeAltIcon, roles: ['admin'] },
  { name: 'Shipping Tracker', href: '/dashboard/shipping', icon: TruckIcon, roles: ['admin'] },
  { name: 'Pending Tracker', href: '/dashboard/pending', icon: ClockIcon, roles: ['admin', 'user'] },
  { name: 'Expense Tracker', href: '/dashboard/expense', icon: CurrencyDollarIcon, roles: ['admin'] },
  { name: 'Vendors', href: '/dashboard/vendors', icon: BuildingOfficeIcon, roles: ['admin'] },
  { name: 'User Management', href: '/dashboard/users', icon: UserIcon, roles: ['admin'] },
];

export default function DashboardLayout({ children, activeTab = 'dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
=======
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
>>>>>>> blackboxai/login-mongodb-fix

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

<<<<<<< HEAD
  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => 
    item.roles.includes(session?.user?.role?.toLowerCase() || 'user')
  );

  const getPageTitle = () => {
    const currentItem = allNavigation.find(item => item.href === router.pathname);
    return currentItem?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-white shadow-2xl">
          <div className="flex items-center justify-between h-16 px-5 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Concentric</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white/80 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  router.pathname === item.href || (item.href !== '/dashboard' && router.pathname?.startsWith(item.href))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${router.pathname === item.href ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center p-2 rounded-lg bg-slate-50">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{session?.user?.username}</p>
                <p className="text-xs text-slate-500 capitalize">{session?.user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200 shadow-sm">
          <div className="flex items-center h-16 px-5 bg-gradient-to-r from-blue-600 to-indigo-600">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Concentric</span>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  router.pathname === item.href || (item.href !== '/dashboard' && router.pathname?.startsWith(item.href))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${router.pathname === item.href ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center p-2 rounded-lg bg-slate-50">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{session?.user?.username}</p>
                <p className="text-xs text-slate-500 capitalize">{session?.user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">Concentric</span>
          </Link>
          <div className="w-9"></div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6 xl:p-8">
          <div className="animate-fade-in">
            {children}
          </div>
=======
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
>>>>>>> blackboxai/login-mongodb-fix
        </main>
      </div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> blackboxai/login-mongodb-fix
