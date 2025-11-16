import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Wallet,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import type { User } from "../data/users";
import { PageWrapper } from "./PageWrapper";

// ... (interfaces remain the same)

interface PaymentTransaction {
  id: string;
  appointment_id?: string;
  patient_id: string;
  amount: number;
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'installment';
  status: 'completed' | 'pending' | 'refunded';
  transaction_date: string;
  notes?: string;
  created_at: string;
  // Joined data
  patient_name?: string;
  service_name?: string;
  appointment_number?: string;
}

interface Expense {
  id: string;
  category: 'supplies' | 'equipment' | 'utilities' | 'rent' | 'miscellaneous';
  description: string;
  amount: number;
  vendor?: string;
  expense_date: string;
  receipt_number?: string;
  created_at: string;
  updated_at: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    netIncome: number;
  }>;
  expensesByCategory: Array<{
    name: string;
    value: number;
  }>;
}


interface ProductionFinancialPageProps {
  currentUser: User;
}

export function ProductionFinancialPage({ currentUser }: ProductionFinancialPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'expenses'>('overview');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyData: [],
    expensesByCategory: []
  });
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [loading, setLoading] = useState(false);

  // New transaction form
  const [newTransaction, setNewTransaction] = useState({
    patient_id: '',
    amount: '',
    payment_method: 'cash' as const,
    status: 'completed' as const,
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  // New expense form
  const [newExpense, setNewExpense] = useState({
    category: 'supplies' as const,
    description: '',
    amount: '',
    vendor: '',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_number: ''
  });

  // Permission checks
  const canManageFinances = ['admin'].includes(currentUser.role);
  const canViewFinances = ['admin', 'receptionist'].includes(currentUser.role);

  if (!canViewFinances) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to view financial data.</p>
        </div>
      </div>
    );
  }

  // Get date range based on selected period
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'last_7_days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'last_3_months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'this_year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  // Fetch payment transactions
  const fetchTransactions = async () => {
    try {
      const dateRange = getDateRange();

      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          patients!inner(full_name),
          appointments(appointment_number, service)
        `)
        .gte('transaction_date', dateRange.start)
        .lte('transaction_date', dateRange.end)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const processedData = (data || []).map(transaction => ({
        ...transaction,
        patient_name: transaction.patients?.full_name,
        service_name: transaction.appointments?.service || 'Direct Payment',
        appointment_number: transaction.appointments?.appointment_number
      }));

      setTransactions(processedData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load payment transactions');
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const dateRange = getDateRange();

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', dateRange.start)
        .lte('expense_date', dateRange.end)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      setExpenses(data || []);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    }
  };

  // Calculate financial summary
  const calculateFinancialSummary = () => {
    const totalIncome = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Calculate monthly data for the last 12 months
    const monthlyData = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate >= monthStart && tDate <= monthEnd && t.status === 'completed';
      });

      const monthExpenses = expenses.filter(e => {
        const eDate = new Date(e.expense_date);
        return eDate >= monthStart && eDate <= monthEnd;
      });

      const monthIncome = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const monthExpenseAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenseAmount,
        netIncome: monthIncome - monthExpenseAmount
      });
    }

    // Calculate expenses by category
    const expensesByCategory = Object.entries(
      expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    setFinancialSummary({
      totalIncome,
      totalExpenses,
      netIncome,
      monthlyData,
      expensesByCategory
    });
  };

  // Add new transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageFinances) {
      toast.error('You do not have permission to add transactions');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .insert([{
          patient_id: newTransaction.patient_id,
          amount: parseFloat(newTransaction.amount),
          payment_method: newTransaction.payment_method,
          status: newTransaction.status,
          notes: newTransaction.notes,
          transaction_date: newTransaction.transaction_date
        }]);

      if (error) throw error;

      toast.success('Payment transaction added successfully');
      setIsTransactionDialogOpen(false);
      setNewTransaction({
        patient_id: '',
        amount: '',
        payment_method: 'cash',
        status: 'completed',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });

      fetchTransactions();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add payment transaction');
    } finally {
      setLoading(false);
    }
  };

  // Add or update expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageFinances) {
      toast.error('You do not have permission to manage expenses');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        vendor: newExpense.vendor,
        expense_date: newExpense.expense_date,
        receipt_number: newExpense.receipt_number
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({
            ...expenseData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
        toast.success('Expense updated successfully');
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        toast.success('Expense added successfully');
      }

      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      setNewExpense({
        category: 'supplies',
        description: '',
        amount: '',
        vendor: '',
        expense_date: new Date().toISOString().split('T')[0],
        receipt_number: ''
      });

      fetchExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!canManageFinances) {
      toast.error('You do not have permission to delete expenses');
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  // Export financial data
  const exportFinancialData = () => {
    const csvContent = [
      ['Type', 'Date', 'Description', 'Amount', 'Category/Method', 'Status'].join(','),
      ...transactions.map(t => [
        'Income',
        t.transaction_date,
        `Payment from ${t.patient_name}`,
        t.amount,
        t.payment_method,
        t.status
      ].join(',')),
      ...expenses.map(e => [
        'Expense',
        e.expense_date,
        e.description,
        `-${e.amount}`,
        e.category,
        'completed'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${selectedPeriod}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Financial report exported successfully');
  };

  // Load data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchExpenses();
  }, [selectedPeriod]);

  // Recalculate summary when data changes
  useEffect(() => {
    calculateFinancialSummary();
  }, [transactions, expenses]);

  const COLORS = {
    Supplies: "#8b5cf6",
    Equipment: "#ec4899",
    Utilities: "#06b6d4",
    Rent: "#f59e0b",
    Miscellaneous: "#10b981"
  };

  const pageActions = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="donezo-select">
        <option value="last_7_days">Last 7 Days</option>
        <option value="last_30_days">Last 30 Days</option>
        <option value="last_3_months">Last 3 Months</option>
        <option value="last_6_months">Last 6 Months</option>
        <option value="this_year">This Year</option>
      </select>

      <button className="donezo-header-button secondary" onClick={exportFinancialData}>
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );

  return (
    <PageWrapper
      title="Financial Management"
      subtitle="Track income, expenses, and financial performance"
      actions={pageActions}
    >
      {/* Summary Cards */}
      <div className="dentists-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Income</span>
            <DollarSign className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value" style={{ color: 'var(--primary-green)' }}>
            ₱{financialSummary.totalIncome.toLocaleString()}
          </div>
          <p className="donezo-stat-meta">
            From {transactions.filter(t => t.status === 'completed').length} transactions
          </p>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Expenses</span>
            <Receipt className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value" style={{ color: 'var(--accent-orange)' }}>
            ₱{financialSummary.totalExpenses.toLocaleString()}
          </div>
          <p className="donezo-stat-meta">
            From {expenses.length} expense records
          </p>
        </div>

        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Net Income</span>
            <Wallet className="donezo-stat-icon" />
          </div>
          <div className={`donezo-stat-value ${financialSummary.netIncome >= 0 ? '' : 'text-red-600'}`}
            style={{ color: financialSummary.netIncome >= 0 ? 'var(--primary-green)' : 'var(--accent-orange)' }}
          >
            ₱{financialSummary.netIncome.toLocaleString()}
          </div>
          <p className="donezo-stat-meta">
            {financialSummary.netIncome >= 0 ? 'Profit' : 'Loss'} for selected period
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {financialSummary.monthlyData.length > 0 && (
        <div className="dentists-stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '32px' }}>
          <div className="donezo-section">
            <div className="donezo-section-header">
              <h3 className="donezo-section-title">Income vs Expenses</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialSummary.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="income" fill="var(--primary-green)" name="Income" />
                <Bar dataKey="expenses" fill="var(--accent-orange)" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {financialSummary.expensesByCategory.length > 0 && (
            <div className="donezo-section">
              <div className="donezo-section-header">
                <h3 className="donezo-section-title">Expenses by Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={financialSummary.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financialSummary.expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Tabs for Transactions and Expenses */}
      <div className="donezo-tabs">
        <div className="flex items-center justify-between">
          <div className="donezo-tabs-list">
            <button className={`donezo-tabs-trigger ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`donezo-tabs-trigger ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Transactions</button>
            <button className={`donezo-tabs-trigger ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses</button>
          </div>

          {canManageFinances && (
            <div className="flex gap-2">
              {activeTab === 'transactions' && (
                <button className="donezo-header-button" onClick={() => setIsTransactionDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </button>
              )}

              {activeTab === 'expenses' && (
                <button className="donezo-header-button" onClick={() => setIsExpenseDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`donezo-tabs-content ${activeTab === 'overview' ? 'active' : ''}`}>
          <div className="donezo-section">
            <div className="donezo-section-header">
              <h3 className="donezo-section-title">Financial Overview</h3>
            </div>
            {financialSummary.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={financialSummary.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="netIncome"
                    stroke="var(--accent-purple)"
                    strokeWidth={3}
                    name="Net Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--primary-green)"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--accent-orange)"
                    strokeWidth={2}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No financial data available for the selected period
              </div>
            )}
          </div>
        </div >

        <div className={`donezo-tabs-content ${activeTab === 'transactions' ? 'active' : ''}`}>
          <div className="donezo-section">
            <div className="donezo-section-header">
              <h3 className="donezo-section-title">Payment Transactions</h3>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payment transactions found for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="donezo-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Service</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="font-medium">
                          {transaction.patient_name}
                        </td>
                        <td>{transaction.service_name}</td>
                        <td className="capitalize">
                          {transaction.payment_method.replace('_', ' ')}
                        </td>
                        <td className="font-medium">
                          ₱{transaction.amount.toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`donezo-dentist-badge ${transaction.status === 'completed' ? 'active' : transaction.status === 'pending' ? 'on-leave' : 'inactive'}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={`donezo-tabs-content ${activeTab === 'expenses' ? 'active' : ''}`}>
          <div className="donezo-section">
            <div className="donezo-section-header">
              <h3 className="donezo-section-title">Expenses</h3>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expenses found for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="donezo-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      {canManageFinances && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="donezo-dentist-badge inactive">
                            {expense.category}
                          </span>
                        </td>
                        <td className="font-medium">{expense.description}</td>
                        <td>{expense.vendor || '—'}</td>
                        <td className="font-medium" style={{ color: 'var(--accent-orange)' }}>
                          ₱{expense.amount.toLocaleString()}
                        </td>
                        {canManageFinances && (
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="donezo-icon-button"
                                onClick={() => {
                                  setEditingExpense(expense);
                                  setNewExpense({
                                    category: expense.category,
                                    description: expense.description,
                                    amount: expense.amount.toString(),
                                    vendor: expense.vendor || '',
                                    expense_date: expense.expense_date,
                                    receipt_number: expense.receipt_number || ''
                                  });
                                  setIsExpenseDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="donezo-icon-button"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isTransactionDialogOpen && (
        <div className="donezo-dialog-overlay" onClick={() => setIsTransactionDialogOpen(false)}>
          <div className="donezo-dialog-content" onClick={e => e.stopPropagation()}>
            <div className="donezo-dialog-header">
              <h3 className="donezo-dialog-title">Add Payment Transaction</h3>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="donezo-form-grid">
                <div className="donezo-form-field">
                  <label htmlFor="amount">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label>Payment Method *</label>
                  <select
                    value={newTransaction.payment_method}
                    onChange={(e: any) => setNewTransaction(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="donezo-select"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="installment">Installment</option>
                  </select>
                </div>
              </div>

              <div className="donezo-form-field">
                <label htmlFor="transaction_date">Transaction Date *</label>
                <input
                  type="date"
                  value={newTransaction.transaction_date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_date: e.target.value }))}
                  required
                  className="donezo-input"
                />
              </div>

              <div className="donezo-form-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="donezo-textarea"
                />
              </div>

              <div className="donezo-dialog-footer">
                <button type="button" className="donezo-header-button secondary" onClick={() => setIsTransactionDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="donezo-header-button">
                  {loading ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseDialogOpen && (
        <div className="donezo-dialog-overlay" onClick={() => setIsExpenseDialogOpen(false)}>
          <div className="donezo-dialog-content" onClick={e => e.stopPropagation()}>
            <div className="donezo-dialog-header">
              <h3 className="donezo-dialog-title">{editingExpense ? 'Edit' : 'Add'} Expense</h3>
            </div>
            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div className="donezo-form-grid">
                <div className="donezo-form-field">
                  <label>Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e: any) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    className="donezo-select"
                  >
                    <option value="supplies">Supplies</option>
                    <option value="equipment">Equipment</option>
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="amount">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    className="donezo-input"
                  />
                </div>
              </div>

              <div className="donezo-form-field">
                <label htmlFor="description">Description *</label>
                <input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="donezo-input"
                />
              </div>

              <div className="donezo-form-grid">
                <div className="donezo-form-field">
                  <label htmlFor="vendor">Vendor</label>
                  <input
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                    className="donezo-input"
                  />
                </div>
                <div className="donezo-form-field">
                  <label htmlFor="receipt_number">Receipt Number</label>
                  <input
                    value={newExpense.receipt_number}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, receipt_number: e.target.value }))}
                    className="donezo-input"
                  />
                </div>
              </div>

              <div className="donezo-form-field">
                <label htmlFor="expense_date">Expense Date *</label>
                <input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                  required
                  className="donezo-input"
                />
              </div>

              <div className="donezo-dialog-footer">
                <button type="button" className="donezo-header-button secondary" onClick={() => {
                  setIsExpenseDialogOpen(false);
                  setEditingExpense(null);
                  setNewExpense({
                    category: 'supplies',
                    description: '',
                    amount: '',
                    vendor: '',
                    expense_date: new Date().toISOString().split('T')[0],
                    receipt_number: ''
                  });
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="donezo-header-button">
                  {loading ? 'Saving...' : editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}