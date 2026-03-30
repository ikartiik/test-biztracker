'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';
import { exportPending } from '@/lib/exportExcel';

export default function PendingTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchPendingItems();
  }, [session, router]);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pending');
      const data = await response.json();
      setPendingItems(data);
    } catch (error) {
      toast.error('Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'Urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPendingItems = pendingItems.filter(item => {
    const matchesSearch = item.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalQtyPending = pendingItems.reduce((sum, p) => sum + (p.qtyPending || 0), 0);
  const urgentCount = pendingItems.filter(p => p.priority === 'Urgent').length;
  const criticalCount = pendingItems.filter(p => p.priority === 'Critical').length;

  if (loading) return <div className="p-8 text-center">Loading pending items...</div>;
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pending Tracker</h1>
            <p className="text-muted-foreground mt-2">Track items awaiting action ({pendingItems.length} total)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportPending(filteredPendingItems)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              disabled={filteredPendingItems.length === 0}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pending Quantity</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{totalQtyPending}</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Items</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{urgentCount}</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Items</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{criticalCount}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by item or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Item Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Qty Pending
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPendingItems.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.itemDescription}</div>
                      <div className="text-sm text-muted-foreground">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{item.vendorName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        item.source === 'Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono font-semibold text-lg text-primary">
                        {item.qtyPending}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => router.push(`/dashboard/shipping?pending=${item._id}`)}
                        className="text-primary hover:underline flex items-center gap-1 justify-end"
                      >
                        Ship Items
                        <ArrowUpCircleIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPendingItems.length === 0 && !loading && (
            <div className="text-center py-20">
              <ClockIcon className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-3">No pending items</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                All items have been processed or shipped. Sync data from Purchase/Import trackers to see new pending items.
              </p>
              <button
                onClick={fetchPendingItems}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl hover:bg-primary/90 font-semibold"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
