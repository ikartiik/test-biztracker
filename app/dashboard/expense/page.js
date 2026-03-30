'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
<<<<<<< HEAD
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
=======
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, BanknotesIcon, CreditCardIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
>>>>>>> blackboxai/login-mongodb-fix

export default function ExpenseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('income-expense');
<<<<<<< HEAD
  const [searchQuery, setSearchQuery] = useState('');
=======
>>>>>>> blackboxai/login-mongodb-fix
  
  // Balance states
  const [balances, setBalances] = useState({
    cash: 0,
    mashreq: 0,
    hsbc: 0,
    crown: 0,
    sasco: 0,
    other_fz: 0,
<<<<<<< HEAD
=======
    kar_fab: 0,
    kar_liv: 0,
    kar_mashreq: 0,
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
    'INVOICE PAYMENT'
  ];

  const accountOptions = [
    { value: 'mashreq', label: 'Mashreq Bank', type: 'bank' },
    { value: 'hsbc', label: 'HSBC Bank', type: 'bank' },
=======
    'INVOICE PAYMENT',
  ];

  // Function to get expense categories based on selected account
  const getExpenseCategoriesForAccount = (account) => {
    const isFZAccount = ['crown', 'sasco', 'other_fz'].includes(account);
    if (isFZAccount) {
      // Add FZ INVOICE PAYMENT for FZ accounts
      return [...expenseCategories, 'FZ INVOICE PAYMENT'];
    }
    return expenseCategories;
  };

  const accountOptions = [
    { value: 'mashreq', label: 'Mashreq Bank', type: 'bank' },
    { value: 'hsbc', label: 'HSBC Bank', type: 'bank' },
    { value: 'kar_fab', label: 'Kar FAB', type: 'bank' },
    { value: 'kar_liv', label: 'Kar Liv', type: 'bank' },
    { value: 'kar_mashreq', label: 'Kar Mashreq', type: 'bank' },
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
=======
      kar_fab: 0,
      kar_liv: 0,
      kar_mashreq: 0,
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
    return balances.mashreq + balances.hsbc;
=======
    return balances.mashreq + balances.hsbc + balances.kar_fab + balances.kar_liv + balances.kar_mashreq;
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
      
=======

      // Submit the main transaction
>>>>>>> blackboxai/login-mongodb-fix
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
<<<<<<< HEAD
        toast.success(editingItem ? 'Transaction updated successfully' : 'Transaction added successfully');
=======
        // Check account type and transaction details
        const isFZAccount = ['crown', 'sasco', 'other_fz'].includes(formData.account);
        const isFZInvoicePayment = formData.category === 'FZ INVOICE PAYMENT';
        const isExpense = formData.type === 'expense';
        const isIncome = formData.type === 'income';
        const isNewTransaction = !editingItem;

        if (isNewTransaction && isExpense && isFZAccount && isFZInvoicePayment) {
          // Create automatic TT charges entry of 110 AED
          const ttChargesPayload = {
            type: 'expense',
            category: 'TT CHARGES',
            account: formData.account, // Same FZ account
            amount: 110,
            creditAmount: 0,
            debitAmount: 110,
            remark: `TT Charges for FZ Invoice Payment${formData.remark ? ' - ' + formData.remark : ''}`,
            date: formData.date,
            srNo: `TT-${Date.now()}`
          };

          // Submit the TT charges transaction
          await fetch('/api/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ttChargesPayload),
          });

          toast.success('FZ Invoice Payment and TT charges (110 AED) added as separate entries');
        } else if (isNewTransaction && isIncome && isFZAccount) {
          // Create automatic handling fee entry of 0.15% for FZ income deposits
          const handlingFeeAmount = parseFloat(formData.amount) * 0.0015; // 0.15%
          const handlingFeePayload = {
            type: 'expense',
            category: 'FZ CHARGES',
            account: formData.account, // Same FZ account
            amount: handlingFeeAmount,
            creditAmount: 0,
            debitAmount: handlingFeeAmount,
            remark: `Handling Fee (0.15%) for FZ deposit${formData.remark ? ' - ' + formData.remark : ''}`,
            date: formData.date,
            srNo: `FEE-${Date.now()}`
          };

          // Submit the handling fee transaction
          await fetch('/api/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handlingFeePayload),
          });

          toast.success(`FZ deposit and handling fee (${handlingFeeAmount.toFixed(2)} AED) added as separate entries`);
        } else {
          toast.success(editingItem ? 'Transaction updated successfully' : 'Transaction added successfully');
        }

