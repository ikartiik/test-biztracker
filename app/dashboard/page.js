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
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else {
      fetchStats();
    }
  }, [session, status, router]);

  const fetchStats = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/dashboard/stats?${params}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    fetchStats(dateFilter);
    setFilterVisible(false);
  };

  const clearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setActiveFilter('all');
    fetchStats();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const quickStatsCards = [
    {
      name: 'Total Purchases',
      value: stats?.summary?.purchases?.total || 0,
      amount: `AED ${(stats?.summary?.purchases?.totalAmount || 0).toLocaleString()}`,
      icon: ShoppingCartIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      trend: '+12%',
      trendUp: true,
      href: '/dashboard/purchase'
    },
    {
      name: 'Pending Items',
      value: stats?.summary?.pending?.pending || 0,
      subtext: `${stats?.summary?.pending?.urgent || 0} Urgent`,
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-100',
      trend: '-5%',
      trendUp: false,
      href: '/dashboard/pending'
    },
    {
      name: 'Total Expenses',
      value: `AED ${(stats?.summary?.expenses?.totalDebit || 0).toLocaleString()}`,
      subtext: `Balance: ${(stats?.summary?.expenses?.balance || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-100',
      trend: '+8%',
      trendUp: false,
      href: '/dashboard/expense'
    },
    {
      name: 'Shipments',
      value: stats?.summary?.shipping?.total || 0,
      subtext: `${stats?.summary?.shipping?.totalQuantity || 0} items shipped`,
      icon: TruckIcon,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-100',
      trend: '+15%',
      trendUp: true,
      href: '/dashboard/shipping'
    },
  ];

  // Mock chart data (enhance with API later)
  const expenseData = [
    { month: 'Jan', expenses: 4000, credits: 2400 },
    { month: 'Feb', expenses: 3000, credits: 1398 },
    { month: 'Mar', expenses: 2000, credits: 9800 },
    { month: 'Apr', expenses: 2780, credits: 3908 },
    { month: 'May', expenses: 1890, credits: 4800 },
    { month: 'Jun', expenses: 2390, credits: 3800 },
  ];

  const vendorData = [
    { name: 'Vendor A', value: 400 },
    { name: 'Vendor B', value: 300 },
    { name: 'Vendor C', value: 300 },
    { name: 'Vendor D', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const moduleCards = [
    {
      name: 'Purchase Tracker',
      icon: ShoppingCartIcon,
      gradient: 'from-blue-500 to-cyan-500',
      count: stats?.summary?.purchases?.total || 0,
      desc: 'Manage purchases',
      href: '/dashboard/purchase'
    },
    {
      name: 'Import Tracker',
      icon: ArchiveBoxIcon,
      gradient: 'from-green-500 to-emerald-500',
      count: stats?.summary?.imports?.total || 0,
      desc: 'Track imports',
      href: '/dashboard/import'
    },
    {
      name: 'Shipping Tracker',
      icon: TruckIcon,
      gradient: 'from-purple-500 to-violet-500',
      count: stats?.summary?.shipping?.total || 0,
      desc: 'Monitor shipments',
      href: '/dashboard/shipping'
    },
    {
      name: 'Pending Tracker',
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-amber-500',
      count: stats?.summary?.pending?.total || 0,
      desc: 'View pending items',
      href: '/dashboard/pending'
    },
    {
      name: 'Expense Tracker',
      icon: CurrencyDollarIcon,
      gradient: 'from-red-500 to-rose-500',
      count: stats?.summary?.expenses?.total || 0,
      desc: 'Track expenses',
      href: '/dashboard/expense'
    },
    {
      name: 'Vendors',
      icon: BuildingOfficeIcon,
      gradient: 'from-indigo-500 to-blue-500',
      count: stats?.summary?.vendors?.total || 0,
      desc: 'Manage vendors',
      href: '/dashboard/vendors'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-white opacity-5 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome back, {session?.user?.username}!</h1>
                <p className="text-blue-100 text-lg">Here's what's happening with your business today</p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all"
                >
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filters
                </button>
                <button className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  This Month
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {filterVisible && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-slideDown">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Dashboard Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={applyDateFilter}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStatsCards.map((card, index) => (
            <div
              key={card.name}
              onClick={() => router.push(card.href)}
              className="glass-card group relative overflow-hidden p-0 hover:shadow-2xl hover:shadow-primary/25 dark:hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:rotate-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30 opacity-50" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl glass bg-primary/20 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className={`flex items-center text-sm font-semibold p-2 rounded-xl ${card.trendUp ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                    {card.trendUp ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {card.trend}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{card.name}</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-1">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.amount || card.subtext}</p>
              </div>
              <div className={`h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Expense Trend Line Chart */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3 text-primary" />
              Expense Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vendor Distribution Pie Chart */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 mr-3 text-primary" />
              Vendor Spend Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vendorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {vendorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 border border-border/50 group hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-400/20">
            <div className="flex items-center mb-6 group-hover:scale-105 transition-transform">
              <div className="p-3 rounded-2xl bg-green-500/20 backdrop-blur-sm shadow-lg border border-green-500/30">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="ml-4 text-xl font-bold text-foreground">Completed</h3>
            </div>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Purchased Items</span>
                <span className="font-bold text-foreground">{stats?.summary?.purchases?.purchased || 0}</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Received Items</span>
                <span className="font-bold text-foreground">{stats?.summary?.pending?.received || 0}</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Shipped Orders</span>
                <span className="font-bold text-foreground">{stats?.summary?.shipping?.shipped || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border border-border/50 group hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-orange-400/20">
            <div className="flex items-center mb-6 group-hover:scale-105 transition-transform">
              <div className="p-3 rounded-2xl bg-orange-500/20 backdrop-blur-sm shadow-lg border border-orange-500/30">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="ml-4 text-xl font-bold text-foreground">Pending/Urgent</h3>
            </div>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between p-3 glass rounded-xl bg-orange-100/50 dark:bg-orange-900/20">
                <span className="text-muted-foreground font-medium">Urgent Items</span>
                <span className="font-bold text-orange-600">{stats?.summary?.pending?.urgent || 0}</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Pending Items</span>
                <span className="font-bold text-foreground">{stats?.summary?.pending?.pending || 0}</span>
              </div>
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Quotations</span>
                <span className="font-bold text-foreground">{stats?.summary?.purchases?.quotations || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border border-border/50 group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20">
            <div className="flex items-center mb-6 group-hover:scale-105 transition-transform">
              <div className="p-3 rounded-2xl bg-blue-500/20 backdrop-blur-sm shadow-lg border border-blue-500/30">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="ml-4 text-xl font-bold text-foreground">Financial Summary</h3>
            </div>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Total Credits</span>
                <span className="font-bold text-green-600">
                  AED {(stats?.summary?.expenses?.totalCredit || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 glass rounded-xl">
                <span className="text-muted-foreground font-medium">Total Debits</span>
                <span className="font-bold text-red-600">
                  AED {(stats?.summary?.expenses?.totalDebit || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-4 glass-card rounded-2xl border-t border-primary/30 pt-4">
                <span className="text-foreground font-bold text-xl">Balance</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-primary bg-clip-text text-transparent">
                  AED {(stats?.summary?.expenses?.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            Quick Access Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((card, index) => (
              <div
                key={card.name}
                onClick={() => router.push(card.href)}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{card.count}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.name}</h3>
                  <p className="text-sm text-gray-600">{card.desc}</p>
                </div>
                <div className={`h-1 bg-gradient-to-r ${card.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FireIcon className="w-6 h-6 text-orange-500 mr-2" />
              Recent Purchases
            </h3>
            <div className="space-y-3">
              {stats?.recentActivity?.purchases?.map((purchase, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{purchase.itemDescription}</p>
                    <p className="text-xs text-gray-500">
                      {purchase.vendorName} • {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">AED {purchase.totalInAED?.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      purchase.status === 'Purchased' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 text-red-500 mr-2" />
              Recent Expenses
            </h3>
            <div className="space-y-3">
              {stats?.recentActivity?.expenses?.map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{expense.category}</p>
                    <p className="text-xs text-gray-500">
                      {expense.remark?.substring(0, 40)}... • {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${expense.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {expense.type === 'expense' ? '-' : '+'}AED {expense.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}