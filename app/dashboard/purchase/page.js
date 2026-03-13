'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
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

export default function PurchaseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [itemDescriptions, setItemDescriptions] = useState([]);
  const [orderByOptions, setOrderByOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isImeiModalOpen, setIsImeiModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imeiNumbers, setImeiNumbers] = useState(['']);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
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
    paymentAccount: 'cash'
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
    { value: 'mashreq', label: 'Mashreq Bank' },
    { value: 'hsbc', label: 'HSBC Bank' },
    { value: 'crown', label: 'Crown FZ' },
    { value: 'sasco', label: 'SASCO FZ' },
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
        toast.success(editingItem ? 'Purchase updated successfully' : 'Purchase added successfully');
        if (submitData.status === 'Purchased') {
          toast.success('Expense entry created and added to pending tracker');
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
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const response = await fetch(`/api/purchase?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Purchase deleted successfully');
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
      case 'To Purchase': return 'badge-warning';
      case 'Purchased': return 'badge-success';
      case 'Not Available': return 'badge-danger';
      default: return 'badge-neutral';
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

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
      </div>

      {/* Main Purchase Modal */}
      {isModalOpen && (
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
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Description</label>
                    <input
                      type="text"
                      required
                      value={formData.itemDescription}
                      onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                      list="item-descriptions"
                      className="input"
                    />
                    <datalist id="item-descriptions">
                      {itemDescriptions.map((desc, index) => (
                        <option key={index} value={desc} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vendor (Optional)</label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        className="input"
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
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Add New Vendor"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order By</label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.orderBy}
                        onChange={(e) => setFormData({ ...formData, orderBy: e.target.value })}
                        className="input"
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
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Add New Person"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Purchase</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfPurchase}
                      onChange={(e) => setFormData({ ...formData, dateOfPurchase: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medium of Purchase</label>
                    <select
                      value={formData.mediumOfPurchase}
                      onChange={(e) => setFormData({ ...formData, mediumOfPurchase: e.target.value })}
                      className="input"
                    >
                      <option value="Local">Local</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input"
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

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
                </div>

                {formData.status === 'Purchased' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Account</label>
                    <select
                      required
                      value={formData.paymentAccount}
                      onChange={(e) => setFormData({ ...formData, paymentAccount: e.target.value })}
                      className="input"
                    >
                      {accountOptions.map((account) => (
                        <option key={account.value} value={account.value}>{account.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Online Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.onlineLink}
                    onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                {parseInt(formData.quantity) <= 5 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMEI/Serial Numbers</label>
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
                        className="input mb-2"
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
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
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" onClick={closeVendorModal} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Add New Vendor</h3>
                <button onClick={closeVendorModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleVendorSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={vendorData.company}
                      onChange={(e) => setVendorData({ ...vendorData, company: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salesperson Name</label>
                    <input
                      type="text"
                      required
                      value={vendorData.salespersonName}
                      onChange={(e) => setVendorData({ ...vendorData, salespersonName: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={vendorData.contact}
                      onChange={(e) => setVendorData({ ...vendorData, contact: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={vendorData.email}
                      onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea
                    required
                    value={vendorData.address}
                    onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                    rows="3"
                    className="input"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeVendorModal}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-semibold text-slate-900">
                  Enter IMEI/Serial Numbers ({formData.quantity} items)
                </h3>
                <button 
                  onClick={() => setIsImeiModalOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {imeiNumbers.map((imei, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
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
                      className="input"
                    />
                  </div>
                ))}
                
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsImeiModalOpen(false)}
                    className="btn btn-primary"
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
}