>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
      
=======

>>>>>>> blackboxai/login-mongodb-fix
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

<<<<<<< HEAD
      // Send both transactions
=======
      // Send transfer out transaction
>>>>>>> blackboxai/login-mongodb-fix
      await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferOut),
      });

<<<<<<< HEAD
      await fetch('/api/expense', {
=======
      // Send transfer in transaction
      const transferInResponse = await fetch('/api/expense', {
>>>>>>> blackboxai/login-mongodb-fix
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferIn),
      });

<<<<<<< HEAD
      toast.success('Transfer completed successfully');
=======
      // Check if transferring TO an FZ account - add 0.15% handling fee
      const isTransferToFZ = ['crown', 'sasco', 'other_fz'].includes(transferData.toAccount);

      if (isTransferToFZ) {
        const handlingFeeAmount = amount * 0.0015; // 0.15%
        const handlingFeePayload = {
          type: 'expense',
          category: 'FZ CHARGES',
          account: transferData.toAccount, // FZ account receiving the transfer
          amount: handlingFeeAmount,
          creditAmount: 0,
          debitAmount: handlingFeeAmount,
          remark: `Handling Fee (0.15%) for transfer to FZ account`,
          date: transferData.date,
          srNo: `FEE-${Date.now()}`
        };

        // Submit the handling fee transaction
        await fetch('/api/expense', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(handlingFeePayload),
        });

        toast.success(`Transfer completed with handling fee (${handlingFeeAmount.toFixed(2)} AED) for FZ account`);
      } else {
        toast.success('Transfer completed successfully');
      }

>>>>>>> blackboxai/login-mongodb-fix
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

<<<<<<< HEAD
  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchQuery === '' || 
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.remark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.account?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

=======
>>>>>>> blackboxai/login-mongodb-fix
  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
<<<<<<< HEAD
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
=======
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts Tracker</h1>
            <p className="mt-2 text-gray-600">Manage your financial transactions and balances</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
>>>>>>> blackboxai/login-mongodb-fix
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        </div>

        {/* Balance Overview Cards */}
