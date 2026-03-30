'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  TruckIcon, ArrowPathIcon, TrashIcon, XMarkIcon,
  PlusIcon, ChevronDownIcon, ChevronUpIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { exportShipping } from '@/lib/exportExcel';

const PRIORITY_BADGE = {
  'Critical': 'badge-danger',
  'High':     'badge-warning',
  'Medium':   'badge-info',
  'Low':      'badge-neutral',
};

export default function ShippingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [syncing,    setSyncing]    = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [shipModal,  setShipModal]  = useState(null);
  const [shipForm,   setShipForm]   = useState({
    quantityShipped: '', dateOfShipping: new Date().toISOString().slice(0, 10), remarks: '',
  });

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    load();
  }, [session]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/shipping');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load shipping data'); }
    finally { setLoading(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res  = await fetch('/api/shipping/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.created > 0 ? `Synced ${data.created} new entries` : 'Already up to date');
        load();
      } else toast.error(data.error || 'Sync failed');
    } catch { toast.error('Sync failed'); }
    finally { setSyncing(false); }
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();
    const entry = shipModal;
    const qty   = parseInt(shipForm.quantityShipped);
    if (!qty || qty <= 0)                  { toast.error('Enter a valid quantity'); return; }
    if (qty > (entry.quantityRemaining||0)){ toast.error(`Only ${entry.quantityRemaining} remaining`); return; }
    try {
      const newEntries   = [...(entry.shipmentEntries || []),
        { quantityShipped: qty, dateOfShipping: shipForm.dateOfShipping, remarks: shipForm.remarks }];
      const totalShipped = newEntries.reduce((s, e) => s + e.quantityShipped, 0);
      const res = await fetch(`/api/shipping?id=${entry._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentEntries: newEntries,
          status: totalShipped >= entry.totalQuantity ? 'Shipped' : 'Pending',
        }),
      });
      if (res.ok) {
        toast.success('Shipment recorded');
        setShipModal(null);
        setShipForm({ quantityShipped: '', dateOfShipping: new Date().toISOString().slice(0,10), remarks: '' });
        load();
      } else toast.error('Failed to save shipment');
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipping entry?')) return;
    const res = await fetch(`/api/shipping?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
    else toast.error('Delete failed');
  };

  const pendingCount = entries.filter(e => e.status === 'Pending').length;
  const shippedCount = entries.filter(e => e.status === 'Shipped').length;

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
            <h1 className="text-2xl font-bold text-foreground">Shipping Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {pendingCount} pending · {shippedCount} fully shipped
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => exportShipping(entries)} disabled={!entries.length}
              className="btn btn-ghost text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
            <button onClick={handleSync} disabled={syncing} className="btn btn-primary text-sm">
              <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync Data'}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Total</p>
            <p className="text-2xl font-black text-foreground">{entries.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Pending</p>
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Shipped</p>
            <p className="text-2xl font-black text-emerald-600">{shippedCount}</p>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Item</th>
                  <th>Source</th>
                  <th style={{textAlign:'right'}}>Total</th>
                  <th style={{textAlign:'right'}}>Shipped</th>
                  <th style={{textAlign:'right'}}>Remaining</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Shipments</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <>
                    <tr key={entry._id}>
                      <td className="font-mono text-xs text-muted-foreground">{entry.serialNumber || '—'}</td>
                      <td>
                        <p className="font-medium text-foreground max-w-[220px] truncate">{entry.itemDescription}</p>
                      </td>
                      <td>
                        <span className={`badge ${entry.source === 'Import' ? 'badge-violet' : 'badge-info'}`}>
                          {entry.source || entry.sourceModel}
                        </span>
                      </td>
                      <td className="text-right font-mono text-sm">{entry.totalQuantity ?? '—'}</td>
                      <td className="text-right font-mono text-sm text-emerald-600 font-semibold">
                        {entry.quantityShipped ?? 0}
                      </td>
                      <td className="text-right font-mono text-sm">
                        {(entry.quantityRemaining ?? 0) > 0
                          ? <span className="font-bold text-amber-600">{entry.quantityRemaining}</span>
                          : <span className="text-muted-foreground">0</span>}
                      </td>
                      <td>
                        <span className={`badge ${PRIORITY_BADGE[entry.priority] || 'badge-neutral'}`}>
                          {entry.priority || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${entry.status === 'Shipped' ? 'badge-success' : 'badge-warning'}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {entry.status !== 'Shipped' && (
                            <button onClick={() => setShipModal(entry)}
                              className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold">
                              <PlusIcon className="w-3.5 h-3.5" /> Add
                            </button>
                          )}
                          {entry.shipmentEntries?.length > 0 && (
                            <button
                              onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                              {entry.shipmentEntries.length}×
                              {expandedId === entry._id
                                ? <ChevronUpIcon className="w-3 h-3" />
                                : <ChevronDownIcon className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <button onClick={() => handleDelete(entry._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedId === entry._id && entry.shipmentEntries?.map((se, idx) => (
                      <tr key={`${entry._id}-${idx}`} className="bg-muted/20">
                        <td />
                        <td colSpan={3} className="py-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Shipment {idx + 1}:</span>{' '}
                          {se.quantityShipped} units
                        </td>
                        <td className="text-xs text-muted-foreground py-2">
                          {se.dateOfShipping ? new Date(se.dateOfShipping).toLocaleDateString() : '—'}
                        </td>
                        <td colSpan={5} className="text-xs text-muted-foreground py-2">
                          {se.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {!entries.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <TruckIcon className="w-7 h-7 text-violet-500" />
              </div>
              <p className="font-semibold text-foreground">No shipping entries</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Click Sync Data to pull in purchased and imported items.
              </p>
              <button onClick={handleSync} disabled={syncing} className="btn btn-primary text-sm">
                <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Shipment Modal ── */}
      {shipModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Record Shipment</h2>
              <button onClick={() => setShipModal(null)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 py-3 bg-muted/30">
              <p className="text-sm font-semibold text-foreground truncate">{shipModal.itemDescription}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {shipModal.quantityShipped} shipped · <span className="text-amber-600 font-semibold">{shipModal.quantityRemaining} remaining</span>
              </p>
            </div>

            <form onSubmit={handleAddShipment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Quantity to Ship <span className="text-red-500">*</span>
                </label>
                <input type="number" required min="1" max={shipModal.quantityRemaining}
                  value={shipForm.quantityShipped}
                  onChange={e => setShipForm(f => ({ ...f, quantityShipped: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Date</label>
                <input type="date" value={shipForm.dateOfShipping}
                  onChange={e => setShipForm(f => ({ ...f, dateOfShipping: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Remarks</label>
                <textarea rows={2} value={shipForm.remarks}
                  onChange={e => setShipForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder="Optional notes…"
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">Record Shipment</button>
                <button type="button" onClick={() => setShipModal(null)} className="btn btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
