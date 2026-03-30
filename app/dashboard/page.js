'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
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
    } finally {
      setLoading(false);
    }
  };

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
            </div>
          ))}
        </div>

        {/* Summary strip — financial snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Credits</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                AED {(stats?.summary?.expenses?.totalCredit || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30">
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Debits</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                AED {(stats?.summary?.expenses?.totalDebit || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
              <BanknotesIcon className={`w-5 h-5 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Net Balance</p>
              <p className={`text-base font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                AED {balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <StatusGrid stats={stats} />
        
        {/* Charts Section */}
        <ChartSection stats={stats} />

        {/* Module cards */}
        <div>
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
              </div>
            ))}
          </div>
        </div>

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

      </div>
    </DashboardLayout>
  );
}
