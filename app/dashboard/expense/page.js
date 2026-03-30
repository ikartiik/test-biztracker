'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function ExpenseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [balances, setBalances] = useState({
    mashreq: 0,
    hsbc: 0,
    kar_fab: 0,
    kar_liv: 0,
    kar_mashreq: 0,
    crown: 0,
    sasco: 0,
    other_fz: 0,
    cash: 0
  });
  const [formData, setFormData] = useState({
    srNo: '',
    type: 'expense',
    category: '',
    account: 'cash',
    amount: '',
    remark: ''
  });

  const categories = [
    'SALARY',
    'OFFICE RENT',
    'UTILITIES',
    'TRANSPORT',
    'BANK FEES',
    'MISCELLANEOUS',
    'PAYMENT TO FZ',
    'INVOICE PAYMENT'
  ];

  const accountOptions = [
    { value: 'mashreq', label: 'Mashreq Bank', type: 'bank' },
    { value: 'hsbc', label: 'HSBC Bank', type: 'bank' },
    { value: 'kar_fab', label: 'Kar FAB', type: 'bank' },
    { value: 'kar_liv', label: 'Kar Liv', type: 'bank' },
    { value: 'kar_mashreq', label: 'Kar Mashreq', type: 'bank' },
    { value: 'crown', label: 'Crown FZ', type: 'fz' },
    { value: 'sasco', label: 'SASCO FZ', type: 'fz' },
    { value: 'other_fz', label: 'Other FZ', type: 'fz' },
    { value: 'cash', label: 'Cash', type: 'cash' }
  ];

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchExpenses();
  }, [session, router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expense');
      const data = await response.json();
      setExpenses(data);
      calculateBalances(data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (expenseData) => {
    const newBalances = {
      mashreq: 0,
      hsbc: 0,
      kar_fab: 0,
      kar_liv: 0,
      kar_mashreq: 0,
      crown: 0,
      sasco: 0,
      other_fz: 0,
      cash: 0
    };

    expenseData.forEach(expense => {
      const account = expense.account || 'cash';
      newBalances[account] = (newBalances[account] || 0) + (expense.balance || 0);
    });

    setBalances(newBalances);
  };

  const getBankTotal = () => {
    return balances.mashreq + balances.hsbc + balances.kar_fab + balances.kar_liv + balances.kar_mashreq;
  };

  const getFZTotal = () => {
    return balances.crown + balances.sasco + balances.other_fz;
  };

  const getCashTotal = () => {
    return balances.cash;
  };

  const getGrandTotal = () => {
    return Object.values(balances).reduce((sum, balance) => sum + balance, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/expense?id=${editingItem._id}` : '/api/expense';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success(editingItem ? 'Transaction updated' : 'Transaction added');
        fetchExpenses();
        setIsModalOpen(false);
        setFormData({ srNo: '', type: 'expense', category: '', account: 'cash', amount: '', remark: '' });
        setEditingItem(null);
      } else {
        toast.error('Failed to save transaction');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        const response = await fetch(`/api/expense?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Deleted');
          fetchExpenses();
        }
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.srNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.remark?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expense Tracker</h1>
            <p className="text-muted-foreground mt-2">Track income, expenses and maintain running balances across accounts</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Grand Total</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">
              AED {getGrandTotal().toLocaleString()}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Bank Accounts</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">
              AED {getBankTotal().toLocaleString()}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">FZ Accounts</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">
              AED {getFZTotal().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Recent Transactions</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full tracker-table">
              <thead>
                <tr>
                  <th>SR No</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.slice(0, 50).map((expense) => (
                  <tr key={expense._id} className="hover:bg-muted/50 transition-colors">
                    <td className="font-mono text-sm">{expense.srNo}</td>
                    <td>
                      <span className={`badge ${expense.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {expense.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="font-medium">{expense.category}</td>
                    <td className="text-sm">{expense.account}</td>
                    <td className="font-mono text-red-600">-{expense.debitAmount?.toLocaleString()}</td>
                    <td className="font-mono text-green-600">+{expense.creditAmount?.toLocaleString()}</td>
                    <td className="font-mono font-semibold">
                      AED {expense.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(expense);
                            setFormData({
                              srNo: expense.srNo,
                              type: expense.type,
                              category: expense.category,
                              account: expense.account,
                              amount: expense.amount || '',
                              remark: expense.remark || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
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
        </div>

        {/* Add/Edit Transaction Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingItem ? 'Edit Transaction' : 'Add New Transaction'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingItem(null);
                      setFormData({ srNo: '', type: 'expense', category: '', account: 'cash', amount: '', remark: '' });
                    }}
                    className="p-2 rounded-xl hover:bg-accent transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">SR No</label>
                    <input
                      type="text"
                      value={formData.srNo}
                      onChange={(e) => setFormData({ ...formData, srNo: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Account</label>
                    <select
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {accountOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Remark</label>
                    <input
                      type="text"
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    {editingItem ? 'Update' : 'Add'} Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingItem(null);
                      setFormData({ srNo: '', type: 'expense', category: '', account: 'cash', amount: '', remark: '' });
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 mt-8">
          <div className="bg-muted/50 p-6 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground mb-2">Showing {filteredExpenses.length} of {expenses.length} transactions</p>
            <p className="text-2xl font-bold text-foreground">
              Current Cash Balance: AED {balances.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
