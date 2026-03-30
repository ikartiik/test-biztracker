'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { PlusIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportPending } from '@/lib/exportExcel';

export default function PendingTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'Urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Tracker</h1>
            <p className="mt-2 text-gray-600">Track and manage pending items</p>
          </div>
          <button
            onClick={() => exportPending(pendingItems)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.srNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemDescription}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.qtyPending}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.shipment}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.priority}
                          onChange={(e) => handlePriorityChange(item._id, e.target.value)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 ${getPriorityColor(item.priority)}`}
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
              {pendingItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No pending items found. Items will appear here automatically from purchases and imports.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}