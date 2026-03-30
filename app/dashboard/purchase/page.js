'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
<<<<<<< HEAD
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpDownIcon,
  UserPlusIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
=======
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, DocumentArrowUpIcon, UserPlusIcon, FunnelIcon, MagnifyingGlassIcon, ClockIcon, ShoppingCartIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportPurchases } from '@/lib/exportExcel';
>>>>>>> blackboxai/login-mongodb-fix

export default function PurchaseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
<<<<<<< HEAD
=======
  const [filteredPurchases, setFilteredPurchases] = useState([]);
>>>>>>> blackboxai/login-mongodb-fix
  const [vendors, setVendors] = useState([]);
  const [itemDescriptions, setItemDescriptions] = useState([]);
  const [orderByOptions, setOrderByOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imeiNumbers, setImeiNumbers] = useState(['']);
<<<<<<< HEAD
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
=======
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('to-purchase'); // 'to-purchase' or 'purchased'

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    vendor: 'all',
    orderBy: 'all',
    searchText: '',
    startDate: '',
    endDate: ''
  });
>>>>>>> blackboxai/login-mongodb-fix
  
  const [formData, setFormData] = useState({
    itemDescription: '',
    vendor: '',
    onlineLink: '',
    dateOfPurchase: new Date().toISOString().split('T')[0],
    quantity: '1',
    price: '',
    currency: 'AED',
    mediumOfPurchase: 'Local',
    status: 'To Purchase',
    orderBy: 'Khushal',
    category: 'Other',
    imeiSerialNumbers: [''],
<<<<<<< HEAD
    paymentAccount: 'cash'
=======
    paymentAccount: 'cash',
    bankName: ''
>>>>>>> blackboxai/login-mongodb-fix
  });

  const [vendorData, setVendorData] = useState({
    company: '',
    salespersonName: '',
    contact: '',
    email: '',
    address: '',
    products: []
  });

  const currencies = ['AED', 'USD', 'INR', 'HKD', 'GBP', 'EUR'];
  const statusOptions = ['To Purchase', 'Purchased', 'Not Available'];
  const categories = [
    'Networking', 'Mobility/Tablets', 'Wearables', 'Computer/Laptops',
    'Gaming and VR', 'Storage', 'Home/Smart Devices', 'Computer Acc.',
    'Audio', 'Mobile Accessories', 'Computer Components', 
    'Desktops and Monitors', 'Other'
  ];
  const accountOptions = [
<<<<<<< HEAD
    { value: 'mashreq', label: 'Mashreq Bank' },
    { value: 'hsbc', label: 'HSBC Bank' },
    { value: 'crown', label: 'Crown FZ' },
    { value: 'sasco', label: 'SASCO FZ' },
    { value: 'other_fz', label: 'Other FZ' },
    { value: 'cash', label: 'Cash' }
=======
    { value: 'cash', label: 'Cash' },
    { value: 'mashreq', label: 'Mashreq Bank' },
    { value: 'hsbc', label: 'HSBC Bank' },
    { value: 'kar_fab', label: 'Kar FAB' },
    { value: 'kar_liv', label: 'Kar Liv' },
    { value: 'kar_mashreq', label: 'Kar Mashreq' },
    { value: 'crown', label: 'Crown FZ' },
    { value: 'sasco', label: 'SASCO FZ' },
    { value: 'other_fz', label: 'Other FZ' }
>>>>>>> blackboxai/login-mongodb-fix
  ];

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [session, router]);

<<<<<<< HEAD
=======
  // Apply filters whenever purchases, filters, or activeTab change
  useEffect(() => {
    applyFilters();
  }, [purchases, filters, activeTab]);

  const applyFilters = () => {
    let filtered = [...purchases];

    // Tab filter - filter by status based on active tab
    if (activeTab === 'to-purchase') {
      filtered = filtered.filter(p => p.status === 'To Purchase' || p.status === 'Not Available');
    } else if (activeTab === 'purchased') {
      filtered = filtered.filter(p => p.status === 'Purchased');
    }

    // Status filter (only if not already filtered by tab)
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Vendor filter
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(p => p.vendor?._id === filters.vendor || p.vendorName === filters.vendor);
    }

    // OrderBy filter
    if (filters.orderBy !== 'all') {
      filtered = filtered.filter(p => p.orderBy === filters.orderBy);
    }

    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p.itemDescription?.toLowerCase().includes(searchLower) ||
        p.vendorName?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(p => new Date(p.dateOfPurchase) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => new Date(p.dateOfPurchase) <= new Date(filters.endDate));
    }

    setFilteredPurchases(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      vendor: 'all',
      orderBy: 'all',
      searchText: '',
      startDate: '',
      endDate: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.vendor !== 'all') count++;
    if (filters.orderBy !== 'all') count++;
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

