'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  TruckIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { exportShipping } from '@/lib/exportExcel';

export default function ShippingTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shippingEntries, setShippingEntries] = useState([]);
  const [filteredShippingEntries, setFilteredShippingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [shipmentData, setShipmentData] = useState({
    quantityShipped: '',
    dateOfShipping: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [bulkShipmentData, setBulkShipmentData] = useState({
    dateOfShipping: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchShippingEntries();
  }, [session, router]);

  // Apply filters whenever shippingEntries or filters change
  useEffect(() => {
    applyFilters();
  }, [shippingEntries]);

  const fetchShippingEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping');
      const data = await response.json();
      setShippingEntries(data);
    } catch (error) {
      toast.error('Failed to load shipping entries');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    // Simple filtering logic - extend as needed
    setFilteredShippingEntries(shippingEntries);
  }, [shippingEntries]);

  const syncWithImportsPurchases = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/shipping/sync', { method: 'POST' });
      if (response.ok) {
        toast.success('Pending tracker updated');
        fetchShippingEntries();
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleShipment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shipmentData,
          pendingItems: selectedItems
        }),
      });
      
      if (response.ok) {
        toast.success('Shipment added successfully and pending tracker updated');
        fetchShippingEntries();
        closeShipmentModal();
      }
    } catch (error) {
      toast.error('Failed to save shipment');
    }
  };

  const handleBulkShipment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/shipping/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bulkShipmentData,
          pendingItems: selectedItems
        }),
      });
      
      if (response.ok) {
        toast.success('Bulk shipment completed');
        fetchShippingEntries();
        setSelectedItems([]);
      }
    } catch (error) {
      toast.error('Bulk shipment failed');
    }
  };

  const handleDeleteShipment = async (shippingId, shipmentIndex) => {
    if (window.confirm('Are you sure you want to delete this shipment entry?')) {
      try {
        const response = await fetch(`/api/shipping/${shippingId}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Shipment deleted');
          fetchShippingEntries();
        }
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const closeShipmentModal = () => {
    setIsShipmentModalOpen(false);
    setSelectedItems([]);
    setShipmentData({
      quantityShipped: '',
      dateOfShipping: new Date().toISOString().split('T')[0],
      remarks: ''
    });
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'Import': return 'bg-blue-100 text-blue-800';
      case 'Purchase': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading shipping entries...</div>;
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shipping Tracker</h1>
            <p className="text-muted-foreground mt-2">Manage shipments and track delivery status ({filteredShippingEntries.length})</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncWithImportsPurchases}
              disabled={syncing}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-semibold disabled:opacity-50 transition-all"
            >
              <ArrowPathIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterVisible && (
          <div className="glass-card p-6">
            {/* Filter controls */}
            <p className="text-sm text-muted-foreground">Filters coming soon...</p>
          </div>
        )}

        {/* Main Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Item/Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity Shipped
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Remarks
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredShippingEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{entry.pendingItemDescription}</div>
                      <div className="text-xs text-muted-foreground">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(entry.source)}`}>
                          {entry.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold">{entry.quantityShipped}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(entry.dateOfShipping).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                        {entry.status || 'Shipped'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm line-clamp-2">{entry.remarks}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsHistoryModalOpen(true)}
                          className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-primary transition-colors"
                          title="View History"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShipment(entry._id, entry.shipmentIndex)}
                          className="p-2 hover:bg-destructive/10 rounded-xl text-destructive hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredShippingEntries.length === 0 && !loading && (
            <div className="text-center py-20">
              <TruckIcon className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-3">No shipping entries</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Click "Sync Data" to import pending items from Purchase and Import trackers.
              </p>
              <button
                onClick={syncWithImportsPurchases}
                disabled={syncing}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl hover:bg-primary/90 font-semibold shadow-lg disabled:opacity-50 transition-all"
              >
                {syncing ? 'Syncing...' : 'Sync Data'}
              </button>
            </div>
          )}
        </div>

        {/* Shipment Modal */}
        {isShipmentModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Create Shipment</h3>
                <form onSubmit={handleShipment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity to Ship</label>
                    <input
                      type="number"
                      value={shipmentData.quantityShipped}
                      onChange={(e) => setShipmentData({ ...shipmentData, quantityShipped: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={shipmentData.dateOfShipping}
                      onChange={(e) => setShipmentData({ ...shipmentData, dateOfShipping: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
                    <textarea
                      value={shipmentData.remarks}
                      onChange={(e) => setShipmentData({ ...shipmentData, remarks: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary resize-vertical"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn btn-primary flex-1">
                      Create Shipment
                    </button>
                    <button type="button" onClick={closeShipmentModal} className="btn btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {isHistoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full max-h-[70vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Shipment History</h3>
                <p className="text-sm text-muted-foreground mb-6">History view coming soon...</p>
                <div className="flex justify-end">
                  <button onClick={() => setIsHistoryModalOpen(false)} className="btn btn-secondary">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
