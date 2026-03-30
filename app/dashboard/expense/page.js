'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon,
  MagnifyingGlassIcon, ArrowDownTrayIcon,
  BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { exportExpenses } from '@/lib/exportExcel';

const CATEGORIES = [
  'SALARY','OFFICE RENT','UTILITIES','TRANSPORT',
  'BANK FEES','MISCELLANEOUS','PAYMENT TO FZ','INVOICE PAYMENT','CUSTOMS DUTY',
];

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

const emptyForm = { srNo: '', type: 'expense', category: '', account: 'cash', amount: '', remark: '' };

export default function ExpensePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [expenses,  setExpenses]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [search,    setSearch]    = useState('');
  const [typeF,     setTypeF]     = useState('all');
  const [form,      setForm]      = useState(emptyForm);

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    load();
  }, [session]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/expense');
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  const filtered = expenses.filter(e => {
    if (typeF !== 'all' && e.type !== typeF) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.srNo?.toLowerCase().includes(q) &&
          !e.category?.toLowerCase().includes(q) &&
          !e.remark?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalCredit = expenses.reduce((s, e) => s + (e.creditAmount || 0), 0);
  const totalDebit  = expenses.reduce((s, e) => s + (e.debitAmount  || 0), 0);
  const balance     = totalCredit - totalDebit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/expense?id=${editing._id}` : '/api/expense';
      const res = await fetch(url, {
        method:  editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Added');
        load(); closeModal();
      } else toast.error('Failed to save');
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    const res = await fetch(`/api/expense?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
    else toast.error('Delete failed');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ srNo: item.srNo, type: item.type, category: item.category,
              account: item.account, amount: item.amount || '', remark: item.remark || '' });
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
            <h1 className="text-2xl font-bold text-foreground">Expense Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {expenses.length} transactions across all accounts
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => exportExpenses(expenses)} disabled={!expenses.length}
              className="btn btn-ghost text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
              <PlusIcon className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Credit</p>
              <p className="text-xl font-black text-emerald-600 leading-tight truncate">
                AED {totalCredit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Debit</p>
              <p className="text-xl font-black text-red-600 leading-tight truncate">
                AED {totalDebit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <BanknotesIcon className={`w-5 h-5 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Net Balance</p>
              <p className={`text-xl font-black leading-tight truncate ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                AED {Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by SR no, category, remark…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={typeF} onChange={e => setTypeF(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>SR No</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th style={{textAlign:'right'}}>Debit</th>
                  <th style={{textAlign:'right'}}>Credit</th>
                  <th style={{textAlign:'right'}}>Balance</th>
                  <th>Remark</th>
                  <th>Date</th>
                  <th style={{textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp._id}>
                    <td className="font-mono text-xs text-muted-foreground">{exp.srNo}</td>
                    <td>
                      <span className={`badge ${exp.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="font-medium text-sm">{exp.category}</td>
                    <td className="text-sm text-muted-foreground capitalize">{exp.account}</td>
                    <td className="text-right font-mono text-sm">
                      {exp.debitAmount > 0
                        ? <span className="text-red-600 font-semibold">{exp.debitAmount.toLocaleString()}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="text-right font-mono text-sm">
                      {exp.creditAmount > 0
                        ? <span className="text-emerald-600 font-semibold">{exp.creditAmount.toLocaleString()}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="text-right font-mono text-sm font-bold">
                      <span className={(exp.balance || 0) >= 0 ? 'text-foreground' : 'text-red-600'}>
                        {(exp.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground max-w-[160px] truncate">{exp.remark || '—'}</td>
                    <td className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(exp.date || exp.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(exp)} title="Edit"
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exp._id)} title="Delete"
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
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <BanknotesIcon className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-semibold text-foreground">No transactions</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {search || typeF !== 'all' ? 'Try adjusting your filters.' : 'Add your first transaction.'}
              </p>
              {!search && typeF === 'all' && (
                <button onClick={() => setModalOpen(true)} className="btn btn-primary text-sm">
                  <PlusIcon className="w-4 h-4" /> Add Transaction
                </button>
              )}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pb-2">
            Showing {filtered.length} of {expenses.length} transactions
          </p>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    SR No <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={form.srNo} onChange={set('srNo')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Type</label>
                  <select value={form.type} onChange={set('type')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select required value={form.category} onChange={set('category')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">— Select —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Account</label>
                  <select value={form.account} onChange={set('account')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary">
                    {ACCOUNTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input type="number" required min="0" step="0.01" value={form.amount} onChange={set('amount')}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Remark</label>
                  <input type="text" value={form.remark} onChange={set('remark')}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button type="submit" className="btn btn-primary flex-1">
                  {editing ? 'Save Changes' : 'Add Transaction'}
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
