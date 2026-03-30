'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  SunIcon
} from '@heroicons/react/24/outline';

const allNavigation = [
  { name: 'Purchase Tracker', href: '/dashboard/purchase', icon: ShoppingCartIcon, roles: ['admin', 'user'] },
  { name: 'Import Tracker', href: '/dashboard/import', icon: GlobeAltIcon, roles: ['admin'] },
  { name: 'Shipping Tracker', href: '/dashboard/shipping', icon: TruckIcon, roles: ['admin'] },
  { name: 'Pending Tracker', href: '/dashboard/pending', icon: ClockIcon, roles: ['admin', 'user'] },
  { name: 'Accounts Tracker', href: '/dashboard/expense', icon: CurrencyDollarIcon, roles: ['admin'] },
  { name: 'Vendors', href: '/dashboard/vendors', icon: BuildingOfficeIcon, roles: ['admin'] },
  { name: 'User Management', href: '/dashboard/users', icon: UserIcon, roles: ['admin'] },
];

export default function DashboardLayout({ children, activeTab = 'dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') === 'dark';
      setIsDark(saved);
      document.documentElement.classList.toggle('dark', saved);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newDark);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => 
    item.roles.includes(session?.user?.role?.toLowerCase() || 'user')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">Tracker System</h1>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary to-primary/80 backdrop-blur-md">
            <Link href="/dashboard" className="text-xl font-bold text-primary-foreground">
              Tracker System
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-black/30 transition-all"
              title="Toggle theme"
            >
              {isDark ? <SunIcon className="w-5 h-5 text-primary-foreground" /> : <MoonIcon className="w-5 h-5 text-primary-foreground" />}
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session?.user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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
        <div className="flex items-center justify-between h-16 px-4 glass border-b dark:border-white/20 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-foreground hover:bg-accent rounded-xl transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="text-lg font-semibold text-foreground">
            Tracker System
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-accent/50 hover:bg-accent rounded-xl transition-all"
              title="Toggle theme"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-foreground hover:bg-accent rounded-xl transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}