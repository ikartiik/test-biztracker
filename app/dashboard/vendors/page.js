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
  MagnifyingGlassIcon,
<<<<<<< HEAD
  XMarkIcon,
  BuildingOffice2Icon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
=======
  XMarkIcon
>>>>>>> blackboxai/login-mongodb-fix
} from '@heroicons/react/24/outline';

export default function VendorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    salespersonName: '',
    contact: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchVendors();
  }, [session, status, router]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingVendor ? `/api/vendors/${editingVendor._id}` : '/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save vendor');

      toast.success(`Vendor ${editingVendor ? 'updated' : 'created'} successfully`);
      setShowModal(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete vendor');

      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      company: vendor.company,
      salespersonName: vendor.salespersonName,
      contact: vendor.contact || '',
      email: vendor.email || '',
      address: vendor.address || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingVendor(null);
    setFormData({
      company: '',
      salespersonName: '',
      contact: '',
      email: '',
      address: ''
    });
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.salespersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contact.includes(searchTerm)
  );

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
<<<<<<< HEAD
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading...</p>
          </div>
=======
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
>>>>>>> blackboxai/login-mongodb-fix
        </div>
      </DashboardLayout>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
<<<<<<< HEAD
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BuildingOffice2Icon className="w-8 h-8 text-violet-600" />
              Vendors Management
            </h1>
            <p className="mt-1 text-slate-600">Manage your vendor information</p>
=======
            <h1 className="text-3xl font-bold text-gray-900">Vendors Management</h1>
            <p className="mt-2 text-gray-600">Manage your vendor information</p>
>>>>>>> blackboxai/login-mongodb-fix
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
<<<<<<< HEAD
            className="btn btn-primary"
=======
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
>>>>>>> blackboxai/login-mongodb-fix
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Vendor
          </button>
        </div>

        {/* Search */}
<<<<<<< HEAD
        <div className="card p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by company, salesperson, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {filteredVendors.length === 0 ? (
          <div className="empty-state">
            <BuildingOffice2Icon className="w-16 h-16 mx-auto text-slate-300" />
            <p className="text-lg font-medium text-slate-500 mt-4">No vendors found</p>
            <p className="text-sm text-slate-400">Add your first vendor to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => (
              <div key={vendor._id} className="card p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <BuildingOffice2Icon className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{vendor.company}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
=======
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors by company, salesperson, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{vendor.company}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-5 h-5" />
>>>>>>> blackboxai/login-mongodb-fix
                    </button>
                  </div>
                </div>

<<<<<<< HEAD
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500">Salesperson:</span>
                      <p className="text-slate-900 font-medium">{vendor.salespersonName}</p>
                    </div>
                  </div>
                  {vendor.contact && (
                    <div className="flex items-start gap-2">
                      <PhoneIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-slate-500">Contact:</span>
                        <p className="text-slate-900">{vendor.contact}</p>
                      </div>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-start gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-slate-500">Email:</span>
                        <p className="text-slate-900 break-all">{vendor.email}</p>
                      </div>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-slate-500">Address:</span>
                        <p className="text-slate-900">{vendor.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredVendors.length > 0 && (
          <p className="text-sm text-slate-500 text-right">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-slate-900">
=======
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Salesperson:</span>
                    <p className="text-gray-600">{vendor.salespersonName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contact:</span>
                    <p className="text-gray-600">{vendor.contact}</p>
                  </div>
                  {vendor.email && (
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600 break-all">{vendor.email}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <p className="text-gray-600">{vendor.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No vendors found</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
>>>>>>> blackboxai/login-mongodb-fix
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-slate-700 mb-1">
=======
                  <label className="block text-sm font-medium text-gray-700 mb-1">
>>>>>>> blackboxai/login-mongodb-fix
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
<<<<<<< HEAD
                    className="input"
=======
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> blackboxai/login-mongodb-fix
                  />
                </div>

                <div>
<<<<<<< HEAD
                  <label className="block text-sm font-medium text-slate-700 mb-1">
=======
                  <label className="block text-sm font-medium text-gray-700 mb-1">
>>>>>>> blackboxai/login-mongodb-fix
                    Salesperson Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.salespersonName}
                    onChange={(e) => setFormData({ ...formData, salespersonName: e.target.value })}
<<<<<<< HEAD
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
=======
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
>>>>>>> blackboxai/login-mongodb-fix
                    Address
                  </label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
<<<<<<< HEAD
                    className="input"
=======
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> blackboxai/login-mongodb-fix
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
<<<<<<< HEAD
                    className="flex-1 btn btn-primary"
=======
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    {loading ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Create Vendor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
<<<<<<< HEAD
                    className="btn btn-secondary"
=======
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
>>>>>>> blackboxai/login-mongodb-fix
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
<<<<<<< HEAD
        </div>
      )}
    </DashboardLayout>
  );
}

=======
        )}
      </div>
    </DashboardLayout>
  );
}
>>>>>>> blackboxai/login-mongodb-fix
