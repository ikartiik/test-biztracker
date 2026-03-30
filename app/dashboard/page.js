'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
<<<<<<< HEAD
import { 
  ShoppingCartIcon, 
  TruckIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const trackerCards = [
  { 
    name: 'Purchase Tracker', 
    icon: ShoppingCartIcon, 
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100/50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    href: '/dashboard/purchase',
    roles: ['admin', 'user'],
    description: 'Manage company purchases'
  },
  { 
    name: 'Import Tracker', 
    icon: ArchiveBoxIcon, 
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    href: '/dashboard/import',
    roles: ['admin'],
    description: 'Track international shipments'
  },
  { 
    name: 'Shipping Tracker', 
    icon: TruckIcon, 
    gradient: 'from-violet-500 to-violet-600',
    bgGradient: 'from-violet-50 to-violet-100/50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    href: '/dashboard/shipping',
    roles: ['admin'],
    description: 'Monitor outbound deliveries'
  },
  { 
    name: 'Pending Tracker', 
    icon: ClockIcon, 
    gradient: 'from-amber-500 to-amber-600',
    bgGradient: 'from-amber-50 to-amber-100/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    href: '/dashboard/pending',
    roles: ['admin', 'user'],
    description: 'Items awaiting processing'
  },
  { 
    name: 'Expense Tracker', 
    icon: CurrencyDollarIcon, 
    gradient: 'from-rose-500 to-rose-600',
    bgGradient: 'from-rose-50 to-rose-100/50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    href: '/dashboard/expense',
    roles: ['admin'],
    description: 'Financial tracking'
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    purchases: 0,
    pending: 0,
    imports: 0,
    shipping: 0,
    expenses: 0,
    totalExpense: 0,
    totalPurchase: 0
  });
=======
import {
  ShoppingCartIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const [stats, setStats]     = useState(null);
>>>>>>> blackboxai/login-mongodb-fix
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
<<<<<<< HEAD
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const [purchasesRes, pendingRes, importsRes, shippingRes, expensesRes] = await Promise.all([
        fetch('/api/purchase'),
        fetch('/api/pending'),
        fetch('/api/import'),
        fetch('/api/shipping'),
        fetch('/api/expense')
      ]);

      const [purchases, pending, imports, shipping, expenses] = await Promise.all([
        purchasesRes.json(),
        pendingRes.json(),
        importsRes.json(),
        shippingRes.json(),
        expensesRes.json()
      ]);

      const totalExpense = expenses.reduce((sum, exp) => sum + (exp.debitAmount || 0), 0);
      const totalPurchase = purchases.reduce((sum, p) => sum + (p.totalInAED || 0), 0);

      setStats({
        purchases: purchases.length,
        pending: pending.length,
        imports: imports.length,
        shipping: shipping.length,
        expenses: expenses.length,
        totalExpense,
        totalPurchase
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
=======
    if (!session) { router.push('/login'); return; }
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
>>>>>>> blackboxai/login-mongodb-fix
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const statCards = [
    {
      name: 'Total Purchases',
      value: stats.purchases,
      icon: ShoppingCartIcon,
      color: 'blue',
      href: '/dashboard/purchase'
    },
    {
      name: 'Pending Items',
      value: stats.pending,
      icon: ClockIcon,
      color: 'amber',
      href: '/dashboard/pending'
    },
    {
      name: 'Active Imports',
      value: stats.imports,
      icon: ArchiveBoxIcon,
      color: 'emerald',
      href: '/dashboard/import'
    },
    {
      name: 'Shipments',
      value: stats.shipping,
      icon: TruckIcon,
      color: 'violet',
      href: '/dashboard/shipping'
    },
  ];

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session?.user?.role?.toLowerCase() || 'user';
  const filteredCards = trackerCards.filter(card => card.roles.includes(userRole));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Welcome back, <span className="font-semibold text-blue-600">{session?.user?.username}</span>!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.name}
              onClick={() => router.push(stat.href)}
              className="card p-5 cursor-pointer hover:shadow-lg transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
=======
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  const pending  = stats?.summary?.pending?.pending  || 0;
  const urgent   = stats?.summary?.pending?.urgent   || 0;
  const balance  = stats?.summary?.expenses?.balance || 0;

  const statCards = [
    {
      label: 'Total Purchases',
      value: stats?.summary?.purchases?.total || 0,
      sub:   `AED ${(stats?.summary?.purchases?.totalAmount || 0).toLocaleString()}`,
      icon:  ShoppingCartIcon,
      ring:  'border-blue-200 dark:border-blue-900',
      badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      href:  '/dashboard/purchase',
    },
    {
      label: 'Pending Items',
      value: pending,
      sub:   `${urgent} urgent`,
      icon:  ClockIcon,
      ring:  urgent > 0 ? 'border-red-200 dark:border-red-900' : 'border-amber-200 dark:border-amber-900',
      badge: urgent > 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      href:  '/dashboard/pending',
      alert: urgent > 0,
    },
    {
      label: 'Total Expenses',
      value: `AED ${(stats?.summary?.expenses?.totalDebit || 0).toLocaleString()}`,
      sub:   `Balance: AED ${balance.toLocaleString()}`,
      icon:  CurrencyDollarIcon,
      ring:  'border-green-200 dark:border-green-900',
      badge: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      href:  '/dashboard/expense',
    },
    {
      label: 'Shipments',
      value: stats?.summary?.shipping?.total || 0,
      sub:   `${stats?.summary?.shipping?.totalQuantity || 0} items`,
      icon:  TruckIcon,
      ring:  'border-purple-200 dark:border-purple-900',
      badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      href:  '/dashboard/shipping',
    },
  ];

  const modules = [
    { name: 'Purchase Tracker', icon: ShoppingCartIcon, count: stats?.summary?.purchases?.total || 0, href: '/dashboard/purchase', color: 'bg-blue-600' },
    { name: 'Import Tracker',   icon: ArchiveBoxIcon,   count: stats?.summary?.imports?.total   || 0, href: '/dashboard/import',   color: 'bg-teal-600'  },
    { name: 'Shipping Tracker', icon: TruckIcon,        count: stats?.summary?.shipping?.total  || 0, href: '/dashboard/shipping', color: 'bg-violet-600'},
    { name: 'Pending Tracker',  icon: ClockIcon,        count: stats?.summary?.pending?.total   || 0, href: '/dashboard/pending',  color: 'bg-amber-500' },
    { name: 'Accounts',         icon: BanknotesIcon,    count: stats?.summary?.expenses?.total  || 0, href: '/dashboard/expense',  color: 'bg-emerald-600'},
    { name: 'Vendors',          icon: BuildingOfficeIcon,count: stats?.summary?.vendors?.total  || 0, href: '/dashboard/vendors',  color: 'bg-rose-600'  },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Welcome back, <span className="font-medium capitalize">{session?.user?.username}</span>
            </p>
          </div>
          {urgent > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {urgent} urgent item{urgent !== 1 ? 's' : ''} pending
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              onClick={() => router.push(card.href)}
              className={`bg-white dark:bg-gray-900 rounded-xl border ${card.ring} p-5 cursor-pointer hover:shadow-md dark:hover:shadow-black/30 transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${card.badge}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                {card.alert && (
                  <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{card.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.sub}</p>
>>>>>>> blackboxai/login-mongodb-fix
            </div>
          ))}
        </div>

<<<<<<< HEAD
        {/* Tracker Cards */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredCards.map((card, index) => (
              <div
                key={card.name}
                onClick={() => router.push(card.href)}
                className="group card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`}></div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <ArrowTrendingUpIcon className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{card.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{card.description}</p>
                </div>
=======


        {/* Module cards */}
        <div>
          {/* StatusGrid and Charts removed - per user request */}
        
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {modules.map((m) => (
              <div
                key={m.name}
                onClick={() => router.push(m.href)}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 cursor-pointer hover:shadow-md dark:hover:shadow-black/30 transition-shadow text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${m.color} mb-3`}>
                  <m.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{m.name}</p>
                <p className="text-xs text-gray-400 mt-1">{m.count}</p>
>>>>>>> blackboxai/login-mongodb-fix
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Workflow & Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflow Automation */}
          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Workflow Automation</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Purchase → Pending & Expense</p>
                  <p className="text-xs text-slate-500 mt-0.5">Auto-creates entries when purchase status is "Purchased"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Import → Pending</p>
                  <p className="text-xs text-slate-500 mt-0.5">Auto-adds to pending when import status is "Received"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-violet-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Shipping → Pending Updates</p>
                  <p className="text-xs text-slate-500 mt-0.5">Automatically reduces pending quantities when shipped</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">System Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Total Purchases (AED)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stats.totalPurchase.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Total Expenses (AED)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stats.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Your Role</span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                  {session?.user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {userRole === 'admin' && (
          <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <PlusCircleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/dashboard/purchase')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                New Purchase
              </button>
              <button
                onClick={() => router.push('/dashboard/import')}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                New Import
              </button>
              <button
                onClick={() => router.push('/dashboard/vendors')}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                Add Vendor
              </button>
            </div>
          </div>
        )}
=======
        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent purchases */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Purchases</h3>
              <button
                onClick={() => router.push('/dashboard/purchase')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>
            {stats?.recentActivity?.purchases?.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentActivity.purchases.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.itemDescription}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.vendorName} · {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        AED {(p.totalInAED || 0).toLocaleString()}
                      </p>
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 ${
                        p.status === 'Purchased'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No recent purchases</p>
            )}
          </div>

          {/* Recent expenses */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              <button
                onClick={() => router.push('/dashboard/expense')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>
            {stats?.recentActivity?.expenses?.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentActivity.expenses.map((e, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.category}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                        {e.remark || '—'} · {new Date(e.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`ml-4 text-sm font-bold shrink-0 ${
                      e.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {e.type === 'expense' ? '−' : '+'}AED {(e.amount || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No recent transactions</p>
            )}
          </div>
        </div>

>>>>>>> blackboxai/login-mongodb-fix
      </div>
    </DashboardLayout>
  );
}
<<<<<<< HEAD

=======
>>>>>>> blackboxai/login-mongodb-fix