<<<<<<< HEAD
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
=======
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-green-100 text-sm font-medium mb-2">Total Balance</p>
                <p className="text-4xl font-bold">AED {getTotalBalance().toLocaleString()}</p>
                <div className="mt-3 pt-3 border-t border-green-400/30">
                  <p className="text-xs text-green-200">All Accounts Combined</p>
                </div>
              </div>
              <BanknotesIcon className="w-12 h-12 text-green-200 ml-4" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-blue-100 text-sm font-medium">Bank Accounts</p>
                <p className="text-2xl font-bold">AED {getBankTotal().toLocaleString()}</p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-blue-200" />
            </div>
            <div className="bg-blue-600/30 rounded-md p-3 mt-3">
              <div className="space-y-2 text-xs text-blue-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Mashreq Bank:</span>
                  <span className="font-bold">AED {balances.mashreq.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">HSBC Bank:</span>
                  <span className="font-bold">AED {balances.hsbc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Kar FAB:</span>
                  <span className="font-bold">AED {balances.kar_fab.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Kar Liv:</span>
                  <span className="font-bold">AED {balances.kar_liv.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Kar Mashreq:</span>
                  <span className="font-bold">AED {balances.kar_mashreq.toLocaleString()}</span>
                </div>
>>>>>>> blackboxai/login-mongodb-fix
              </div>
            </div>
          </div>
          
<<<<<<< HEAD
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
=======
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-purple-100 text-sm font-medium">FZ Accounts</p>
                <p className="text-2xl font-bold">AED {getFZTotal().toLocaleString()}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-purple-200" />
            </div>
            <div className="bg-purple-600/30 rounded-md p-3 mt-3">
              <div className="space-y-2 text-xs text-purple-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Crown FZ:</span>
                  <span className="font-bold">AED {balances.crown.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">SASCO FZ:</span>
                  <span className="font-bold">AED {balances.sasco.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Other FZ:</span>
                  <span className="font-bold">AED {balances.other_fz.toLocaleString()}</span>
                </div>
>>>>>>> blackboxai/login-mongodb-fix
              </div>
            </div>
          </div>
          
<<<<<<< HEAD
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
=======
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-orange-100 text-sm font-medium mb-2">Cash</p>
                <p className="text-3xl font-bold">AED {balances.cash.toLocaleString()}</p>
                <div className="mt-3 pt-3 border-t border-orange-400/30">
                  <p className="text-xs text-orange-200">Physical Cash Available</p>
                </div>
              </div>
              <BanknotesIcon className="w-10 h-10 text-orange-200 ml-4" />
            </div>
>>>>>>> blackboxai/login-mongodb-fix
          </div>
        </div>

        {/* Transaction History */}
<<<<<<< HEAD
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
=======
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          expense.type === 'income' || expense.creditAmount > 0
                            ? 'bg-green-100 text-green-800' 
                            : expense.category?.includes('TRANSFER')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.type?.charAt(0).toUpperCase() + expense.type?.slice(1) || 'Transaction'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.category || expense.sourceExpense}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {accountOptions.find(acc => acc.value === expense.account)?.label || 'Cash'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={
                          expense.type === 'income' || expense.creditAmount > 0
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }>
                          AED {(expense.amount || expense.creditAmount || expense.debitAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {expense.remark || expense.comment || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expenses.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No transactions found. Add your first transaction to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal - matching your application's modal style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
>>>>>>> blackboxai/login-mongodb-fix
                </button>
              </div>
              
              {/* Tab Navigation */}
<<<<<<< HEAD
              <div className="border-b border-slate-200">
                <nav className="flex space-x-6 px-6">
                  <button
                    onClick={() => setActiveTab('income-expense')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'income-expense'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
=======
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('income-expense')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'income-expense'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
>>>>>>> blackboxai/login-mongodb-fix
                    }`}
                  >
                    Income/Expense
                  </button>
                  <button
                    onClick={() => setActiveTab('transfer')}
<<<<<<< HEAD
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'transfer'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
=======
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'transfer'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
>>>>>>> blackboxai/login-mongodb-fix
                    }`}
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => setActiveTab('balance')}
<<<<<<< HEAD
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'balance'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
=======
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'balance'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            type: e.target.value,
                            category: e.target.value === 'income' ? 'CASH IN' : 'LOCAL PURCHASE'
                          })}
<<<<<<< HEAD
                          className="input"
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
>>>>>>> blackboxai/login-mongodb-fix
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>

                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                        <select
                          value={formData.account}
                          onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                          className="input"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                        <select
                          value={formData.account}
                          onChange={(e) => {
                            const newAccount = e.target.value;
                            const isFZAccount = ['crown', 'sasco', 'other_fz'].includes(newAccount);

                            // Reset category if FZ INVOICE PAYMENT was selected but new account is not FZ
                            const newCategory = (!isFZAccount && formData.category === 'FZ INVOICE PAYMENT')
                              ? 'LOCAL PURCHASE'
                              : formData.category;

                            setFormData({ ...formData, account: newAccount, category: newCategory });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
>>>>>>> blackboxai/login-mongodb-fix
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
<<<<<<< HEAD
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
=======
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {(formData.type === 'income'
                          ? incomeCategories
                          : getExpenseCategoriesForAccount(formData.account)
                        ).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {formData.category === 'FZ INVOICE PAYMENT' && formData.type === 'expense' && (
                        <p className="mt-1 text-xs text-blue-600">
                          Note: A separate 110 AED TT charges entry will be automatically added
                        </p>
                      )}
                      {formData.type === 'income' && ['crown', 'sasco', 'other_fz'].includes(formData.account) && (
                        <p className="mt-1 text-xs text-blue-600">
                          Note: A 0.15% handling fee will be automatically added as a separate expense entry
                        </p>
                      )}
>>>>>>> blackboxai/login-mongodb-fix
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
<<<<<<< HEAD
                          className="input"
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
>>>>>>> blackboxai/login-mongodb-fix
                        />
                      </div>

                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (AED)</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED)</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="0.00"
                          required
<<<<<<< HEAD
                          className="input"
                        />
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {formData.category === 'FZ INVOICE PAYMENT' && formData.type === 'expense' && formData.amount && (
                          <p className="mt-1 text-xs text-amber-600">
                            + 110 AED TT charges will be added as a separate entry
                          </p>
                        )}
                        {formData.type === 'income' && ['crown', 'sasco', 'other_fz'].includes(formData.account) && formData.amount && (
                          <p className="mt-1 text-xs text-amber-600">
                            + {(parseFloat(formData.amount) * 0.0015).toFixed(2)} AED handling fee (0.15%) will be added as a separate entry
                          </p>
                        )}
>>>>>>> blackboxai/login-mongodb-fix
                      </div>
                    </div>

                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-slate-700 mb-1">Remark (Optional)</label>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
>>>>>>> blackboxai/login-mongodb-fix
                      <input
                        type="text"
                        value={formData.remark}
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        placeholder="e.g., Office lunch, Invoice payment"
<<<<<<< HEAD
                        className="input"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
=======
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
>>>>>>> blackboxai/login-mongodb-fix
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
<<<<<<< HEAD
                        className="btn bg-rose-600 hover:bg-rose-700 text-white"
=======
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">From Account</label>
                        <select
                          value={transferData.fromAccount}
                          onChange={(e) => setTransferData({ ...transferData, fromAccount: e.target.value })}
                          className="input"
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                        <select
                          value={transferData.fromAccount}
                          onChange={(e) => setTransferData({ ...transferData, fromAccount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
>>>>>>> blackboxai/login-mongodb-fix
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
<<<<<<< HEAD
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
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                        <select
                          value={transferData.toAccount}
                          onChange={(e) => setTransferData({ ...transferData, toAccount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {['crown', 'sasco', 'other_fz'].includes(transferData.toAccount) && (
                          <p className="mt-1 text-xs text-blue-600">
                            Note: A 0.15% handling fee will be automatically added as a separate expense entry
                          </p>
                        )}
>>>>>>> blackboxai/login-mongodb-fix
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <input
                          type="date"
                          value={transferData.date}
                          onChange={(e) => setTransferData({ ...transferData, date: e.target.value })}
<<<<<<< HEAD
                          className="input"
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
>>>>>>> blackboxai/login-mongodb-fix
                        />
                      </div>

                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (AED)</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED)</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={transferData.amount}
                          onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                          placeholder="0.00"
                          required
<<<<<<< HEAD
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {['crown', 'sasco', 'other_fz'].includes(transferData.toAccount) && transferData.amount && (
                          <p className="mt-1 text-xs text-amber-600">
                            + {(parseFloat(transferData.amount) * 0.0015).toFixed(2)} AED handling fee (0.15%) will be added as a separate entry
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
>>>>>>> blackboxai/login-mongodb-fix
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
<<<<<<< HEAD
                        className="btn bg-rose-600 hover:bg-rose-700 text-white"
=======
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
>>>>>>> blackboxai/login-mongodb-fix
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
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                      <select
                        value={balanceData.account}
                        onChange={(e) => setBalanceData({ ...balanceData, account: e.target.value })}
                        className="input"
                      >
                        {accountOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                      <select
                        value={balanceData.account}
                        onChange={(e) => setBalanceData({ ...balanceData, account: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {accountOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
>>>>>>> blackboxai/login-mongodb-fix
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <input
                          type="date"
                          value={balanceData.date}
                          onChange={(e) => setBalanceData({ ...balanceData, date: e.target.value })}
<<<<<<< HEAD
                          className="input"
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
>>>>>>> blackboxai/login-mongodb-fix
                        />
                      </div>

                      <div>
<<<<<<< HEAD
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Add (AED)</label>
=======
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add (AED)</label>
>>>>>>> blackboxai/login-mongodb-fix
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={balanceData.amount}
                          onChange={(e) => setBalanceData({ ...balanceData, amount: e.target.value })}
                          placeholder="0.00"
                          required
<<<<<<< HEAD
                          className="input"
=======
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
>>>>>>> blackboxai/login-mongodb-fix
                        />
                      </div>
                    </div>

<<<<<<< HEAD
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
=======
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
>>>>>>> blackboxai/login-mongodb-fix
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
<<<<<<< HEAD
                        className="btn bg-rose-600 hover:bg-rose-700 text-white"
=======
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
>>>>>>> blackboxai/login-mongodb-fix
                      >
                        Adjust Balance
                      </button>
                    </div>
                  </form>
                )}
<<<<<<< HEAD
=======

>>>>>>> blackboxai/login-mongodb-fix
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
<<<<<<< HEAD
}

=======
}
>>>>>>> blackboxai/login-mongodb-fix
