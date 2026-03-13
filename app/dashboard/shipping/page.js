'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { PlusIcon, EyeIcon, TrashIcon, XMarkIcon, ArrowPathIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function ShippingTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shippingEntries, setShippingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  const [shipmentData, setShipmentData] = useState({
    quantityShipped: '',
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

  const fetchShippingEntries = async () => {
    try {
      const response = await fetch('/api/shipping');
      const data = await response.json();
      setShippingEntries(data);
    } catch (error) {
      toast.error('Error fetching shipping entries');
    } finally {
      setLoading(false);
    }
  };

  const syncWithPending = async () => {
    try {
      const response = await fetch('/api/shipping?syncPending=true');
      if (response.ok) {
        toast.success('Synced shipping status with pending tracker');
      } else {
        toast.error('Error syncing with pending tracker');
      }
    } catch (error) {
      toast.error('Error syncing with pending tracker');
    }
  };

  const syncWithImportsPurchases = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/shipping?sync=true');
      const data = await response.json();
      setShippingEntries(data);
      toast.success('Synced successfully with Import and Purchase trackers');
    } catch (error) {
      toast.error('Error syncing data');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingId: selectedShipping._id,
          quantityShipped: parseInt(shipmentData.quantityShipped),
          dateOfShipping: shipmentData.dateOfShipping,
          remarks: shipmentData.remarks
        }),
      });

      if (response.ok) {
        toast.success('Shipment added successfully');
        toast.success('Pending tracker updated');
        fetchShippingEntries();
        closeShipmentModal();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error adding shipment');
      }
    } catch (error) {
      toast.error('Error adding shipment');
    }
  };

  const handleDeleteShipment = async (shippingId, shipmentIndex) => {
    if (window.confirm('Are you sure you want to delete this shipment entry?')) {
      try {
        const response = await fetch(`/api/shipping?id=${shippingId}&shipmentIndex=${shipmentIndex}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast.success('Shipment entry deleted successfully');
          fetchShippingEntries();
          if (isHistoryModalOpen) {
            setIsHistoryModalOpen(false);
          }
        } else {
          toast.error('Error deleting shipment entry');
        }
      } catch (error) {
        toast.error('Error deleting shipment entry');
      }
    }
  };

  const openShipmentModal = (shipping) => {
    setSelectedShipping(shipping);
    setShipmentData({
      quantityShipped: shipping.quantityRemaining.toString(),
      dateOfShipping: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setIsShipmentModalOpen(true);
  };

  const openHistoryModal = (shipping) => {
    setSelectedShipping(shipping);
    setIsHistoryModalOpen(true);
  };

  const closeShipmentModal = () => {
    setIsShipmentModalOpen(false);
    setSelectedShipping(null);
    setShipmentData({
      quantityShipped: '',
      dateOfShipping: new Date().toISOString().split('T')[0],
      remarks: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shipped': return 'bg-green-100 text-green-800';
      case 'Partially Shipped': return 'bg-yellow-100 text-yellow-800';
      case 'Not Shipped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'Import': return 'bg-blue-100 text-blue-800';
      case 'Local Purchase': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping Tracker</h1>
            <p className="mt-2 text-gray-600">Track shipments with partial shipping support and pending tracker integration</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={syncWithImportsPurchases}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Shipped</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Remaining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shippingEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.srNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{entry.itemDescription}</div>
                        <div className="text-xs text-gray-500">{entry.sourceSerialNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(entry.source)}`}>
                          {entry.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.totalQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {entry.quantityShipped}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {entry.quantityRemaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{entry.vendorName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{entry.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {entry.quantityRemaining > 0 && (
                            <button
                              onClick={() => openShipmentModal(entry)}
                              className="text-green-600 hover:text-green-900"
                              title="Add Shipment"
                            >
                              <TruckIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openHistoryModal(entry)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Shipment History"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shippingEntries.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No shipping entries found. Click "Sync Data" to import from Purchase and Import trackers.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Shipment Modal */}
      {isShipmentModalOpen && selectedShipping && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeShipmentModal} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Add Shipment</h3>
                <button onClick={closeShipmentModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddShipment} className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Item:</span>
                    <span className="text-sm text-gray-900">{selectedShipping.itemDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Quantity:</span>
                    <span className="text-sm text-gray-900">{selectedShipping.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Already Shipped:</span>
                    <span className="text-sm text-green-600">{selectedShipping.quantityShipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Remaining:</span>
                    <span className="text-sm text-red-600">{selectedShipping.quantityRemaining}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Ship</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedShipping.quantityRemaining}
                      value={shipmentData.quantityShipped}
                      onChange={(e) => setShipmentData({ ...shipmentData, quantityShipped: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Shipping</label>
                    <input
                      type="date"
                      required
                      value={shipmentData.dateOfShipping}
                      onChange={(e) => setShipmentData({ ...shipmentData, dateOfShipping: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                  <textarea
                    value={shipmentData.remarks}
                    onChange={(e) => setShipmentData({ ...shipmentData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add any remarks about this shipment..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeShipmentModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Shipment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Shipment History Modal */}
      {isHistoryModalOpen && selectedShipping && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsHistoryModalOpen(false)} />
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Shipment History</h3>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedShipping.itemDescription}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <div className="font-medium">{selectedShipping.source}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Qty:</span>
                      <div className="font-medium">{selectedShipping.totalQuantity}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Shipped:</span>
                      <div className="font-medium text-green-600">{selectedShipping.quantityShipped}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining:</span>
                      <div className="font-medium text-red-600">{selectedShipping.quantityRemaining}</div>
                    </div>
                  </div>
                </div>

                {selectedShipping.shipmentEntries && selectedShipping.shipmentEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Shipped</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedShipping.shipmentEntries.map((shipment, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(shipment.dateOfShipping).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {shipment.quantityShipped}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {shipment.remarks || 'No remarks'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteShipment(selectedShipping._id, index)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Shipment Entry"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No shipments recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}