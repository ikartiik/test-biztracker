'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon,
  MagnifyingGlassIcon, BuildingOfficeIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { exportVendors } from '@/lib/exportExcel';

const emptyForm = {
  company: '', salespersonName: '', contact: '',
  phone: '', email: '', address: '', status: 'Active',
};

export default function VendorsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [vendors,   setVendors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [search,    setSearch]    = useState('');
  const [form,      setForm]      = useState(emptyForm);

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    load();
  }, [session]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load vendors'); }
    finally { setLoading(false); }
  };

  const filtered = vendors.filter(v =>
    v.company?.toLowerCase().includes(search.toLowerCase()) ||
    v.salespersonName?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = vendors.filter(v => v.status === 'Active').length;
  const inactiveCount = vendors.filter(v => v.status !== 'Active').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/vendors/${editing._id}` : '/api/vendors';
      const res = await fetch(url, {
        method:  editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? 'Vendor updated' : 'Vendor created');
        load(); closeModal();
      } else toast.error('Failed to save vendor');
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
    else toast.error('Delete failed');
  };

  const openEdit = (vendor) => {
    setEditing(vendor);
    setForm({
      company:         vendor.company         || '',
      salespersonName: vendor.salespersonName || '',
      contact:         vendor.contact         || '',
      phone:           vendor.phone           || '',
      email:           vendor.email           || '',
      address:         vendor.address         || '',
      status:          vendor.status          || 'Active',
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); };
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {vendors.length} total · {activeCount} active · {inactiveCount} inactive
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => exportVendors(filtered.map(v => ({
                companyName: v.company, salesperson: v.salespersonName,
                contactNo: v.phone, email: v.email, address: v.address,
              })))}
              disabled={!filtered.length}
              className="btn btn-ghost text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
              <PlusIcon className="w-4 h-4" /> Add Vendor
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search vendors…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-card text-foreground text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Salesperson</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(vendor => (
                  <tr key={vendor._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-rose-600">
                            {vendor.company?.slice(0,2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{vendor.company}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium text-sm text-foreground">{vendor.salespersonName}</p>
                      {vendor.contact && <p className="text-xs text-muted-foreground">{vendor.contact}</p>}
                    </td>
                    <td className="font-mono text-sm">{vendor.phone || <span className="text-muted-foreground">—</span>}</td>
                    <td>
                      {vendor.email
                        ? <a href={`mailto:${vendor.email}`} className="text-sm text-primary hover:underline">{vendor.email}</a>
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </td>
                    <td className="text-sm text-muted-foreground max-w-[180px] truncate">
                      {vendor.address || '—'}
                    </td>
                    <td>
                      <span className={`badge ${vendor.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(vendor)} title="Edit"
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(vendor._id)} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <BuildingOfficeIcon className="w-7 h-7 text-rose-500" />
              </div>
              <p className="font-semibold text-foreground">No vendors found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search ? 'Try a different search term.' : 'Add your first vendor to get started.'}
              </p>
              {!search && (
                <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
                  <PlusIcon className="w-4 h-4" /> Add Vendor
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? 'Edit Vendor' : 'New Vendor'}
              </h2>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={form.company} onChange={set('company')}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Salesperson Name <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={form.salespersonName} onChange={set('salespersonName')}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={set('phone')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={set('email')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Address</label>
                <textarea value={form.address} onChange={set('address')} rows={2}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                <select value={form.status} onChange={set('status')}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="submit" className="btn btn-primary flex-1">
                  {editing ? 'Save Changes' : 'Create Vendor'}
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
