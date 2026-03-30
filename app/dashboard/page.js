'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ShoppingCartIcon, TruckIcon, ClockIcon, CurrencyDollarIcon,
  ArchiveBoxIcon, BuildingOfficeIcon, ExclamationTriangleIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === 'loading' || loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background gap-3 text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading…</span>
    </div>
  );
  if (!session) return null;

  const s = stats?.summary || {};
  const urgent = s.pending?.urgent || 0;

  // Top stat cards
  const statCards = [
    {
      label:   'Total Purchases',
      value:   s.purchases?.total ?? 0,
      sub:     `${s.purchases?.purchased ?? 0} purchased · ${s.purchases?.toPurchase ?? 0} to purchase`,
      icon:    ShoppingCartIcon,
      color:   'blue',
      href:    '/dashboard/purchase',
    },
    {
      label:   'Pending Items',
      value:   s.pending?.total ?? 0,
      sub:     `${s.pending?.urgent ?? 0} urgent`,
      icon:    ClockIcon,
      color:   s.pending?.urgent > 0 ? 'amber' : 'slate',
      href:    '/dashboard/pending',
      alert:   s.pending?.urgent > 0,
    },
    {
      label:   'Imports',
      value:   s.imports?.total ?? 0,
      sub:     `${s.imports?.enroute ?? 0} en route · ${s.imports?.received ?? 0} received`,
      icon:    ArchiveBoxIcon,
      color:   'teal',
      href:    '/dashboard/import',
    },
    {
      label:   'Shipments',
      value:   s.shipping?.total ?? 0,
      sub:     `${s.shipping?.shipped ?? 0} fully shipped`,
      icon:    TruckIcon,
      color:   'violet',
      href:    '/dashboard/shipping',
    },
    {
      label:   'Balance',
      value:   `AED ${((s.expenses?.balance) ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub:     `${(s.expenses?.totalCredit ?? 0).toLocaleString()} cr · ${(s.expenses?.totalDebit ?? 0).toLocaleString()} dr`,
      icon:    BanknotesIcon,
      color:   (s.expenses?.balance ?? 0) >= 0 ? 'emerald' : 'red',
      href:    '/dashboard/expense',
    },
    {
      label:   'Vendors',
      value:   s.vendors?.total ?? 0,
      sub:     'Active suppliers',
      icon:    BuildingOfficeIcon,
      color:   'rose',
      href:    '/dashboard/vendors',
    },
  ];

  const colorMap = {
    blue:   { bg: 'bg-blue-50   dark:bg-blue-950/30',   icon: 'bg-blue-600',   text: 'text-blue-600'   },
    amber:  { bg: 'bg-amber-50  dark:bg-amber-950/30',  icon: 'bg-amber-500',  text: 'text-amber-600'  },
    teal:   { bg: 'bg-teal-50   dark:bg-teal-950/30',   icon: 'bg-teal-600',   text: 'text-teal-600'   },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', icon: 'bg-violet-600', text: 'text-violet-600' },
    emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'bg-emerald-600', text: 'text-emerald-600' },
    red:    { bg: 'bg-red-50    dark:bg-red-950/30',    icon: 'bg-red-600',    text: 'text-red-600'    },
    rose:   { bg: 'bg-rose-50   dark:bg-rose-950/30',   icon: 'bg-rose-600',   text: 'text-rose-600'   },
    slate:  { bg: 'bg-slate-50  dark:bg-slate-800/30',  icon: 'bg-slate-500',  text: 'text-slate-600'  },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Welcome + alert */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Good {getGreeting()}, <span className="capitalize">{session?.user?.username}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's what's happening across your business today.
            </p>
          </div>
          {urgent > 0 && (
            <Link href="/dashboard/pending"
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold shrink-0">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {urgent} urgent item{urgent !== 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map(card => {
            const c = colorMap[card.color] || colorMap.slate;
            return (
              <Link key={card.label} href={card.href}
                className={`glass-card p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all group ${card.alert ? 'ring-2 ring-amber-400/50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${c.icon} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className="w-4.5 h-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
                  </div>
                  {card.alert && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                      !
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-black text-foreground mt-0.5 leading-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </Link>
            );
          })}
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent purchases */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent Purchases</h3>
              <Link href="/dashboard/purchase" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {stats?.recentActivity?.purchases?.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.recentActivity.purchases.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{p.itemDescription}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.vendorName || '—'} · {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        AED {(p.totalInAED || 0).toLocaleString()}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                        ${p.status === 'Purchased'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                          : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent purchases</div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
              <Link href="/dashboard/expense" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            {stats?.recentActivity?.expenses?.length > 0 ? (
              <div className="divide-y divide-border">
                {stats.recentActivity.expenses.map((e, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{e.category}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {e.remark || '—'} · {new Date(e.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`ml-4 text-sm font-bold shrink-0 ${
                      e.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {e.type === 'expense' ? '−' : '+'}AED {(e.amount || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent transactions</div>
            )}
          </div>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Credits', value: s.expenses?.totalCredit ?? 0, color: 'text-emerald-600', icon: ArrowTrendingUpIcon },
            { label: 'Total Debits',  value: s.expenses?.totalDebit  ?? 0, color: 'text-red-600',     icon: ArrowTrendingDownIcon },
            { label: 'Net Balance',   value: s.expenses?.balance     ?? 0, color: (s.expenses?.balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600', icon: BanknotesIcon },
          ].map(item => (
            <div key={item.label} className="glass-card px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4.5 h-4.5 text-muted-foreground" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                <p className={`text-lg font-black ${item.color}`}>
                  AED {Math.abs(item.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
