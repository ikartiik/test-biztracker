'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon,
  MagnifyingGlassIcon, ArrowDownTrayIcon,
  DocumentArrowUpIcon, ChevronDownIcon, ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { exportImports } from '@/lib/exportExcel';

const PAYMENT_MODES = [
  { value: 'cash',     label: 'Cash'     },
  { value: 'mashreq',  label: 'Mashreq'  },
  { value: 'hsbc',     label: 'HSBC'     },
  { value: 'crown',    label: 'Crown FZ' },
  { value: 'sasco',    label: 'SASCO FZ' },
  { value: 'other_fz', label: 'Other FZ' },
];

const empty = {
  vendorId: '', vendorName: '', country: '',
  invoiceNumber: '', trackingNumber: '', trackingLink: '',
  dateOfShipping: '', dateOfReceiving: '',
  amountDutyPaid: '', paymentMode: 'cash',
  status: 'Enroute',
  items: [{ itemDescription: '', quantity: 1 }],
};

export default function ImportPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [imports,   setImports]   = useState([]);
  const [vendors,   setVendors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [form,      setForm]      = useState(empty);

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    load();
  }, [session]);

  const load = async () => {
    setLoading(true);
    try {
      const [iRes, vRes] = await Promise.all([fetch('/api/import'), fetch('/api/vendors')]);
      const [i, v]       = await Promise.all([iRes.json(), vRes.json()]);
      setImports(Array.isArray(i) ? i : []);
      setVendors(Array.isArray(v) ? v : []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const filtered = imports.filter(imp => {
    if (statusF !== 'all' && imp.status !== statusF) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!imp.vendorName?.toLowerCase().includes(q) &&
          !imp.invoiceNumber?.toLowerCase().includes(q) &&
          !(imp.items||[]).some(it => it.itemDescription?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const enrouteCount  = imports.filter(i => i.status === 'Enroute').length;
  const receivedCount = imports.filter(i => i.status === 'Received').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vendor:          form.vendorId || undefined,
        vendorName:      form.vendorName,
        country:         form.country,
        invoiceNumber:   form.invoiceNumber,
        trackingNumber:  form.trackingNumber,
        trackingLink:    form.trackingLink,
        dateOfShipping:  form.dateOfShipping || undefined,
        dateOfReceiving: form.dateOfReceiving || undefined,
        amountDutyPaid:  parseFloat(form.amountDutyPaid) || 0,
        paymentMode:     form.paymentMode,
        status:          form.status,
        items:           form.items.filter(it => it.itemDescription.trim()),
      };
      const url = editing ? `/api/import?id=${editing._id}` : '/api/import';
      const res = await fetch(url, {
        method:  editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        if (!editing && payload.amountDutyPaid > 0) {
          await fetch('/api/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              srNo: `DUTY-${Date.now()}`, category: 'CUSTOMS DUTY',
              type: 'expense', account: payload.paymentMode,
              amount: payload.amountDutyPaid,
              remark: `Duty for import from ${payload.vendorName}`,
            }),
          });
        }
        toast.success(editing ? 'Import updated' : 'Import created');
        load(); closeModal();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save');
      }
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this import?')) return;
    const res = await fetch(`/api/import?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
    else toast.error('Delete failed');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      vendorId:        item.vendor?._id || '',
      vendorName:      item.vendorName  || item.vendor?.company || '',
      country:         item.country     || '',
      invoiceNumber:   item.invoiceNumber  || '',
      trackingNumber:  item.trackingNumber || '',
      trackingLink:    item.trackingLink   || '',
      dateOfShipping:  item.dateOfShipping  ? item.dateOfShipping.slice(0,10)  : '',
      dateOfReceiving: item.dateOfReceiving ? item.dateOfReceiving.slice(0,10) : '',
      amountDutyPaid:  item.amountDutyPaid  || '',
      paymentMode:     item.paymentMode     || 'cash',
      status:          item.status          || 'Enroute',
      items:           item.items?.length ? item.items : [{ itemDescription: '', quantity: 1 }],
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(empty); };
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { itemDescription: '', quantity: 1 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it),
  }));

  const csvInputRef = useRef(null);

  const downloadTemplate = () => {
    const csv = 'item_description,quantity\nSample Item 1,5\nSample Item 2,3\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'import-items-template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const lines = ev.target.result.trim().split('\n').filter(Boolean);
        // Skip header row if it starts with 'item' (case-insensitive)
        const dataLines = lines[0]?.toLowerCase().startsWith('item') ? lines.slice(1) : lines;
        const parsed = dataLines.map(line => {
          const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          return { itemDescription: cols[0] || '', quantity: parseInt(cols[1]) || 1 };
        }).filter(it => it.itemDescription);
        if (!parsed.length) { toast.error('No valid rows found in CSV'); return; }
        setForm(f => ({ ...f, items: parsed }));
        toast.success(`Loaded ${parsed.length} items from CSV`);
      } catch { toast.error('Failed to parse CSV'); }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-uploaded
    e.target.value = '';
  };

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
            <h1 className="text-2xl font-bold text-foreground">Import Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {enrouteCount} en route · {receivedCount} received
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => exportImports(filtered)} disabled={!filtered.length}
              className="btn btn-ghost text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
              <PlusIcon className="w-4 h-4" /> New Import
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Total</p>
            <p className="text-2xl font-black text-foreground">{imports.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">En Route</p>
            <p className="text-2xl font-black text-blue-600">{enrouteCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Received</p>
            <p className="text-2xl font-black text-emerald-600">{receivedCount}</p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search vendor, invoice, or item…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Status</option>
            <option value="Enroute">Enroute</option>
            <option value="Received">Received</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Vendor</th>
                  <th>Invoice</th>
                  <th>Country</th>
                  <th>Ship Date</th>
                  <th style={{textAlign:'right'}}>Duty (AED)</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(imp => (
                  <>
                    <tr key={imp._id}>
                      <td className="font-mono text-xs text-muted-foreground">{imp.serialNumber || '—'}</td>
                      <td>
                        <p className="font-semibold text-foreground">{imp.vendorName || imp.vendor?.company}</p>
                        <p className="text-xs text-muted-foreground capitalize">{imp.paymentMode}</p>
                      </td>
                      <td className="font-mono text-sm">{imp.invoiceNumber || '—'}</td>
                      <td className="text-sm">{imp.country || '—'}</td>
                      <td className="text-sm text-muted-foreground">
                        {imp.dateOfShipping ? new Date(imp.dateOfShipping).toLocaleDateString() : '—'}
                      </td>
                      <td className="text-right font-mono text-sm font-semibold">
                        {imp.amountDutyPaid > 0
                          ? <span className="text-red-600">{imp.amountDutyPaid.toLocaleString()}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td>
                        <button onClick={() => setExpanded(expanded === imp._id ? null : imp._id)}
                          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                          {imp.items?.length || 0} items
                          {expanded === imp._id
                            ? <ChevronUpIcon className="w-3.5 h-3.5" />
                            : <ChevronDownIcon className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${imp.status === 'Received' ? 'badge-success' : 'badge-info'}`}>
                          {imp.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(imp)} title="Edit"
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(imp._id)} title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded === imp._id && (
                      <tr key={`${imp._id}-exp`} className="bg-muted/20">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="space-y-1.5">
                            {(imp.items || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-sm">
                                <span className="text-muted-foreground w-5 text-right font-mono">{idx + 1}.</span>
                                <span className="text-foreground font-medium flex-1">{item.itemDescription}</span>
                                <span className="text-muted-foreground text-xs">Qty: {item.quantity}</span>
                              </div>
                            ))}
                            {imp.trackingNumber && (
                              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                                Tracking: <span className="font-mono">{imp.trackingNumber}</span>
                                {imp.trackingLink && (
                                  <a href={imp.trackingLink} target="_blank" rel="noreferrer"
                                    className="ml-2 text-primary underline">View →</a>
                                )}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                <DocumentArrowUpIcon className="w-7 h-7 text-teal-500" />
              </div>
              <p className="font-semibold text-foreground">No imports found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search || statusF !== 'all' ? 'Try adjusting your filters.' : 'Create your first import record.'}
              </p>
              {!search && statusF === 'all' && (
                <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
                  <PlusIcon className="w-4 h-4" /> New Import
                </button>
              )}
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
                {editing ? 'Edit Import' : 'New Import'}
              </h2>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select required value={form.vendorId}
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
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="e.g. China"
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={form.invoiceNumber}
                    onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Tracking Number</label>
                  <input type="text" value={form.trackingNumber}
                    onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Tracking Link</label>
                <input type="url" value={form.trackingLink}
                  onChange={e => setForm(f => ({ ...f, trackingLink: e.target.value }))}
                  placeholder="https://…"
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Date of Shipping <span className="text-red-500">*</span>
                  </label>
                  <input type="date" required value={form.dateOfShipping}
                    onChange={e => setForm(f => ({ ...f, dateOfShipping: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Date of Receiving</label>
                  <input type="date" value={form.dateOfReceiving}
                    onChange={e => setForm(f => ({ ...f, dateOfReceiving: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Duty Amount (AED)</label>
                  <input type="number" min="0" step="0.01" value={form.amountDutyPaid}
                    onChange={e => setForm(f => ({ ...f, amountDutyPaid: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Payment Mode</label>
                  <select value={form.paymentMode}
                    onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                <select value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Enroute">Enroute</option>
                  <option value="Received">Received</option>
                </select>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Items</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={downloadTemplate}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Template
                    </button>
                    <button type="button" onClick={() => csvInputRef.current?.click()}
                      className="text-xs text-violet-600 hover:underline font-semibold flex items-center gap-1">
                      <DocumentArrowUpIcon className="w-3.5 h-3.5" /> Import CSV
                    </button>
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden"
                      onChange={handleCSVUpload} />
                    <button type="button" onClick={addItem}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                      <PlusIcon className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" placeholder={`Item ${idx + 1} description`}
                        value={item.itemDescription}
                        onChange={e => updateItem(idx, 'itemDescription', e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input type="number" min="1" value={item.quantity} style={{width:'80px'}}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary" />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors flex-shrink-0">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="submit" className="btn btn-primary flex-1">
                  {editing ? 'Save Changes' : 'Create Import'}
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
