'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon,
  MagnifyingGlassIcon, ArrowDownTrayIcon, ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { exportPurchases } from '@/lib/exportExcel';

const ACCOUNTS = [
  { value: 'cash',        label: 'Cash'         },
  { value: 'mashreq',     label: 'Mashreq'      },
  { value: 'hsbc',        label: 'HSBC'         },
  { value: 'kar_fab',     label: 'Kar FAB'      },
  { value: 'kar_liv',     label: 'Kar Liv'      },
  { value: 'kar_mashreq', label: 'Kar Mashreq'  },
  { value: 'crown',       label: 'Crown FZ'     },
  { value: 'sasco',       label: 'SASCO FZ'     },
  { value: 'other_fz',    label: 'Other FZ'     },
];
const CATEGORIES = ['Electronics','Office Supplies','Furniture','Software','Hardware','Stationery','Other'];
const CURRENCIES  = ['USD','AED','EUR'];
const EXCHANGE    = { USD: 3.67, AED: 1, EUR: 4.0 };

const empty = {
  itemDescription: '', vendorId: '', vendorName: '',
  currency: 'USD', price: '', quantity: 1,
  paymentAccount: 'cash', category: 'Other',
  status: 'To Purchase', orderById: '',
};

export default function PurchasePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [purchases,   setPurchases]   = useState([]);
  const [vendors,     setVendors]     = useState([]);
  const [orderBys,    setOrderBys]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [tab,         setTab]         = useState('To Purchase');
  const [search,      setSearch]      = useState('');
  const [form,        setForm]        = useState(empty);

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    load();
  }, [session]);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, vRes, oRes] = await Promise.all([
        fetch('/api/purchase'), fetch('/api/vendors'), fetch('/api/orderby'),
      ]);
      const [p, v, o] = await Promise.all([pRes.json(), vRes.json(), oRes.json()]);
      setPurchases(Array.isArray(p) ? p : []);
      setVendors(Array.isArray(v)   ? v : []);
      setOrderBys(Array.isArray(o)  ? o : []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const priceNum   = parseFloat(form.price) || 0;
  const qtyNum     = parseInt(form.quantity)  || 1;
  const totalInAED = priceNum * (EXCHANGE[form.currency] || 1) * qtyNum;

  const filtered = purchases.filter(p => {
    if (p.status !== tab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.itemDescription?.toLowerCase().includes(q) || p.vendorName?.toLowerCase().includes(q);
  });

  const toPurchaseCount = purchases.filter(p => p.status === 'To Purchase').length;
  const purchasedCount  = purchases.filter(p => p.status === 'Purchased').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itemDescription: form.itemDescription,
        vendor:          form.vendorId   || undefined,
        vendorName:      form.vendorName,
        currency:        form.currency,
        price:           priceNum,
        quantity:        qtyNum,
        paymentAccount:  form.paymentAccount,
        category:        form.category,
        status:          form.status,
        orderBy:         form.orderById  || undefined,
      };
      const url    = editing ? `/api/purchase?id=${editing._id}` : '/api/purchase';
      const res    = await fetch(url, {
        method:  editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Created');
        load(); closeModal();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save');
      }
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase?')) return;
    const res = await fetch(`/api/purchase?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
    else toast.error('Delete failed');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      itemDescription: item.itemDescription || '',
      vendorId:        item.vendor?._id || item.vendor || '',
      vendorName:      item.vendorName  || item.vendor?.company || '',
      currency:        item.currency    || 'USD',
      price:           item.price       || '',
      quantity:        item.quantity    || 1,
      paymentAccount:  item.paymentAccount || 'cash',
      category:        item.category    || 'Other',
      status:          item.status      || 'To Purchase',
      orderById:       item.orderBy?._id || item.orderBy || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(empty); };
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
            <h1 className="text-2xl font-bold text-foreground">Purchase Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {toPurchaseCount} to purchase · {purchasedCount} purchased
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => exportPurchases(filtered)} disabled={!filtered.length}
              className="btn btn-ghost text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
              <PlusIcon className="w-4 h-4" /> New Entry
            </button>
          </div>
        </div>

        {/* ── Tabs + Search ── */}
        <div className="glass-card p-1.5 flex gap-1.5">
          {[
            { status: 'To Purchase', count: toPurchaseCount, color: 'badge-info' },
            { status: 'Purchased',   count: purchasedCount,  color: 'badge-success' },
          ].map(t => (
            <button key={t.status} onClick={() => setTab(t.status)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-all
                ${tab === t.status
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}>
              {t.status}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${tab === t.status ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search item or vendor…" value={search}
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
                  <th>Item</th>
                  <th>Vendor</th>
                  <th>Currency</th>
                  <th style={{textAlign:'right'}}>Price</th>
                  <th style={{textAlign:'right'}}>Qty</th>
                  <th style={{textAlign:'right'}}>Total AED</th>
                  <th>Account</th>
                  <th>Order By</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <p className="font-semibold text-foreground leading-tight">{p.itemDescription}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                    </td>
                    <td className="text-sm text-foreground">{p.vendorName || p.vendor?.company || <span className="text-muted-foreground">—</span>}</td>
                    <td>
                      <span className="badge badge-neutral">{p.currency}</span>
                    </td>
                    <td className="text-right font-mono text-sm">
                      {p.price ? p.price.toLocaleString() : '—'}
                    </td>
                    <td className="text-right text-sm font-medium">{p.quantity}</td>
                    <td className="text-right font-mono font-bold text-primary">
                      {(p.totalInAED || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-sm text-muted-foreground capitalize">{p.paymentAccount}</td>
                    <td className="text-sm">{p.orderBy?.name || <span className="text-muted-foreground">—</span>}</td>
                    <td>
                      <span className={`badge ${p.status === 'Purchased' ? 'badge-success' : 'badge-info'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} title="Edit"
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id)} title="Delete"
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
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <ShoppingCartIcon className="w-7 h-7 text-blue-500" />
              </div>
              <p className="font-semibold text-foreground">No {tab === 'To Purchase' ? 'quotations' : 'purchases'}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {tab === 'To Purchase' ? 'Add a new entry to get started.' : 'Purchased items will appear here.'}
              </p>
              <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
                <PlusIcon className="w-4 h-4" /> Add Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? 'Edit Entry' : tab === 'To Purchase' ? 'New Quotation' : 'New Purchase'}
              </h2>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Item Description <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={form.itemDescription} onChange={set('itemDescription')}
                  placeholder="e.g. Dell Laptop XPS 15"
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Vendor</label>
                  <select value={form.vendorId}
                    onChange={e => {
                      const v = vendors.find(x => x._id === e.target.value);
                      setForm(f => ({ ...f, vendorId: e.target.value, vendorName: v?.company || '' }));
                    }}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">— Select vendor —</option>
                    {vendors.map(v => <option key={v._id} value={v._id}>{v.company}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                  <select value={form.status} onChange={set('status')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="To Purchase">To Purchase</option>
                    <option value="Purchased">Purchased</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Currency</label>
                  <select value={form.currency} onChange={set('currency')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min="0" step="0.01" required value={form.price} onChange={set('price')}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={set('quantity')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {priceNum > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    {priceNum.toLocaleString()} {form.currency} × {EXCHANGE[form.currency]} × {qtyNum}
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    = AED {totalInAED.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Payment Account</label>
                  <select value={form.paymentAccount} onChange={set('paymentAccount')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    {ACCOUNTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                  <select value={form.category} onChange={set('category')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Order By</label>
                <select value={form.orderById} onChange={set('orderById')}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— None —</option>
                  {orderBys.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="submit" className="btn btn-primary flex-1">
                  {editing ? 'Save Changes' : 'Create Entry'}
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
