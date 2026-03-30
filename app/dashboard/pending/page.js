'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  ClockIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,
  ExclamationTriangleIcon, FireIcon,
} from '@heroicons/react/24/outline';
import { exportPending } from '@/lib/exportExcel';

const PRIORITY_STYLES = {
  'Critical':   { badge: 'badge-danger',  row: 'bg-red-50/60 dark:bg-red-950/10',   dot: 'bg-red-500'    },
  'Urgent':     { badge: 'badge-warning', row: 'bg-amber-50/60 dark:bg-amber-950/10', dot: 'bg-amber-500'  },
  'Not Urgent': { badge: 'badge-neutral', row: '',                                  dot: 'bg-slate-400'  },
};

const STATUS_BADGE = {
  'Pending':          'badge-warning',
  'Received':         'badge-success',
  'Shipped':          'badge-info',
  'Partially Shipped':'badge-violet',
  'Enroute':          'badge-neutral',
};

export default function PendingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('all');
  const [priorityF,setPriorityF]= useState('all');

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    load();
  }, [session]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/pending');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load pending items'); }
    finally { setLoading(false); }
  };

  const filtered = items.filter(item => {
    if (statusF   !== 'all' && item.status   !== statusF)   return false;
    if (priorityF !== 'all' && item.priority !== priorityF) return false;
    if (search && !item.itemDescription?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalQty    = items.reduce((s, i) => s + (i.qtyPending || 0), 0);
  const urgentCount = items.filter(i => i.priority === 'Urgent').length;
  const criticalCount = items.filter(i => i.priority === 'Critical').length;

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
            <h1 className="text-2xl font-bold text-foreground">Pending Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} items · {totalQty} units pending
            </p>
          </div>
          <button onClick={() => exportPending(filtered)} disabled={!filtered.length}
            className="btn btn-ghost text-sm flex-shrink-0">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Qty</p>
              <p className="text-2xl font-black text-foreground leading-tight">{totalQty}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Urgent</p>
              <p className="text-2xl font-black text-amber-600 leading-tight">{urgentCount}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <FireIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Critical</p>
              <p className="text-2xl font-black text-red-600 leading-tight">{criticalCount}</p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search items…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
            <option value="Shipped">Shipped</option>
            <option value="Partially Shipped">Partially Shipped</option>
            <option value="Enroute">Enroute</option>
          </select>
          <select value={priorityF} onChange={e => setPriorityF(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Not Urgent">Not Urgent</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>SR No</th>
                  <th>Item Description</th>
                  <th>Shipment</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Qty Pending</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const ps = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES['Not Urgent'];
                  return (
                    <tr key={item._id} className={ps.row}>
                      <td className="font-mono text-xs text-muted-foreground">{item.srNo}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`} />
                          <span className="font-medium text-foreground">{item.itemDescription}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.shipment === 'Local Purchase' ? 'badge-info' : 'badge-neutral'}`}>
                          {item.shipment}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ps.badge}`}>{item.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[item.status] || 'badge-neutral'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{textAlign:'right'}}>
                        <span className="text-lg font-black text-primary">{item.qtyPending}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filtered.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                <ClockIcon className="w-7 h-7 text-amber-500" />
              </div>
              <p className="font-semibold text-foreground">No pending items</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusF !== 'all' || priorityF !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Items created from purchases will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
