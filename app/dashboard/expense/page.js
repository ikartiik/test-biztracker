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
  BanknotesIcon, 
  CreditCardIcon, 
  BuildingOfficeIcon,
  ArrowSwapHorizontalIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function ExpenseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('income-expense');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Balance states
  const [balances, setBalances] = useState({
    cash: 0,
    mashreq: 0,
    hsbc: 0,
    crown: 0,
    sasco: 0,
    other_fz: 0,
  });

  const [formData, setFormData] = useState({
    type: 'income',
    category: 'CASH IN',
    account: 'mashreq',
    amount: '',
    remark: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Transfer form data
  const [transferData, setTransferData] = useState({
    fromAccount: 'mashreq',
    toAccount: 'crown',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Balance adjustment data
  const [balanceData, setBalanceData] = useState({
    account: 'mashreq',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const incomeCategories = ['CASH IN', 'LOCAL SALE', 'FZ SALE'];
  const expenseCategories = [
    'LOCAL PURCHASE',
    'DUTIES AND CHARGES',
    'FZ CHARGES',
    'SHIPPING CHARGES',
    'DEWA + WIFI',
    'MONTHLY ALLOCATION',
    'MISCELLANEOUS',
    'PAYMENT TO FZ',
    'INVOICE PAYMENT'
  ];

  const accountOptions = [
    { value: 'mashreq', label: 'Mashreq Bank', type: 'bank' },
    { value: 'hsbc', label: 'HSBC Bank', type: 'bank' },
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
      const response = await fetch('/api/expense');
      const data = await response.json();
      setExpenses(data);
      calculateBalances(data);
    } catch (error) {
      toast.error('Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (transactions) => {
    const newBalances = {
      mashreq: 0,
      hsbc: 0,
      crown: 0,
      sasco: 0,
      other_fz: 0,
      cash: 0
    };

    transactions.forEach(transaction => {
      const account = transaction.account || 'cash';
      if (transaction.type === 'income' || transaction.creditAmount > 0) {
        newBalances[account] += transaction.amount || transaction.creditAmount || 0;
      } else if (transaction.type === 'expense' || transaction.debitAmount > 0) {
        newBalances[account] -= transaction.amount || transaction.debitAmount || 0;
      }
    });

    setBalances(newBalances);
  };

  const getTotalBalance = () => {
    return Object.values(balances).reduce((total, balance) => total + balance, 0);
  };

  const getBankTotal = () => {
    return balances.mashreq + balances.hsbc;
  };

  const getFZTotal = () => {
    return balances.crown + balances.sasco + balances.other_fz;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        category: formData.category,
        account: formData.account,
        amount: parseFloat(formData.amount),
        creditAmount: formData.type === 'income' ? parseFloat(formData.amount) : 0,
        debitAmount: formData.type === 'expense' ? parseFloat(formData.amount) : 0,
        remark: formData.remark,
        date: formData.date,
        srNo: `TXN-${Date.now()}`
      };

      const url = editingItem ? `/api/expense?id=${editingItem._id}` : '/api/expense';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingItem ? 'Transaction updated successfully' : 'Transaction added successfully');
        fetchExpenses();
        closeModal();
      } else {
        toast.error('Error saving transaction');
      }
    } catch (error) {
      toast.error('Error saving transaction');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(transferData.amount);
      
      // Create transfer out transaction
      const transferOut = {
        type: 'expense',
        category: 'TRANSFER OUT',
        account: transferData.fromAccount,
        amount: amount,
        debitAmount: amount,
        creditAmount: 0,
        remark: `Transfer to ${accountOptions.find(acc => acc.value === transferData.toAccount)?.label}`,
        date: transferData.date,
        srNo: `TXN-OUT-${Date.now()}`
      };

      // Create transfer in transaction
      const transferIn = {
        type: 'income',
        category: 'TRANSFER IN',
        account: transferData.toAccount,
        amount: amount,
        creditAmount: amount,
        debitAmount: 0,
        remark: `Transfer from ${accountOptions.find(acc => acc.value === transferData.fromAccount)?.label}`,
        date: transferData.date,
        srNo: `TXN-IN-${Date.now()}`
      };

      // Send both transactions
      await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferOut),
      });

      await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferIn),
      });

      toast.success('Transfer completed successfully');
      fetchExpenses();
      closeModal();
    } catch (error) {
      toast.error('Error processing transfer');
    }
  };

  const handleBalanceAdjustment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: 'income',
        category: 'BALANCE ADJUSTMENT',
        account: balanceData.account,
        amount: parseFloat(balanceData.amount),
        creditAmount: parseFloat(balanceData.amount),
        debitAmount: 0,
        remark: 'Balance adjustment/Initial balance',
        date: balanceData.date,
        srNo: `BAL-${Date.now()}`
      };

      const response = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Balance adjusted successfully');
        fetchExpenses();
        closeModal();
      } else {
        toast.error('Error adjusting balance');
      }
    } catch (error) {
      toast.error('Error adjusting balance');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      category: item.category,
      account: item.account || 'cash',
      amount: item.amount?.toString() || item.creditAmount?.toString() || item.debitAmount?.toString() || '',
      remark: item.remark || '',
      date: item.date?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setActiveTab('income-expense');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`/api/expense?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Transaction deleted successfully');
          fetchExpenses();
        } else {
          toast.error('Error deleting transaction');
        }
      } catch (error) {
        toast.error('Error deleting transaction');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setActiveTab('income-expense');
    setFormData({
      type: 'income',
      category: 'CASH IN',
      account: 'mashreq',
      amount: '',
      remark: '',
      date: new Date().toISOString().split('T')[0]
    });
    setTransferData({
      fromAccount: 'mashreq',
      toAccount: 'crown',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setBalanceData({
      account: 'mashreq',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchQuery === '' || 
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.remark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.account?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <CurrencyDollarIcon className="w-8 h-8 text-rose-600" />
              Expense Tracker
            </h1>
            <p className="mt-1 text-slate-600">Manage your financial transactions and balances</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary bg-rose-600 hover:bg-rose-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Balance</p>
                <p className="text-2xl sm:text-3xl font-bold">AED {getTotalBalance().toLocaleString()}</p>
              </div>
              <BanknotesIcon className="w-10 h-10 text-green-200" />
            </div>
            <div className="mt-3 pt-3 border-t border-green-400/30">
              <p className="text-xs text-green-200">All Accounts Combined</p>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500 font-medium">Bank Accounts</p>
                <p className="text-xl font-bold text-slate-900">AED {getBankTotal().toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mashreq:</span>
                <span className="font-medium text-slate-900">AED {balances.mashreq.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HSBC:</span>
                <span className="font-medium text-slate-900">AED {balances.hsbc.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500 font-medium">FZ Accounts</p>
                <p className="text-xl font-bold text-slate-900">AED {getFZTotal().toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Crown:</span>
                <span className="font-medium text-slate-900">AED {balances.crown.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SASCO:</span>
                <span className="font-medium text-slate-900">AED {balances.sasco.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="card p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Cash</p>
                <p className="text-2xl font-bold">AED {balances.cash.toLocaleString()}</p>
              </div>
              <BanknotesIcon className="w-8 h-8 text-orange-200" />
            </div>
            <div className="mt-3 pt-3 border-t border-orange-400/30">
              <p className="text-xs text-orange-200">Physical Cash Available</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by category, remark, or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Transaction History */}
        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-500 mt-2">Loading...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <CurrencyDollarIcon className="w-16 h-16 mx-auto text-slate-300" />
              <p className="text-lg font-medium text-slate-500 mt-4">No transactions found</p>
              <p className="text-sm text-slate-400">Add your first transaction to get started</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Remark</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50">
                    <td className="text-slate-900">
                      {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        expense.type === 'income' || expense.creditAmount > 0
                          ? 'badge-success' 
                          : expense.category?.includes('TRANSFER')
                          ? 'badge-info'
                          : 'badge-danger'
                      }`}>
                        {expense.type?.charAt(0).toUpperCase() + expense.type?.slice(1) || 'Transaction'}
                      </span>
                    </td>
                    <td className="text-slate-900">{expense.category || expense.sourceExpense}</td>
                    <td className="text-slate-600">
                      {accountOptions.find(acc => acc.value === expense.account)?.label || 'Cash'}
                    </td>
                    <td className="font-medium">
                      <span className={
                        expense.type === 'income' || expense.creditAmount > 0
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }>
                        AED {(expense.amount || expense.creditAmount || expense.debitAmount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="text-slate-600 max-w-xs truncate">
                      {expense.remark || expense.comment || '-'}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
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
        {!loading && filteredExpenses.length > 0 && (
          <p className="text-sm text-slate-500 text-right">
            Showing {filteredExpenses.length} of {expenses.length} transactions
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingItem ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="border-b border-slate-200">
                <nav className="flex space-x-6 px-6">
                  <button
                    onClick={() => setActiveTab('income-expense')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'income-expense'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Income/Expense
                  </button>
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'transfer'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => setActiveTab('balance')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'balance'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Adjust Balance
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Income/Expense Tab */}
                {activeTab === 'income-expense' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            type: e.target.value,
                            category: e.target.value === 'income' ? 'CASH IN' : 'LOCAL PURCHASE'
                          })}
                          className="input"
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                        <select
                          value={formData.account}
                          onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                          className="input"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input"
                      >
                        {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (AED)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="0.00"
                          required
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Remark (Optional)</label>
                      <input
                        type="text"
                        value={formData.remark}
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        placeholder="e.g., Office lunch, Invoice payment"
                        className="input"
                      />
                    </div>

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
                        className="btn bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        {editingItem ? 'Update' : 'Add'} Transaction
                      </button>
                    </div>
                  </form>
                )}

                {/* Transfer Tab */}
                {activeTab === 'transfer' && (
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">From Account</label>
                        <select
                          value={transferData.fromAccount}
                          onChange={(e) => setTransferData({ ...transferData, fromAccount: e.target.value })}
                          className="input"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">To Account</label>
                        <select
                          value={transferData.toAccount}
                          onChange={(e) => setTransferData({ ...transferData, toAccount: e.target.value })}
                          className="input"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={transferData.date}
                          onChange={(e) => setTransferData({ ...transferData, date: e.target.value })}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (AED)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={transferData.amount}
                          onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                          placeholder="0.00"
                          required
                          className="input"
                        />
                      </div>
                    </div>

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
                        className="btn bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        Make Transfer
                      </button>
                    </div>
                  </form>
                )}

                {/* Balance Adjustment Tab */}
                {activeTab === 'balance' && (
                  <form onSubmit={handleBalanceAdjustment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                      <select
                        value={balanceData.account}
                        onChange={(e) => setBalanceData({ ...balanceData, account: e.target.value })}
                        className="input"
                      >
                        {accountOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={balanceData.date}
                          onChange={(e) => setBalanceData({ ...balanceData, date: e.target.value })}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Add (AED)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={balanceData.amount}
                          onChange={(e) => setBalanceData({ ...balanceData, amount: e.target.value })}
                          placeholder="0.00"
                          required
                          className="input"
                        />
                      </div>
                    </div>

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
                        className="btn bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        Adjust Balance
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

