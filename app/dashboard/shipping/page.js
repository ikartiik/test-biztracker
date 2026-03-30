'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
<<<<<<< HEAD
import { PlusIcon, EyeIcon, TrashIcon, XMarkIcon, ArrowPathIcon, TruckIcon } from '@heroicons/react/24/outline';
=======
import { PlusIcon, EyeIcon, TrashIcon, XMarkIcon, ArrowPathIcon, TruckIcon, FunnelIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportShipping } from '@/lib/exportExcel';
>>>>>>> blackboxai/login-mongodb-fix

export default function ShippingTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shippingEntries, setShippingEntries] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
=======
  const [filteredShippingEntries, setFilteredShippingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isBulkShipmentModalOpen, setIsBulkShipmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    vendor: 'all',
    searchText: '',
    startDate: '',
    endDate: ''
  });

>>>>>>> blackboxai/login-mongodb-fix
  const [shipmentData, setShipmentData] = useState({
    quantityShipped: '',
    dateOfShipping: new Date().toISOString().split('T')[0],
    remarks: ''
  });

<<<<<<< HEAD
=======
  const [bulkShipmentData, setBulkShipmentData] = useState({
    dateOfShipping: new Date().toISOString().split('T')[0],
    remarks: '',
    itemShipments: []
  });

>>>>>>> blackboxai/login-mongodb-fix
  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchShippingEntries();
  }, [session, router]);

<<<<<<< HEAD
=======
  // Apply filters whenever shippingEntries or filters change
  useEffect(() => {
    applyFilters();
  }, [shippingEntries, filters]);

  const applyFilters = () => {
    let filtered = [...shippingEntries];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    // Vendor filter
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(s => s.vendorName === filters.vendor);
    }

    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        s.itemDescription?.toLowerCase().includes(searchLower) ||
        s.vendorName?.toLowerCase().includes(searchLower) ||
        s.sourceSerialNumber?.toLowerCase().includes(searchLower) ||
        s.serialNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(s => new Date(s.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(s => new Date(s.createdAt) <= new Date(filters.endDate));
    }

    setFilteredShippingEntries(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      vendor: 'all',
      searchText: '',
      startDate: '',
      endDate: ''
    });
  };

  const getVendorOptions = () => {
    const vendors = [...new Set(shippingEntries.map(s => s.vendorName).filter(Boolean))];
    return vendors.sort();
  };

>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
        toast.success('Shipment added successfully');
        toast.success('Pending tracker updated');
=======
        toast.success('Shipment added successfully and pending tracker updated');
>>>>>>> blackboxai/login-mongodb-fix
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

<<<<<<< HEAD
=======
  const handleBulkShipment = async (e) => {
    e.preventDefault();
    try {
      const bulkShipments = bulkShipmentData.itemShipments.map(item => ({
        shippingId: item.shippingId,
        quantityShipped: parseInt(item.quantity),
        dateOfShipping: bulkShipmentData.dateOfShipping,
        remarks: bulkShipmentData.remarks
      }));

      // Process all shipments
      const responses = await Promise.all(
        bulkShipments.map(shipment =>
          fetch('/api/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shipment),
          })
        )
      );

      const failedShipments = responses.filter(r => !r.ok);

      if (failedShipments.length === 0) {
        toast.success(`Successfully shipped ${bulkShipments.length} items and updated pending tracker`);
        fetchShippingEntries();
        closeBulkShipmentModal();
      } else {
        toast.error(`Failed to ship ${failedShipments.length} out of ${bulkShipments.length} items`);
      }
    } catch (error) {
      toast.error('Error processing bulk shipment');
    }
  };

>>>>>>> blackboxai/login-mongodb-fix
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

