'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  CloudArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { exportImports } from '@/lib/exportExcel';

export default function ImportTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedImportId, setExpandedImportId] = useState(null);
  const [items, setItems] = useState([{ itemDescription: '', quantity: 1 }]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    vendor: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    vendor: '',
    paymentMethod: 'cash',
    amountDutyPaid: '',
    status: 'Purchased'
  });

  const paymentOptions = [
    { value: 'mashreq', label: 'Mashreq Bank' },
    { value: 'hsbc', label: 'HSBC Bank' },
    { value: 'kar_fab', label: 'Kar FAB' },
    { value: 'kar_liv', label: 'Kar Liv' },
    { value: 'kar_mashreq', label: 'Kar Mashreq' },
    { value: 'crown', label: 'Crown' },
    { value: 'sasco', label: 'SASCO' },
    { value: 'other_fz', label: 'Other FZ' },
    { value: 'cash', label: 'Cash' }
  ];

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [session, router]);

  // Apply filters whenever imports, filters, or activeTab change
  useEffect(() => {
    applyFilters();
  }, [imports, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchImports(),
        fetchVendors()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchImports = async () => {
    const response = await fetch('/api/import');
    const data = await response.json();
    setImports(data);
  };

  const fetchVendors = async () => {
    const response = await fetch('/api/vendors');
    const data = await response.json();
    setVendors(data);
  };

  const downloadCSVFormat = () => {
    const csvContent = 'item_description,quantity\nSample Item 1,5\nSample Item 2,3\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...imports];
    
    if (filters.search) {
      filtered = filtered.filter(i => 
        i.vendor?.toLowerCase().includes(filters.search.toLowerCase()) ||
        i.items.some(item => 
          item.itemDescription.toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    }
    
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(i => i.vendor === filters.vendor);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filtered = filtered.filter(i => {
        const date = new Date(i.createdAt);
        return date >= start && date <= end;
      });
    }
    
    setFilteredImports(filtered);
  }, [imports, filters]);

  const addItem = () => {
    setItems([...items, { itemDescription: '', quantity: 1 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        items: items.filter(item => item.itemDescription.trim())
      };
      
      const url = editingItem ? `/api/import?id=${editingItem._id}` : '/api/import';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        // Auto-create expense for duty payment
        if (submitData.amountDutyPaid > 0) {
          await fetch('/api/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: 'CUSTOMS DUTY',
              type: 'expense',
              account: submitData.paymentMethod,
              amount: submitData.amountDutyPaid,
              remark: `Duty for Import ${submitData.vendor}`
            }),
          });
          toast.success('Expense entry created for duty payment');
        }
        
        if (submitData.status === 'Received') {
          toast.success('Items added to pending tracker');
        }
        
        fetchData();
        closeModal();
      } else {
        toast.error('Failed to save import');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this import? This will also delete all related entries from Pending, Shipping, and Expense trackers.')) {
      try {
        const response = await fetch(`/api/import?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Import deleted successfully');
          fetchData();
        }
      } catch (error) {
        toast.error('Error deleting import');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setItems([{ itemDescription: '', quantity: 1 }]);
    setFormData({ vendor: '', paymentMethod: 'cash', amountDutyPaid: '', status: 'Purchased' });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItems(item.items || [{ itemDescription: '', quantity: 1 }]);
    setFormData({
      vendor: item.vendor || '',
      paymentMethod: item.paymentMethod || 'cash',
      amountDutyPaid: item.amountDutyPaid || '',
      status: item.status || 'Purchased'
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Tracker</h1>
            <p className="mt-2 text-gray-600">Manage and track all imports with automated expense and pending tracking</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadCSVFormat}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download Template
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center gap-2 font-semibold shadow-lg transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              New Import
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterVisible && (
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Vendor or item name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor.company}>
                      {vendor.company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Received">Received</option>
                  <option value="Enroute">Enroute</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="glass-card overflow-hidden">
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">Imports ({filteredImports.length})</h2>
                <button
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="p-2 rounded-xl hover:bg-accent transition-colors"
                >
                  <FunnelIcon className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <button
                onClick={() => exportImports(filteredImports)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                disabled={filteredImports.length === 0}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Duty Paid
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Items
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredImports.map((importItem) => (
                  <tr key={importItem._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{importItem.vendor}</div>
                      <div className="text-sm text-muted-foreground">{importItem.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        importItem.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                        importItem.status === 'Enroute' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {importItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                      AED {importItem.amountDutyPaid?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(importItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setExpandedImportId(expandedImportId === importItem._id ? null : importItem._id)}
                        className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
                      >
                        {importItem.items?.length || 0} items
                        {expandedImportId === importItem._id ? 
                          <ChevronUpIcon className="w-4 h-4" /> : 
                          <ChevronDownIcon className="w-4 h-4" />
                        }
                      </button>
                      {expandedImportId === importItem._id && (
                        <div className="mt-2 space-y-1 bg-muted/50 p-2 rounded-lg">
                          {importItem.items.map((item, index) => (
                            <div key={index} className="text-xs text-muted-foreground truncate">
                              • {item.itemDescription} ({item.quantity})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(importItem)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-xl transition-all"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(importItem._id)}
                          className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
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
          
          {filteredImports.length === 0 && !loading && (
            <div className="text-center py-12">
              <DocumentArrowUpIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No imports found</h3>
              <p className="text-muted-foreground mb-6">Add your first import to get started.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 font-semibold shadow-lg transition-all"
              >
                Create First Import
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Import Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-4xl w-full max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingItem ? 'Edit Import' : 'New Import'}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-xl hover:bg-accent">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Vendor</label>
                    <input
                      type="text"
                      placeholder="Enter vendor name"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    >
                      {paymentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Duty Amount (AED)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.amountDutyPaid}
                      onChange={(e) => setFormData({ ...formData, amountDutyPaid: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    >
                      <option value="Purchased">Purchased</option>
                      <option value="Enroute">Enroute</option>
                      <option value="Received">Received</option>
                    </select>
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-foreground">Items</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-end bg-muted/30 p-4 rounded-xl">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Item Description
                          </label>
                          <input
                            type="text"
                            placeholder="Enter item description"
                            value={item.itemDescription}
                            onChange={(e) => updateItem(index, 'itemDescription', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg -mt-2"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-border">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingItem ? 'Update Import' : 'Create Import'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vendor Modal - Simplified */}
        {isVendorModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Manage Vendors</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Add vendors via the Vendors page for full management.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push('/dashboard/vendors')}
                    className="flex-1 btn btn-primary"
                  >
                    Go to Vendors
                  </button>
                  <button 
                    onClick={() => setIsVendorModalOpen(false)}
                    className="flex-1 btn btn-secondary"
                  >
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