>>>>>>> blackboxai/login-mongodb-fix
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchPurchases(),
        fetchVendors(),
        fetchItemDescriptions(),
        fetchOrderByOptions()
      ]);
    } catch (error) {
      toast.error('Error fetching data');
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

  const fetchItemDescriptions = async () => {
    const response = await fetch('/api/purchase?descriptions=true');
    const data = await response.json();
    setItemDescriptions(data);
  };

  const fetchOrderByOptions = async () => {
    const response = await fetch('/api/orderby');
    const data = await response.json();
    setOrderByOptions(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/purchase?id=${editingItem._id}` : '/api/purchase';
      const method = editingItem ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        imeiSerialNumbers: formData.quantity > 5 ? imeiNumbers : formData.imeiSerialNumbers
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
<<<<<<< HEAD
        toast.success(editingItem ? 'Purchase updated successfully' : 'Purchase added successfully');
        if (submitData.status === 'Purchased') {
          toast.success('Expense entry created and added to pending tracker');
=======
        if (editingItem) {
          toast.success('Purchase updated successfully');
        } else {
          if (submitData.status === 'Purchased') {
            toast.success('Purchase added successfully. Expense entry created and added to pending tracker');
          } else {
            toast.success('Purchase added successfully and added to pending tracker');
          }
>>>>>>> blackboxai/login-mongodb-fix
        }
        fetchData();
        closeModal();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error saving purchase');
      }
    } catch (error) {
      toast.error('Error saving purchase');
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

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemDescription: item.itemDescription,
      vendor: item.vendor?._id || item.vendor || '',
      onlineLink: item.onlineLink || '',
      dateOfPurchase: item.dateOfPurchase?.split('T')[0] || '',
      quantity: item.quantity.toString(),
      price: item.price?.toString() || '',
      currency: item.currency || 'AED',
      mediumOfPurchase: item.mediumOfPurchase,
      status: item.status,
      orderBy: item.orderBy || 'Khushal',
      category: item.category || 'Other',
      imeiSerialNumbers: item.imeiSerialNumbers || [''],
      paymentAccount: item.paymentAccount || 'cash'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
<<<<<<< HEAD
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const response = await fetch(`/api/purchase?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Purchase deleted successfully');
=======
    if (window.confirm('Are you sure you want to delete this purchase? This will also delete all related entries from Pending, Shipping, and Expense trackers.')) {
      try {
        const response = await fetch(`/api/purchase?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          const result = await response.json();
          toast.success(
            `Purchase deleted successfully!\n` +
            `Removed: ${result.cascadeResults?.pending || 0} pending, ` +
            `${result.cascadeResults?.shipping || 0} shipping, ` +
            `${result.cascadeResults?.expense || 0} expense entries`,
            { duration: 5000 }
          );
>>>>>>> blackboxai/login-mongodb-fix
          fetchPurchases();
        } else {
          toast.error('Error deleting purchase');
        }
      } catch (error) {
        toast.error('Error deleting purchase');
      }
    }
  };

  const handleQuantityChange = (quantity) => {
    const qty = parseInt(quantity);
    setFormData({ ...formData, quantity: quantity });
    
    if (qty > 5) {
      setImeiNumbers(new Array(qty).fill(''));
      setIsImeiModalOpen(true);
    } else if (qty >= 1) {
<<<<<<< HEAD
=======
      // Generate IMEI fields for quantities 1-5
>>>>>>> blackboxai/login-mongodb-fix
      const newImeiFields = new Array(qty).fill('');
      setFormData({ ...formData, quantity: quantity, imeiSerialNumbers: newImeiFields });
      setIsImeiModalOpen(false);
    } else {
      setFormData({ ...formData, quantity: quantity, imeiSerialNumbers: [''] });
      setIsImeiModalOpen(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      itemDescription: '',
      vendor: '',
      onlineLink: '',
      dateOfPurchase: new Date().toISOString().split('T')[0],
      quantity: '1',
      price: '',
      currency: 'AED',
      mediumOfPurchase: 'Local',
      status: 'To Purchase',
      orderBy: 'Khushal',
      category: 'Other',
      imeiSerialNumbers: [''],
      paymentAccount: 'cash'
    });
    setImeiNumbers(['']);
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
<<<<<<< HEAD
      case 'To Purchase': return 'badge-warning';
      case 'Purchased': return 'badge-success';
      case 'Not Available': return 'badge-danger';
      default: return 'badge-neutral';
=======
      case 'To Purchase': return 'bg-yellow-100 text-yellow-800';
      case 'Purchased': return 'bg-green-100 text-green-800';
      case 'Not Available': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
>>>>>>> blackboxai/login-mongodb-fix
    }
  };

  const formatPrice = (amount, currency) => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  const handleAddOrderBy = async () => {
    const newPerson = prompt('Enter new person name:');
    if (newPerson && newPerson.trim()) {
      try {
        const response = await fetch('/api/orderby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newPerson.trim() }),
        });

        if (response.ok) {
          const newOrderBy = await response.json();
          setOrderByOptions([...orderByOptions, newOrderBy]);
          setFormData({ ...formData, orderBy: newOrderBy.name });
          toast.success('Person added successfully');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Error adding person');
        }
      } catch (error) {
        toast.error('Error adding person');
      }
    }
  };

<<<<<<< HEAD
  // Filter purchases
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchQuery === '' || 
      purchase.itemDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || purchase.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const totalPurchases = purchases.length;
  const purchasedCount = purchases.filter(p => p.status === 'Purchased').length;
  const totalValue = purchases.reduce((sum, p) => sum + (p.totalInAED || 0), 0);

=======
>>>>>>> blackboxai/login-mongodb-fix
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
<<<<<<< HEAD
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
              Purchase Tracker
            </h1>
            <p className="mt-1 text-slate-600">Manage and track all purchases with vendors and expenses</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Purchase
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Purchases</p>
                <p className="text-2xl font-bold text-slate-900">{totalPurchases}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{purchasedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl">✓</span>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Value (AED)</p>
                <p className="text-2xl font-bold text-slate-900">{totalValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 text-xl">AED</span>
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
                placeholder="Search by item, vendor, or serial number..."
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
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-full sm:w-40"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
          ) : filteredPurchases.length === 0 ? (
            <div className="empty-state">
              <ShoppingCartIcon className="w-16 h-16 mx-auto text-slate-300" />
              <p className="text-lg font-medium text-slate-500 mt-4">No purchases found</p>
              <p className="text-sm text-slate-400">Add your first purchase to get started</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Item Description</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total (AED)</th>
                  <th>Status</th>
                  <th>Order By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-900">
                      {purchase.srNo || 'Auto'}
                    </td>
                    <td className="max-w-xs">
                      <div className="truncate font-medium text-slate-900">{purchase.itemDescription}</div>
                      {purchase.onlineLink && (
                        <a 
                          href={purchase.onlineLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 text-xs hover:underline"
                        >
                          View Link →
                        </a>
                      )}
                    </td>
                    <td>
                      <div className="text-slate-900">{purchase.vendorName || '-'}</div>
                      {purchase.vendor?.salespersonName && (
                        <div className="text-xs text-slate-500">{purchase.vendor.salespersonName}</div>
                      )}
                    </td>
                    <td className="text-slate-600">{purchase.category}</td>
                    <td className="text-slate-600">
                      {new Date(purchase.dateOfPurchase).toLocaleDateString()}
                    </td>
                    <td className="text-slate-900 font-medium">{purchase.quantity}</td>
                    <td className="text-slate-900">
                      {formatPrice(purchase.price, purchase.currency)}
                    </td>
                    <td className="font-semibold text-slate-900">
                      AED {purchase.totalInAED?.toLocaleString() || 0}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(purchase.status)}`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="text-slate-600">{purchase.orderBy}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          )}
        </div>

        {/* Results count */}
        {!loading && filteredPurchases.length > 0 && (
          <p className="text-sm text-slate-500 text-right">
            Showing {filteredPurchases.length} of {purchases.length} purchases
          </p>
        )}
=======
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Tracker</h1>
            <p className="mt-2 text-gray-600">
              {activeTab === 'to-purchase'
                ? 'View and manage items that need to be purchased'
                : 'View and track all purchased items and expenses'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors relative ${
                filterVisible
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
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
              onClick={() => exportPurchases(filteredPurchases)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Purchase
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex space-x-1">
          <button
            onClick={() => handleTabChange('to-purchase')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'to-purchase'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              <span>To Purchase</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                activeTab === 'to-purchase'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {purchases.filter(p => p.status === 'To Purchase' || p.status === 'Not Available').length}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange('purchased')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === 'purchased'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              <span>Purchased</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                activeTab === 'purchased'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {purchases.filter(p => p.status === 'Purchased').length}
              </span>
            </div>
          </button>
        </div>

        {/* Filter Section */}
        {filterVisible && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Purchases</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                    placeholder="Search items..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'to-purchase' ? (
                    <>
                      <option value="To Purchase">To Purchase</option>
                      <option value="Not Available">Not Available</option>
                    </>
                  ) : (
                    <option value="Purchased">Purchased</option>
                  )}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Vendor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>{vendor.company}</option>
                  ))}
                </select>
              </div>

              {/* OrderBy Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordered By</label>
                <select
                  value={filters.orderBy}
                  onChange={(e) => setFilters({ ...filters, orderBy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All People</option>
                  {orderByOptions.map((person) => (
                    <option key={person._id || person.name} value={person.name || person}>
                      {person.name || person}
                    </option>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredPurchases.length}</span> of{' '}
                <span className="font-semibold text-gray-900">
                  {activeTab === 'to-purchase'
                    ? purchases.filter(p => p.status === 'To Purchase' || p.status === 'Not Available').length
                    : purchases.filter(p => p.status === 'Purchased').length}
                </span> {activeTab === 'to-purchase' ? 'to purchase items' : 'purchased items'}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (AED)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.srNo || 'Auto'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{purchase.itemDescription}</div>
                        {purchase.onlineLink && (
                          <a href={purchase.onlineLink} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-500 text-xs hover:underline">View Link</a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{purchase.vendorName}</div>
                        {purchase.vendor?.salespersonName && (
                          <div className="text-xs text-gray-500">{purchase.vendor.salespersonName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(purchase.dateOfPurchase).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(purchase.price, purchase.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        AED {purchase.totalInAED?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.status)}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.orderBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(purchase)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(purchase._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPurchases.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {purchases.length === 0
                    ? 'No purchases found. Add your first purchase to get started.'
                    : activeTab === 'to-purchase'
                    ? 'No items to purchase match your filters. Try adjusting your search criteria.'
                    : 'No purchased items match your filters. Try adjusting your search criteria.'}
                </div>
              )}
            </div>
          )}
        </div>
>>>>>>> blackboxai/login-mongodb-fix
      </div>

      {/* Main Purchase Modal */}
      {isModalOpen && (
<<<<<<< HEAD
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingItem ? 'Edit Purchase' : 'Add Purchase'}
                </h3>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5" />
=======
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? 'Edit Purchase' : 'Add Purchase'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
>>>>>>> blackboxai/login-mongodb-fix
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Description</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="text"
                      required
                      value={formData.itemDescription}
                      onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                      list="item-descriptions"
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                    <datalist id="item-descriptions">
                      {itemDescriptions.map((desc, index) => (
                        <option key={index} value={desc} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vendor (Optional)</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <div className="flex space-x-2">
                      <select
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
<<<<<<< HEAD
                        className="input"
=======
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                      >
                        <option value="">Select Vendor (Optional)</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>
                            {vendor.company} - {vendor.salespersonName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsVendorModalOpen(true)}
<<<<<<< HEAD
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
=======
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>>>>>>> blackboxai/login-mongodb-fix
                        title="Add New Vendor"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order By</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order By</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <div className="flex space-x-2">
                      <select
                        value={formData.orderBy}
                        onChange={(e) => setFormData({ ...formData, orderBy: e.target.value })}
<<<<<<< HEAD
                        className="input"
=======
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                      >
                        {orderByOptions.map((person) => (
                          <option key={person._id || person.name} value={person.name || person}>
                            {person.name || person}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddOrderBy}
<<<<<<< HEAD
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
=======
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>>>>>>> blackboxai/login-mongodb-fix
                        title="Add New Person"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input"
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Purchase</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Purchase</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="date"
                      required
                      value={formData.dateOfPurchase}
                      onChange={(e) => setFormData({ ...formData, dateOfPurchase: e.target.value })}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medium of Purchase</label>
                    <select
                      value={formData.mediumOfPurchase}
                      onChange={(e) => setFormData({ ...formData, mediumOfPurchase: e.target.value })}
                      className="input"
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medium of Purchase</label>
                    <select
                      value={formData.mediumOfPurchase}
                      onChange={(e) => setFormData({ ...formData, mediumOfPurchase: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    >
                      <option value="Local">Local</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input"
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

<<<<<<< HEAD
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price per Unit (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input"
                    />
                  </div>
=======
                  {formData.status === 'Purchased' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (Optional)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
>>>>>>> blackboxai/login-mongodb-fix
                </div>

                {formData.status === 'Purchased' && (
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Account</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <select
                      required
                      value={formData.paymentAccount}
                      onChange={(e) => setFormData({ ...formData, paymentAccount: e.target.value })}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    >
                      {accountOptions.map((account) => (
                        <option key={account.value} value={account.value}>{account.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-slate-700 mb-1">Online Link (Optional)</label>
=======
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Link (Optional)</label>
>>>>>>> blackboxai/login-mongodb-fix
                  <input
                    type="url"
                    value={formData.onlineLink}
                    onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
<<<<<<< HEAD
                    className="input"
                    placeholder="https://..."
=======
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                  />
                </div>

                {parseInt(formData.quantity) <= 5 && (
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMEI/Serial Numbers</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">IMEI/Serial Numbers</label>
>>>>>>> blackboxai/login-mongodb-fix
                    {formData.imeiSerialNumbers.map((imei, index) => (
                      <input
                        key={index}
                        type="text"
                        value={imei}
                        onChange={(e) => {
                          const newImeis = [...formData.imeiSerialNumbers];
                          newImeis[index] = e.target.value;
                          setFormData({ ...formData, imeiSerialNumbers: newImeis });
                        }}
                        placeholder={`IMEI/Serial ${index + 1}`}
<<<<<<< HEAD
                        className="input mb-2"
=======
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
>>>>>>> blackboxai/login-mongodb-fix
                      />
                    ))}
                  </div>
                )}

<<<<<<< HEAD
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
=======
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
<<<<<<< HEAD
                    className="btn btn-primary"
=======
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    {editingItem ? 'Update' : 'Add'} Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Modal */}
      {isVendorModalOpen && (
<<<<<<< HEAD
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" onClick={closeVendorModal} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Add New Vendor</h3>
                <button onClick={closeVendorModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5" />
=======
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeVendorModal} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">Add New Vendor</h3>
                <button onClick={closeVendorModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
>>>>>>> blackboxai/login-mongodb-fix
                </button>
              </div>
              
              <form onSubmit={handleVendorSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="text"
                      required
                      value={vendorData.company}
                      onChange={(e) => setVendorData({ ...vendorData, company: e.target.value })}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salesperson Name</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson Name</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="text"
                      required
                      value={vendorData.salespersonName}
                      onChange={(e) => setVendorData({ ...vendorData, salespersonName: e.target.value })}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="text"
                      required
                      value={vendorData.contact}
                      onChange={(e) => setVendorData({ ...vendorData, contact: e.target.value })}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
>>>>>>> blackboxai/login-mongodb-fix
                    <input
                      type="email"
                      required
                      value={vendorData.email}
                      onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>
                </div>
                
                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
=======
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
>>>>>>> blackboxai/login-mongodb-fix
                  <textarea
                    required
                    value={vendorData.address}
                    onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                    rows="3"
<<<<<<< HEAD
                    className="input"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeVendorModal}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
=======
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeVendorModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
<<<<<<< HEAD
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
=======
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    Add Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* IMEI Modal for quantities > 5 */}
      {isImeiModalOpen && (
<<<<<<< HEAD
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-semibold text-slate-900">
=======
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
>>>>>>> blackboxai/login-mongodb-fix
                  Enter IMEI/Serial Numbers ({formData.quantity} items)
                </h3>
                <button 
                  onClick={() => setIsImeiModalOpen(false)} 
<<<<<<< HEAD
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
=======
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
>>>>>>> blackboxai/login-mongodb-fix
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {imeiNumbers.map((imei, index) => (
                  <div key={index}>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-slate-700 mb-1">
=======
                    <label className="block text-sm font-medium text-gray-700 mb-1">
>>>>>>> blackboxai/login-mongodb-fix
                      IMEI/Serial {index + 1}
                    </label>
                    <input
                      type="text"
                      value={imei}
                      onChange={(e) => {
                        const newImeis = [...imeiNumbers];
                        newImeis[index] = e.target.value;
                        setImeiNumbers(newImeis);
                      }}
<<<<<<< HEAD
                      className="input"
=======
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> blackboxai/login-mongodb-fix
                    />
                  </div>
                ))}
                
<<<<<<< HEAD
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsImeiModalOpen(false)}
                    className="btn btn-primary"
=======
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsImeiModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> blackboxai/login-mongodb-fix