<<<<<<< HEAD
=======
  const openBulkShipmentModal = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to ship');
      return;
    }

    // Initialize bulk shipment data with selected items
    const itemShipments = selectedItems.map(id => {
      const item = shippingEntries.find(s => s._id === id);
      return {
        shippingId: id,
        itemDescription: item.itemDescription,
        quantityRemaining: item.quantityRemaining,
        quantity: item.quantityRemaining
      };
    });

    setBulkShipmentData({
      dateOfShipping: new Date().toISOString().split('T')[0],
      remarks: '',
      itemShipments
    });
    setIsBulkShipmentModalOpen(true);
  };

  const closeBulkShipmentModal = () => {
    setIsBulkShipmentModalOpen(false);
    setBulkShipmentData({
      dateOfShipping: new Date().toISOString().split('T')[0],
      remarks: '',
      itemShipments: []
    });
    setSelectedItems([]);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredShippingEntries.filter(e => e.quantityRemaining > 0).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredShippingEntries.filter(e => e.quantityRemaining > 0).map(e => e._id));
    }
  };

  const updateBulkItemQuantity = (shippingId, quantity) => {
    setBulkShipmentData(prev => ({
      ...prev,
      itemShipments: prev.itemShipments.map(item =>
        item.shippingId === shippingId ? { ...item, quantity: parseInt(quantity) || 0 } : item
      )
    }));
  };

>>>>>>> blackboxai/login-mongodb-fix
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

<<<<<<< HEAD
  const getSourceColor = (source) => {
    switch (source) {
      case 'Import': return 'bg-blue-100 text-blue-800';
      case 'Local Purchase': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

=======
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
=======
              onClick={() => setFilterVisible(!filterVisible)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={openBulkShipmentModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <TruckIcon className="w-5 h-5 mr-2" />
                Bulk Ship ({selectedItems.length})
              </button>
            )}
            <button
              onClick={() => exportShipping(filteredShippingEntries)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </button>
            <button
>>>>>>> blackboxai/login-mongodb-fix
              onClick={syncWithImportsPurchases}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* Filter Panel */}
        {filterVisible && (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchText}
                    onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                    placeholder="Search item, vendor, serial..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Not Shipped">Not Shipped</option>
                  <option value="Partially Shipped">Partially Shipped</option>
                  <option value="Shipped">Shipped</option>
                </select>
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Vendors</option>
                  {getVendorOptions().map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

>>>>>>> blackboxai/login-mongodb-fix
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
<<<<<<< HEAD
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
=======
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length > 0 && selectedItems.length === filteredShippingEntries.filter(e => e.quantityRemaining > 0).length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
>>>>>>> blackboxai/login-mongodb-fix
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Shipped</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Remaining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
<<<<<<< HEAD
                  {shippingEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
=======
                  {filteredShippingEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.quantityRemaining > 0 && (
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(entry._id)}
                            onChange={() => handleSelectItem(entry._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        )}
                      </td>
>>>>>>> blackboxai/login-mongodb-fix
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.srNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{entry.itemDescription}</div>
<<<<<<< HEAD
                        <div className="text-xs text-gray-500">{entry.sourceSerialNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(entry.source)}`}>
                          {entry.source}
                        </span>
=======
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
                        <div className="text-xs text-gray-500">{entry.category}</div>
=======
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
              {shippingEntries.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No shipping entries found. Click "Sync Data" to import from Purchase and Import trackers.
=======
              {filteredShippingEntries.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  {shippingEntries.length === 0
                    ? 'No shipping entries found. Click "Sync Data" to import from Purchase and Import trackers.'
                    : 'No shipping entries match the current filters.'}
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <div className="font-medium">{selectedShipping.source}</div>
                    </div>
=======
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
=======

      {/* Bulk Shipment Modal */}
      {isBulkShipmentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeBulkShipmentModal} />
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Bulk Shipment</h3>
                <button onClick={closeBulkShipmentModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBulkShipment} className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    You are shipping {bulkShipmentData.itemShipments.length} items. Adjust quantities as needed for each item.
                  </p>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Shipping</label>
                    <input
                      type="date"
                      required
                      value={bulkShipmentData.dateOfShipping}
                      onChange={(e) => setBulkShipmentData({ ...bulkShipmentData, dateOfShipping: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                    <input
                      type="text"
                      value={bulkShipmentData.remarks}
                      onChange={(e) => setBulkShipmentData({ ...bulkShipmentData, remarks: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Common remarks for all items..."
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty to Ship</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bulkShipmentData.itemShipments.map((item, index) => (
                        <tr key={item.shippingId} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.itemDescription}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-red-600">
                            {item.quantityRemaining}
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              required
                              min="1"
                              max={item.quantityRemaining}
                              value={item.quantity}
                              onChange={(e) => updateBulkItemQuantity(item.shippingId, e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeBulkShipmentModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Ship All Items
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
>>>>>>> blackboxai/login-mongodb-fix
    </DashboardLayout>
  );
}