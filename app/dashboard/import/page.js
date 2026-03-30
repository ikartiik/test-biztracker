'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, DocumentArrowUpIcon, UserPlusIcon, CloudArrowUpIcon, FunnelIcon, MagnifyingGlassIcon, ClockIcon, CheckIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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
  const [isItemsViewModalOpen, setIsItemsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItems, setViewingItems] = useState(null);
  const [items, setItems] = useState([{ itemDescription: '', quantity: 1 }]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('enroute'); // 'enroute' or 'received'

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    vendor: 'all',
    country: 'all',
    paymentMode: 'all',
    searchText: '',
    startDate: '',
    endDate: ''
  });
  
  const [formData, setFormData] = useState({
    vendor: '',
    country: '',
    invoiceNumber: '',
    trackingNumber: '',
    trackingLink: '',
    dateOfShipping: new Date().toISOString().split('T')[0],
    dateOfReceiving: '',
    amountDutyPaid: '',
    paymentMode: 'cash',
    bankName: '',
    status: 'Enroute',
    invoiceUpload: ''
  });

  const [vendorData, setVendorData] = useState({
    company: '',
    salespersonName: '',
    contact: '',
    email: '',
    address: '',
    products: []
  });

  const paymentAccounts = [
    { value: 'cash', label: 'Cash' },
    { value: 'mashreq', label: 'Mashreq Bank' },
    { value: 'hsbc', label: 'HSBC Bank' },
    { value: 'kar_fab', label: 'Kar FAB' },
    { value: 'kar_liv', label: 'Kar Liv' },
    { value: 'kar_mashreq', label: 'Kar Mashreq' },
    { value: 'crown', label: 'Crown' },
    { value: 'sasco', label: 'SASCO' },
    { value: 'other_fz', label: 'Other FZ' }
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
  }, [imports, filters, activeTab]);

  const applyFilters = () => {
    let filtered = [...imports];

    // Tab filter - filter by status based on active tab
    if (activeTab === 'enroute') {
      filtered = filtered.filter(imp => imp.status === 'Enroute');
    } else if (activeTab === 'received') {
      filtered = filtered.filter(imp => imp.status === 'Received');
    }

    // Status filter (only if not already filtered by tab)
    if (filters.status !== 'all') {
      filtered = filtered.filter(imp => imp.status === filters.status);
    }

    // Vendor filter
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(imp => imp.vendor?._id === filters.vendor || imp.vendorName === filters.vendor);
    }

    // Country filter
    if (filters.country !== 'all') {
      filtered = filtered.filter(imp => imp.country === filters.country);
    }

    // Payment mode filter
    if (filters.paymentMode !== 'all') {
      filtered = filtered.filter(imp => imp.paymentMode === filters.paymentMode);
    }

    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(imp =>
        imp.invoiceNumber?.toLowerCase().includes(searchLower) ||
        imp.trackingNumber?.toLowerCase().includes(searchLower) ||
        imp.vendorName?.toLowerCase().includes(searchLower) ||
        imp.country?.toLowerCase().includes(searchLower) ||
        imp.items?.some(item => item.itemDescription?.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter (shipping date)
    if (filters.startDate) {
      filtered = filtered.filter(imp => new Date(imp.dateOfShipping) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(imp => new Date(imp.dateOfShipping) <= new Date(filters.endDate));
    }

    setFilteredImports(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      vendor: 'all',
      country: 'all',
      paymentMode: 'all',
      searchText: '',
      startDate: '',
      endDate: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.vendor !== 'all') count++;
    if (filters.country !== 'all') count++;
    if (filters.paymentMode !== 'all') count++;
    if (filters.searchText) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset status filter when changing tabs
    setFilters({ ...filters, status: 'all' });
  };

  const getUniqueCountries = () => {
    const countries = imports.map(imp => imp.country).filter(Boolean);
    return [...new Set(countries)].sort();
  };

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchImports(),
        fetchVendors()
      ]);
    } catch (error) {
      toast.error('Error fetching data');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/import?id=${editingItem._id}` : '/api/import';
      const method = editingItem ? 'PUT' : 'POST';
      
      const selectedVendor = vendors.find(v => v._id === formData.vendor);
      const submitData = {
        ...formData,
        vendorName: selectedVendor?.company || '',
        amountDutyPaid: parseFloat(formData.amountDutyPaid) || 0,
        items: items.filter(item => item.itemDescription && item.quantity > 0)
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(editingItem ? 'Import updated successfully' : 'Import added successfully');
        if (submitData.amountDutyPaid > 0) {
          toast.success('Expense entry created for duty payment');
        }
        if (submitData.status === 'Received') {
          toast.success('Items added to pending tracker');
        }
        fetchData();
        closeModal();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error saving import');
      }
    } catch (error) {
      toast.error('Error saving import');
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
      });

      if (response.ok) {
        const newVendor = await response.json();
        setVendors([...vendors, newVendor]);
        setFormData({ ...formData, vendor: newVendor._id });
        toast.success('Vendor added successfully');
        closeVendorModal();
      } else {
        toast.error('Error adding vendor');
      }
    } catch (error) {
      toast.error('Error adding vendor');
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        // Check for required headers
        const itemDescIndex = headers.findIndex(h => h.includes('item_description') || h.includes('item description'));
        const quantityIndex = headers.findIndex(h => h.includes('quantity'));
        
        if (itemDescIndex === -1 || quantityIndex === -1) {
          toast.error('CSV must contain "item_description" and "quantity" columns');
          return;
        }

        const newItems = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const itemDescription = values[itemDescIndex]?.replace(/['"]/g, '');
            const quantity = parseInt(values[quantityIndex]);
            
            if (itemDescription && quantity > 0) {
              newItems.push({ itemDescription, quantity });
            }
          }
        }

        if (newItems.length > 0) {
          setItems(newItems);
          toast.success(`${newItems.length} items imported from CSV`);
        } else {
          toast.error('No valid items found in CSV');
        }
      } catch (error) {
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadCSVFormat = () => {
    const csvContent = 'item_description,quantity\nSample Item 1,5\nSample Item 2,3\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'import_items_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addItem = () => {
    setItems([...items, { itemDescription: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setItems(newItems);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      vendor: item.vendor._id || item.vendor,
      country: item.country || '',
      invoiceNumber: item.invoiceNumber || '',
      trackingNumber: item.trackingNumber || '',
      trackingLink: item.trackingLink || '',
      dateOfShipping: item.dateOfShipping?.split('T')[0] || '',
      dateOfReceiving: item.dateOfReceiving?.split('T')[0] || '',
      amountDutyPaid: item.amountDutyPaid?.toString() || '',
      paymentMode: item.paymentMode || 'cash',
      bankName: item.bankName || '',
      status: item.status || 'Enroute',
      invoiceUpload: item.invoiceUpload || ''
    });
    setItems(item.items || [{ itemDescription: '', quantity: 1 }]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this import? This will also delete all related entries from Pending, Shipping, and Expense trackers.')) {
      try {
        const response = await fetch(`/api/import?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          const result = await response.json();
          toast.success(
            `Import deleted successfully!\n` +
            `Removed: ${result.cascadeResults?.pending || 0} pending, ` +
            `${result.cascadeResults?.shipping || 0} shipping, ` +
            `${result.cascadeResults?.expense || 0} expense entries`,
            { duration: 5000 }
          );
          fetchData();
        } else {
          toast.error('Error deleting import');
        }
      } catch (error) {
        toast.error('Error deleting import');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      vendor: '',
      country: '',
      invoiceNumber: '',
      trackingNumber: '',
      trackingLink: '',
      dateOfShipping: new Date().toISOString().split('T')[0],
      dateOfReceiving: '',
      amountDutyPaid: '',
      paymentMode: 'cash',
      bankName: '',
      status: 'Enroute',
      invoiceUpload: ''
    });
    setItems([{ itemDescription: '', quantity: 1 }]);
  };

  const closeVendorModal = () => {
    setIsVendorModalOpen(false);
    setVendorData({
      company: '',
      salespersonName: '',
      contact: '',
      email: '',
      address: '',
      products: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Enroute': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalItems = (items) => {
    return items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  };

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Tracker</h1>
            <p className="mt-2 text-gray-600">
              {activeTab === 'enroute'
                ? 'Manage and track imports currently in transit'
                : 'View and manage received imports with automated expense tracking'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors relative ${
                filterVisible
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Import
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex space-x-1">
          <button
            onClick={() => handleTabChange('enroute')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'enroute'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              <span>Enroute</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                activeTab === 'enroute'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {imports.filter(imp => imp.status === 'Enroute').length}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('received')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>Received</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                activeTab === 'received'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {imports.filter(imp => imp.status === 'Received').length}
              </span>
            </div>
          </button>
        </div>

        {/* Filter Section */}
        {filterVisible && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Imports</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchText}
                    onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                    placeholder="Search imports..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'enroute' ? (
                    <option value="Enroute">Enroute</option>
                  ) : (
                    <option value="Received">Received</option>
                  )}
                </select>
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>{vendor.company}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {getUniqueCountries().map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                <select
                  value={filters.paymentMode}
                  onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Payment Modes</option>
                  {paymentAccounts.map((account) => (
                    <option key={account.value} value={account.value}>{account.label}</option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredImports.length}</span> of{' '}
                <span className="font-semibold text-gray-900">
                  {activeTab === 'enroute'
                    ? imports.filter(imp => imp.status === 'Enroute').length
                    : imports.filter(imp => imp.status === 'Received').length}
                </span> {activeTab === 'enroute' ? 'enroute imports' : 'received imports'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duty Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredImports.map((importItem) => (
                    <tr key={importItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {importItem.srNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{importItem.vendorName}</div>
                        {importItem.vendor?.salespersonName && (
                          <div className="text-xs text-gray-500">{importItem.vendor.salespersonName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importItem.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{importItem.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {importItem.trackingNumber && (
                          <div>
                            <div className="font-medium">{importItem.trackingNumber}</div>
                            {importItem.trackingLink && (
                              <a href={importItem.trackingLink} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-500 text-xs hover:underline">Track</a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(importItem.dateOfShipping).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>AED {importItem.amountDutyPaid || 0}</div>
                        {importItem.amountDutyPaid > 0 && (
                          <div className="text-xs text-gray-500">
                            {importItem.paymentMode === 'bank' ? `Bank: ${importItem.bankName}` : 'Cash'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(importItem.status)}`}>
                          {importItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setViewingItems(importItem);
                              setIsItemsViewModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="View Items"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(importItem)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(importItem._id)}
                            className="text-red-600 hover:text-red-900"
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
              {filteredImports.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {imports.length === 0
                    ? 'No imports found. Add your first import to get started.'
                    : activeTab === 'enroute'
                    ? 'No enroute imports match your filters. Try adjusting your search criteria.'
                    : 'No received imports match your filters. Try adjusting your search criteria.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? 'Edit Import' : 'Add Import'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <div className="flex space-x-2">
                      <select
                        required
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>
                            {vendor.company} - {vendor.salespersonName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsVendorModalOpen(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        title="Add New Vendor"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Items</label>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCSVUpload}
                        accept=".csv"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={downloadCSVFormat}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                        title="Download CSV Template"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                        CSV Format
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm flex items-center"
                      >
                        <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                        Import CSV
                      </button>
                      <button
                        type="button"
                        onClick={addItem}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={item.itemDescription}
                          onChange={(e) => updateItem(index, 'itemDescription', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      required
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Link</label>
                    <input
                      type="url"
                      value={formData.trackingLink}
                      onChange={(e) => setFormData({ ...formData, trackingLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Shipping</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfShipping}
                      onChange={(e) => setFormData({ ...formData, dateOfShipping: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Receiving</label>
                    <input
                      type="date"
                      value={formData.dateOfReceiving}
                      onChange={(e) => setFormData({ ...formData, dateOfReceiving: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount/Duty Paid</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountDutyPaid}
                      onChange={(e) => setFormData({ ...formData, amountDutyPaid: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                    <select
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {paymentAccounts.map((account) => (
                        <option key={account.value} value={account.value}>
                          {account.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.paymentMode === 'bank' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Enroute">Enroute</option>
                      <option value="Received">Received</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {editingItem ? 'Update' : 'Add'} Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeVendorModal} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Add New Vendor</h3>
                <button onClick={closeVendorModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleVendorSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={vendorData.company}
                      onChange={(e) => setVendorData({ ...vendorData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson Name</label>
                    <input
                      type="text"
                      required
                      value={vendorData.salespersonName}
                      onChange={(e) => setVendorData({ ...vendorData, salespersonName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={vendorData.contact}
                      onChange={(e) => setVendorData({ ...vendorData, contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={vendorData.email}
                      onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    required
                    value={vendorData.address}
                    onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeVendorModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Items View Modal */}
      {isItemsViewModalOpen && viewingItems && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsItemsViewModalOpen(false)} />
            <div className="relative bg-white rounded-lg max-w-3xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Import Items</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {viewingItems.vendorName} - Invoice: {viewingItems.invoiceNumber}
                  </p>
                </div>
                <button
                  onClick={() => setIsItemsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingItems.items && viewingItems.items.length > 0 ? (
                        viewingItems.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.itemDescription}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold text-gray-900">
                      {viewingItems.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} items
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t">
                <button
                  onClick={() => setIsItemsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}