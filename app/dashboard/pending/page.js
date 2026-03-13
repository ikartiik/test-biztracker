'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { 
  ClockIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';

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
      const response = await fetch('/api/pending');
      const data = await response.json();
      setPendingItems(data);
    } catch (error) {
      toast.error('Error fetching pending items');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (itemId, newPriority) => {
    try {
      const response = await fetch(`/api/pending?id=${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        toast.success('Priority updated successfully');
        fetchPendingItems();
      } else {
        toast.error('Error updating priority');
      }
    } catch (error) {
      toast.error('Error updating priority');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'badge-danger';
      case 'Urgent': return 'badge-warning';
      default: return 'badge-success';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'badge-success';
      case 'Shipped': return 'badge-info';
      case 'Partially Shipped': return 'badge-warning';
      case 'Enroute': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  // Filter pending items
  const filteredItems = pendingItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.srNo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const totalItems = pendingItems.length;
  const criticalCount = pendingItems.filter(p => p.priority === 'Critical').length;
  const urgentCount = pendingItems.filter(p => p.priority === 'Urgent').length;
  const totalQtyPending = pendingItems.reduce((sum, p) => sum + (p.qtyPending || 0), 0);

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-amber-600" />
              Pending Tracker
            </h1>
            <p className="mt-1 text-slate-600">Track and manage pending items from purchases and imports</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Pending</p>
                <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Urgent</p>
                <p className="text-2xl font-bold text-amber-600">{urgentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <ArrowUpCircleIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Qty</p>
                <p className="text-2xl font-bold text-slate-900">{totalQtyPending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by item or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full sm:w-40"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Shipped">Shipped</option>
              <option value="Partially Shipped">Partially Shipped</option>
              <option value="Enroute">Enroute</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input w-full sm:w-40"
            >
              <option value="all">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="Urgent">Urgent</option>
              <option value="Not Urgent">Not Urgent</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-500 mt-2">Loading...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <ClockIcon className="w-16 h-16 mx-auto text-slate-300" />
              <p className="text-lg font-medium text-slate-500 mt-4">No pending items found</p>
              <p className="text-sm text-slate-400">Items will appear here automatically from purchases and imports</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Item Description</th>
                  <th>Qty Pending</th>
                  <th>Shipment</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-900">{item.srNo}</td>
                    <td className="text-slate-900">{item.itemDescription}</td>
                    <td className="text-slate-900 font-medium">{item.qtyPending}</td>
                    <td className="text-slate-600">{item.shipment}</td>
                    <td>
                      <span className={`badge ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={item.priority}
                        onChange={(e) => handlePriorityChange(item._id, e.target.value)}
                        className={`input w-auto py-1 px-2 text-xs font-semibold rounded-full border-0 cursor-pointer ${getPriorityColor(item.priority)}`}
                      >
                        <option value="Not Urgent">Not Urgent</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredItems.length > 0 && (
          <p className="text-sm text-slate-500 text-right">
            Showing {filteredItems.length} of {pendingItems.length} items
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

