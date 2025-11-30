import React, { useState, useEffect, useCallback } from 'react';

// SVG Icons
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// Types
interface FinancialRecord {
  id: number;
  date: string;
  source?: number;
  source_name?: string;
  amount_received: number;
  expense_reason?: string;
  expense_category?: number;
  category_name?: string;
  amount_used: number;
  notes?: string;
  transaction_type: 'Revenue' | 'Expense';
}

interface RevenueSource {
  id: number;
  name: string;
  description: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
}

interface DashboardData {
  current_year: {
    revenue: number;
    expenses: number;
    net_income: number;
  };
  current_month: {
    revenue: number;
    expenses: number;
    net_income: number;
  };
  recent_transactions: FinancialRecord[];
}

interface Filters {
  year: number;
  month: string;
  transaction_type: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

// API Service
const financialService = {
  baseUrl: 'http://127.0.0.1:8000',

  async getFinancialRecords(filters: Filters) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      const filterKey = key as keyof Filters;
      if (filters[filterKey]) {
        params.append(key, filters[filterKey].toString());
      }
    });
    const response = await fetch(`${this.baseUrl}/financial-records/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch financial records');
    const data = await response.json();
    return data.results || data;
  },

  async getRevenueSources() {
    const response = await fetch(`${this.baseUrl}/revenue-sources/`);
    if (!response.ok) throw new Error('Failed to fetch revenue sources');
    const data = await response.json();
    return data.results || data;
  },

  async getExpenseCategories() {
    const response = await fetch(`${this.baseUrl}/expense-categories/`);
    if (!response.ok) throw new Error('Failed to fetch expense categories');
    const data = await response.json();
    return data.results || data;
  },

  async generatePDFReport(reportType: string, year: number, month?: string) {
    const params = new URLSearchParams({ type: reportType, year: year.toString() });
    if (month) params.append('month', month);
    
    const response = await fetch(`${this.baseUrl}/financial-records/generate_pdf/?${params}`);
    if (!response.ok) throw new Error('Failed to generate PDF report');
    return response.blob();
  },

  async getDashboardData() {
    const response = await fetch(`${this.baseUrl}/dashboard/`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  }
};

// Success Messages
const SUCCESS_MESSAGES = {
  downloadReport: "Report downloaded successfully!"
};

// Error Messages
const ERROR_MESSAGES = {
  fetchData: "Failed to load data.",
  downloadReport: "Failed to download report."
};

// Center Notification Component
const CenterNotification: React.FC<{ type: 'success' | 'error'; text: string; onClose: () => void }> = ({ type, text, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className={`relative max-w-md w-full mx-4 ${
      type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    } border-2 p-4`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${type === 'success' ? 'text-green-900' : 'text-red-400'}`}>
          {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {type === 'success' ? 'Success!' : 'Error!'}
          </h3>
          <p className={`mt-1 text-sm ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {text}
          </p>
        </div>
        <button onClick={onClose} className="ml-4 text-current hover:opacity-70">
          <CloseIcon />
        </button>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onClose}
          className={`px-3 py-1 text-sm font-medium ${
            type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard: React.FC<{ title: string; value: number; type: 'revenue' | 'expense' | 'net' }> = ({ title, value, type }) => {
  const getColor = () => {
    switch (type) {
      case 'revenue': return 'text-green-600 dark:text-green-400';
      case 'expense': return 'text-red-600 dark:text-red-400';
      case 'net': return value >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    }).format(amount || 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className={`text-xl font-semibold mt-1 ${getColor()}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
};

const Treasurer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'sources' | 'categories' | 'reports'>('dashboard');
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [revenueSources, setRevenueSources] = useState<RevenueSource[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Notification state
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<Message>({ type: 'success', text: '' });
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    year: new Date().getFullYear(),
    month: '',
    transaction_type: ''
  });

  // Load initial data with useCallback to avoid useEffect dependency issues
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [records, sources, categories, dashboard] = await Promise.all([
        financialService.getFinancialRecords(filters),
        financialService.getRevenueSources(),
        financialService.getExpenseCategories(),
        financialService.getDashboardData()
      ]);
      
      setFinancialRecords(records);
      setRevenueSources(sources);
      setExpenseCategories(categories);
      setDashboardData(dashboard);
    } catch  {
      showNotification('error', ERROR_MESSAGES.fetchData);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setShowMessage(true);
  };

  // Report Handler
  const handleDownloadReport = async (reportType: string) => {
    setLoading(true);
    try {
      const blob = await financialService.generatePDFReport(reportType, filters.year, filters.month);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial_report_${filters.year}${filters.month ? `_${filters.month}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('success', SUCCESS_MESSAGES.downloadReport);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : ERROR_MESSAGES.downloadReport);
    } finally {
      setLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Notifications */}
      {showMessage && (
        <CenterNotification
          type={message.type}
          text={message.text}
          onClose={() => setShowMessage(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Financial Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">View revenue and expenses</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadReport('yearly')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 flex items-center gap-1 text-sm"
            >
              <DownloadIcon />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['dashboard', 'records', 'sources', 'categories', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Revenue"
                value={dashboardData?.current_year?.revenue || 0}
                type="revenue"
              />
              <StatCard
                title="Total Expenses"
                value={dashboardData?.current_year?.expenses || 0}
                type="expense"
              />
              <StatCard
                title="Net Income"
                value={dashboardData?.current_year?.net_income || 0}
                type="net"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Current Month</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(dashboardData?.current_month?.revenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expenses:</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(dashboardData?.current_month?.expenses || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Net:</span>
                    <span className={`text-sm font-medium ${
                      (dashboardData?.current_month?.net_income || 0) >= 0 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {formatCurrency(dashboardData?.current_month?.net_income || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Recent Transactions</h3>
                <div className="space-y-2">
                  {financialRecords.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {transaction.transaction_type === 'Revenue' ? transaction.source_name : transaction.expense_reason}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        transaction.transaction_type === 'Revenue' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(transaction.amount_received || transaction.amount_used)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="p-4 space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-2">
                  <FilterIcon />
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Filter Records</h3>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 60 }, (_, i) => {
                        const year = 2001 + i;
                        return (
                          <option key={year} value={year}>{year}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                    <select
                      value={filters.month}
                      onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">All Months</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={filters.transaction_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">All Types</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : financialRecords.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">No financial records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {financialRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                              record.transaction_type === 'Revenue' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {record.transaction_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                            {record.transaction_type === 'Revenue' ? record.source_name : record.expense_reason}
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${
                            record.transaction_type === 'Revenue' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(record.amount_received || record.amount_used)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Revenue Sources</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {revenueSources.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">No revenue sources found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {revenueSources.map(source => (
                        <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{source.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{source.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Expense Categories</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {expenseCategories.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">No expense categories found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {expenseCategories.map(category => (
                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{category.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{category.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quick Reports</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDownloadReport('yearly')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <DownloadIcon />
                    Download Yearly Report
                  </button>
                  <button
                    onClick={() => handleDownloadReport('monthly')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <DownloadIcon />
                    Download Monthly Report
                  </button>
                  <button
                    onClick={() => handleDownloadReport('quarterly')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <DownloadIcon />
                    Download Quarterly Report
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Report Options</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 60 }, (_, i) => {
                        const year = 2001 + i;
                        return (
                          <option key={year} value={year}>{year}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                    <select
                      value={filters.month}
                      onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">All Months</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Treasurer;