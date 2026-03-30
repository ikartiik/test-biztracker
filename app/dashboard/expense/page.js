'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, BanknotesIcon, CreditCardIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function ExpenseTracker() {
  const { data: session } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('income-expense');
  
  // Balance states
  const [balances, setBalances] = useState({
    cash: 0,
    mashreq: 0,
    hsbc: 0,
    crown: 0,
    sasco: 0,
    other_fz: 0,
    kar_fab: 0,
    kar_liv: 0,
    kar_mashreq: 0,
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
      kar_fab: 0,
      kar_liv: 0,
      kar_mashreq: 0,
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
    return balances.mashreq + balances.hsbc + balances.kar_fab + balances.kar_liv + balances.kar_mashreq;
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

      // Submit the main transaction
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
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

      // Send transfer out transaction
      await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferOut),
      });

      // Send transfer in transaction
      const transferInResponse = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferIn),
      });

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
        // Check if balance adjustment is for an FZ account - add 0.15% handling fee
        const isBalanceAdjustmentToFZ = ['crown', 'sasco', 'other_fz'].includes(balanceData.account);

        if (isBalanceAdjustmentToFZ) {
          const handlingFeeAmount = parseFloat(balanceData.amount) * 0.0015; // 0.15%
          const handlingFeePayload = {
            type: 'expense',
            category: 'FZ CHARGES',
            account: balanceData.account, // Same FZ account
            amount: handlingFeeAmount,
            creditAmount: 0,
            debitAmount: handlingFeeAmount,
            remark: `Handling Fee (0.15%) for FZ balance adjustment`,
            date: balanceData.date,
            srNo: `FEE-${Date.now()}`
          };

          // Submit the handling fee transaction
          await fetch('/api/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(handlingFeePayload),
          });

          toast.success(`Balance adjusted with handling fee (${handlingFeeAmount.toFixed(2)} AED) for FZ account`);
        } else {
          toast.success('Balance adjusted successfully');
        }

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

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts Tracker</h1>
            <p className="mt-2 text-gray-600">Manage your financial transactions and balances</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Transaction
          </button>
        </div>

        {/* Balance Overview Cards */}
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
              </div>
            </div>
          </div>
          
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
              </div>
            </div>
          </div>
          
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
          </div>
        </div>

        {/* Transaction History */}
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
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('income-expense')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'income-expense'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Income/Expense
                  </button>
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'transfer'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => setActiveTab('balance')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'balance'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            type: e.target.value,
                            category: e.target.value === 'income' ? 'CASH IN' : 'LOCAL PURCHASE'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>

                      <div>
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
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="0.00"
                          required
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
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
                      <input
                        type="text"
                        value={formData.remark}
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        placeholder="e.g., Office lunch, Invoice payment"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                        <select
                          value={transferData.fromAccount}
                          onChange={(e) => setTransferData({ ...transferData, fromAccount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {accountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={transferData.date}
                          onChange={(e) => setTransferData({ ...transferData, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={transferData.amount}
                          onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                          placeholder="0.00"
                          required
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
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
                        ))}
                      </select>
                      {['crown', 'sasco', 'other_fz'].includes(balanceData.account) && (
                        <p className="mt-1 text-xs text-blue-600">
                          Note: A 0.15% handling fee will be automatically added as a separate expense entry
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={balanceData.date}
                          onChange={(e) => setBalanceData({ ...balanceData, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add (AED)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={balanceData.amount}
                          onChange={(e) => setBalanceData({ ...balanceData, amount: e.target.value })}
                          placeholder="0.00"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {['crown', 'sasco', 'other_fz'].includes(balanceData.account) && balanceData.amount && (
                          <p className="mt-1 text-xs text-amber-600">
                            + {(parseFloat(balanceData.amount) * 0.0015).toFixed(2)} AED handling fee (0.15%) will be added as a separate entry
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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