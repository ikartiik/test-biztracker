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
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function VendorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    company: '',
    salespersonName: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active'
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchVendors();
  }, [session, router]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vendors');
      const data = await response.json();
      setVendors(data);
      setFilteredVendors(data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingVendor ? `/api/vendors/${editingVendor._id}` : '/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success(editingVendor ? 'Vendor updated' : 'Vendor created');
        fetchVendors();
        closeModal();
      } else {
        toast.error('Failed to save vendor');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Vendor deleted');
          fetchVendors();
        }
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    setFormData({
      company: '',
      salespersonName: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      status: 'Active'
    });
  };

  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      company: vendor.company,
      salespersonName: vendor.salespersonName,
      contact: vendor.contact || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      status: vendor.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const filteredResults = filteredVendors.filter(vendor =>
    vendor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.salespersonName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading vendors...</div>;
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendors Management</h1>
            <p className="text-muted-foreground mt-2">Manage vendor information and contacts ({vendors.length})</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-semibold shadow-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Add Vendor
          </button>
        </div>

        {/* Search */}
        <div className="glass-card p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendors by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Vendors Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
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
                {filteredResults.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{vendor.company}</div>
                      <div className="text-sm text-muted-foreground">{vendor.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{vendor.salespersonName}</div>
                      <div className="text-sm text-muted-foreground">{vendor.contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono">{vendor.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${vendor.email}`} className="text-primary hover:underline text-sm">
                        {vendor.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        vendor.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(vendor)}
                          className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
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
          
          {filteredResults.length === 0 && !loading && (
            <div className="text-center py-20">
              <BuildingOfficeIcon className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-3">No vendors found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Add your first vendor to get started with purchase tracking.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl hover:bg-primary/90 font-semibold shadow-lg transition-all"
              >
                Add First Vendor
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Vendor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full">
              <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingVendor ? 'Edit Vendor' : 'New Vendor'}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-xl hover:bg-accent">
                    <XMarkIcon className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Salesperson Name *</label>
                  <input
                    type="text"
                    value={formData.salespersonName}
                    onChange={(e) => setFormData({ ...formData, salespersonName: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary resize-vertical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingVendor ? 'Update Vendor' : 'Create Vendor'}
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
