'use client';

import { useState, useEffect, useCallback } from 'react';
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
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ShoppingCartIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { exportPurchases } from '@/lib/exportExcel';

export default function PurchaseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('to-purchase'); // 'to-purchase' or 'purchased'
  const [filters, setFilters] = useState({
    search: '',
    vendor: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    itemDescription: '',
    vendorName: '',
    quantity: 1,
    totalInAED: '',
    category: 'Other',
    paymentAccount: 'cash',
    bankName: '',
    imeiSerialNumbers: [''],
    status: 'Quotation',
    orderBy: ''
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [session, router]);

  useEffect(() => {
    applyFilters();
  }, [purchases, filters, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPurchases(),
        fetchVendors()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    const response = await fetch('/api/purchase');
    const data = await response.json();
    setPurchases(data);
  };

  const fetchVendors = async () => {
    const response = await fetch('/api/vendors');
    const data = await response.json();
    setVendors(data);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...purchases];
    
    // Status filter
    if (activeTab === 'to-purchase') {
      filtered = filtered.filter(p => p.status === 'Quotation');
    } else if (activeTab === 'purchased') {
      filtered = filtered.filter(p => p.status === 'Purchased');
    }
    
    // Other filters
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.itemDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredPurchases(filtered);
  }, [purchases, filters, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      const url = editingItem ? `/api/purchase?id=${editingItem._id}` : '/api/purchase';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        toast.success('Purchase saved successfully');
        fetchData();
        closeModal();
      } else {
        toast.error('Failed to save purchase');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase? This will also delete all related entries from Pending, Shipping, and Expense trackers.')) {
      try {
        const response = await fetch(`/api/purchase?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Purchase deleted successfully');
          fetchData();
        }
      } catch (error) {
        toast.error('Error deleting purchase');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      itemDescription: '',
      vendorName: '',
      quantity: 1,
      totalInAED: '',
      category: 'Other',
      paymentAccount: 'cash',
      bankName: '',
      imeiSerialNumbers: [''],
      status: 'Quotation',
      orderBy: ''
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemDescription: item.itemDescription || '',
      vendorName: item.vendorName || '',
      quantity: item.quantity || 1,
      totalInAED: item.totalInAED || '',
      category: item.category || 'Other',
      paymentAccount: item.paymentAccount || 'cash',
      bankName: item.bankName || '',
      imeiSerialNumbers: item.imeiSerialNumbers || [''],
      status: item.status || 'Quotation',
      orderBy: item.orderBy || ''
    });
    setIsModalOpen(true);
  };

  const addIMEI = () => {
    setFormData({
      ...formData,
      imeiSerialNumbers: [...formData.imeiSerialNumbers, '']
    });
  };

  const updateIMEI = (index, value) => {
    const newIMEIs = [...formData.imeiSerialNumbers];
    newIMEIs[index] = value;
    setFormData({ ...formData, imeiSerialNumbers: newIMEIs });
  };

  const removeIMEI = (index) => {
    if (formData.imeiSerialNumbers.length > 1) {
      const newIMEIs = formData.imeiSerialNumbers.filter((_, i) => i !== index);
      setFormData({ ...formData, imeiSerialNumbers: newIMEIs });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading purchases...</div>;
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Tracker</h1>
            <p className="text-muted-foreground mt-2">
              {activeTab === 'to-purchase' ? 'Quotation management' : 'Purchased items'} ({filteredPurchases.length})
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={() => exportPurchases(filteredPurchases)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              disabled={filteredPurchases.length === 0}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center gap-2 font-semibold shadow-lg transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              {activeTab === 'to-purchase' ? 'New Quotation' : 'New Purchase'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="glass-card p-1">
          <div className="flex bg-background rounded-xl">
            <button
              onClick={() => setActiveTab('to-purchase')}
              className={`flex-1 py-3 px-4 text-center font-semibold rounded-xl transition-all ${
                activeTab === 'to-purchase' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              To Purchase ({purchases.filter(p => p.status === 'Quotation').length})
            </button>
            <button
              onClick={() => setActiveTab('purchased')}
              className={`flex-1 py-3 px-4 text-center font-semibold rounded-xl transition-all ${
                activeTab === 'purchased' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Purchased ({purchases.filter(p => p.status === 'Purchased').length})
            </button>
          </div>
        </div>

        {/* Filters */}
        {filterVisible && (
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search items or vendors..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Quotation">Quotation</option>
                <option value="Purchased">Purchased</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="flex-1 px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="flex-1 px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total AED
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{purchase.itemDescription}</div>
                      <div className="text-xs text-muted-foreground">
                        {purchase.imeiSerialNumbers?.filter(Boolean).join(', ') || 'No IMEI'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{purchase.vendorName}</div>
                      <div className="text-xs text-muted-foreground">{purchase.paymentAccount}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{purchase.category}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-mono text-xl font-bold text-primary">
                        AED {purchase.totalInAED?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                        purchase.status === 'Purchased' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(purchase)}
                          className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase._id)}
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
          
          {filteredPurchases.length === 0 && !loading && (
            <div className="text-center py-20">
              <ShoppingCartIcon className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {activeTab === 'to-purchase' ? 'No quotations' : 'No purchases'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {activeTab === 'to-purchase' 
                  ? 'Create your first quotation to get started.' 
                  : 'All purchases have been processed.'
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl hover:bg-primary/90 font-semibold shadow-lg"
              >
                Create {activeTab === 'to-purchase' ? 'Quotation' : 'Purchase'}
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingItem ? 'Edit' : 'New'} {activeTab === 'to-purchase' ? 'Quotation' : 'Purchase'}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-xl hover:bg-accent">
                    <XMarkIcon className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Item Description</label>
                    <input
                      type="text"
                      value={formData.itemDescription}
                      onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Vendor</label>
                    <input
                      type="text"
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Total AED</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalInAED}
                      onChange={(e) => setFormData({ ...formData, totalInAED: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    >
                      <option value="Other">Other</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Office Supplies">Office Supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Payment Account</label>
                    <select
                      value={formData.paymentAccount}
                      onChange={(e) => setFormData({ ...formData, paymentAccount: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    >
                      <option value="cash">Cash</option>
                      <option value="mashreq">Mashreq</option>
                      <option value="hsbc">HSBC</option>
                    </select>
                  </div>
                </div>

                {/* IMEI Numbers */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">IMEI/Serial Numbers (Optional)</label>
                  <div className="space-y-2">
                    {formData.imeiSerialNumbers.map((imei, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={imei}
                          onChange={(e) => updateIMEI(index, e.target.value)}
                          placeholder={`IMEI ${index + 1}`}
                          className="flex-1 px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeIMEI(index)}
                          className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addIMEI}
                    className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    + Add IMEI
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    >
                      <option value="Quotation">Quotation</option>
                      <option value="Purchased">Purchased</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Order By</label>
                    <input
                      type="text"
                      value={formData.orderBy}
                      onChange={(e) => setFormData({ ...formData, orderBy: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-border">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingItem ? 'Update' : 'Create'} {activeTab === 'to-purchase' ? 'Quotation' : 'Purchase'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
