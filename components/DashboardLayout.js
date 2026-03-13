'use client';

import { useState } from 'react';
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

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
        </main>
      </div>
    </div>
  );
}

