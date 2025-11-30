import React, { useState, useEffect, useCallback } from 'react';

// SVG Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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

interface FormData {
  date: string;
  source: string;
  source_name: string;
  amount_received: string;
  expense_reason: string;
  expense_category: string;
  category_name: string;
  amount_used: string;
  notes: string;
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

  async createFinancialRecord(data: Partial<FormData>) {
    const response = await fetch(`${this.baseUrl}/financial-records/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create financial record');
    return response.json();
  },

  async updateFinancialRecord(id: number, data: Partial<FormData>) {
    const response = await fetch(`${this.baseUrl}/financial-records/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update financial record');
    return response.json();
  },

  async deleteFinancialRecord(id: number) {
    const response = await fetch(`${this.baseUrl}/financial-records/${id}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete financial record');
  },

  async getRevenueSources() {
    const response = await fetch(`${this.baseUrl}/revenue-sources/`);
    if (!response.ok) throw new Error('Failed to fetch revenue sources');
    const data = await response.json();
    return data.results || data;
  },

  async createRevenueSource(data: { name: string; description: string }) {
    const response = await fetch(`${this.baseUrl}/revenue-sources/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create revenue source');
    return response.json();
  },

  async updateRevenueSource(id: number, data: { name: string; description: string }) {
    const response = await fetch(`${this.baseUrl}/revenue-sources/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update revenue source');
    return response.json();
  },

  async deleteRevenueSource(id: number) {
    const response = await fetch(`${this.baseUrl}/revenue-sources/${id}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete revenue source');
  },

  async getExpenseCategories() {
    const response = await fetch(`${this.baseUrl}/expense-categories/`);
    if (!response.ok) throw new Error('Failed to fetch expense categories');
    const data = await response.json();
    return data.results || data;
  },

  async createExpenseCategory(data: { name: string; description: string }) {
    const response = await fetch(`${this.baseUrl}/expense-categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create expense category');
    return response.json();
  },

  async updateExpenseCategory(id: number, data: { name: string; description: string }) {
    const response = await fetch(`${this.baseUrl}/expense-categories/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update expense category');
    return response.json();
  },

  async deleteExpenseCategory(id: number) {
    const response = await fetch(`${this.baseUrl}/expense-categories/${id}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete expense category');
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
  createRecord: "Financial record created successfully!",
  updateRecord: "Financial record updated successfully!",
  deleteRecord: "Financial record deleted successfully!",
  createSource: "Revenue source created successfully!",
  updateSource: "Revenue source updated successfully!",
  deleteSource: "Revenue source deleted successfully!",
  createCategory: "Expense category created successfully!",
  updateCategory: "Expense category updated successfully!",
  deleteCategory: "Expense category deleted successfully!",
  downloadReport: "Report downloaded successfully!"
};

// Error Messages
const ERROR_MESSAGES = {
  createRecord: "Failed to create financial record.",
  updateRecord: "Failed to update financial record.",
  deleteRecord: "Failed to delete financial record.",
  createSource: "Failed to create revenue source.",
  updateSource: "Failed to update revenue source.",
  deleteSource: "Failed to delete revenue source.",
  createCategory: "Failed to create expense category.",
  updateCategory: "Failed to update expense category.",
  deleteCategory: "Failed to delete expense category.",
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

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  // Editing states
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [editingSource, setEditingSource] = useState<RevenueSource | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSourceDeleteConfirm, setShowSourceDeleteConfirm] = useState(false);
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<FinancialRecord | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<RevenueSource | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null);
  
  // Notification state
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<Message>({ type: 'success', text: '' });
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    year: new Date().getFullYear(),
    month: '',
    transaction_type: ''
  });

  // Form data states
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    source: '',
    source_name: '',
    amount_received: '',
    expense_reason: '',
    expense_category: '',
    category_name: '',
    amount_used: '',
    notes: ''
  });

  const [sourceFormData, setSourceFormData] = useState({ name: '', description: '' });
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });

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

  // Financial Record Handlers
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData: Partial<FormData> = { ...formData };
      
      // Convert amounts to numbers
      if (submitData.amount_received) {
        submitData.amount_received = parseFloat(submitData.amount_received).toString();
      }
      if (submitData.amount_used) {
        submitData.amount_used = parseFloat(submitData.amount_used).toString();
      }
      
      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        const formKey = key as keyof FormData;
        if (submitData[formKey] === '' || submitData[formKey] === null) {
          delete submitData[formKey];
        }
      });

      if (editingRecord) {
        await financialService.updateFinancialRecord(editingRecord.id, submitData);
        showNotification('success', SUCCESS_MESSAGES.updateRecord);
      } else {
        await financialService.createFinancialRecord(submitData);
        showNotification('success', SUCCESS_MESSAGES.createRecord);
      }
      
      setShowForm(false);
      setEditingRecord(null);
      resetForm();
      loadData();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : (editingRecord ? ERROR_MESSAGES.updateRecord : ERROR_MESSAGES.createRecord));
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record: FinancialRecord) => {
    setFormData({
      date: record.date,
      source: record.source?.toString() || '',
      source_name: record.source_name || '',
      amount_received: record.amount_received?.toString() || '',
      expense_reason: record.expense_reason || '',
      expense_category: record.expense_category?.toString() || '',
      category_name: record.category_name || '',
      amount_used: record.amount_used?.toString() || '',
      notes: record.notes || ''
    });
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecordClick = (record: FinancialRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const handleDeleteRecordConfirm = async () => {
    if (!recordToDelete) return;
    setLoading(true);
    try {
      await financialService.deleteFinancialRecord(recordToDelete.id);
      showNotification('success', SUCCESS_MESSAGES.deleteRecord);
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      loadData();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : ERROR_MESSAGES.deleteRecord);
    } finally {
      setLoading(false);
    }
  };

  // Revenue Source Handlers
  const handleSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSource) {
        await financialService.updateRevenueSource(editingSource.id, sourceFormData);
        showNotification('success', SUCCESS_MESSAGES.updateSource);
      } else {
        await financialService.createRevenueSource(sourceFormData);
        showNotification('success', SUCCESS_MESSAGES.createSource);
      }
      setShowSourceForm(false);
      setEditingSource(null);
      setSourceFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : (editingSource ? ERROR_MESSAGES.updateSource : ERROR_MESSAGES.createSource));
    } finally {
      setLoading(false);
    }
  };

  const handleEditSource = (source: RevenueSource) => {
    setSourceFormData({
      name: source.name,
      description: source.description
    });
    setEditingSource(source);
    setShowSourceForm(true);
  };

  const handleDeleteSourceClick = (source: RevenueSource) => {
    setSourceToDelete(source);
    setShowSourceDeleteConfirm(true);
  };

  const handleDeleteSourceConfirm = async () => {
    if (!sourceToDelete) return;
    setLoading(true);
    try {
      await financialService.deleteRevenueSource(sourceToDelete.id);
      showNotification('success', SUCCESS_MESSAGES.deleteSource);
      setShowSourceDeleteConfirm(false);
      setSourceToDelete(null);
      loadData();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : ERROR_MESSAGES.deleteSource);
    } finally {
      setLoading(false);
    }
  };

  // Expense Category Handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await financialService.updateExpenseCategory(editingCategory.id, categoryFormData);
        showNotification('success', SUCCESS_MESSAGES.updateCategory);
      } else {
        await financialService.createExpenseCategory(categoryFormData);
        showNotification('success', SUCCESS_MESSAGES.createCategory);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : (editingCategory ? ERROR_MESSAGES.updateCategory : ERROR_MESSAGES.createCategory));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    setCategoryFormData({
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategoryClick = (category: ExpenseCategory) => {
    setCategoryToDelete(category);
    setShowCategoryDeleteConfirm(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!categoryToDelete) return;
    setLoading(true);
    try {
      await financialService.deleteExpenseCategory(categoryToDelete.id);
      showNotification('success', SUCCESS_MESSAGES.deleteCategory);
      setShowCategoryDeleteConfirm(false);
      setCategoryToDelete(null);
      loadData();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : ERROR_MESSAGES.deleteCategory);
    } finally {
      setLoading(false);
    }
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

  // Form Reset Functions
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: '',
      source_name: '',
      amount_received: '',
      expense_reason: '',
      expense_category: '',
      category_name: '',
      amount_used: '',
      notes: ''
    });
    setEditingRecord(null);
  };

  const resetSourceForm = () => {
    setSourceFormData({ name: '', description: '' });
    setEditingSource(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '' });
    setEditingCategory(null);
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRecordConfirm}
        title="Delete Financial Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmationModal
        isOpen={showSourceDeleteConfirm}
        onClose={() => setShowSourceDeleteConfirm(false)}
        onConfirm={handleDeleteSourceConfirm}
        title="Delete Revenue Source"
        message="Are you sure you want to delete this revenue source? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmationModal
        isOpen={showCategoryDeleteConfirm}
        onClose={() => setShowCategoryDeleteConfirm(false)}
        onConfirm={handleDeleteCategoryConfirm}
        title="Delete Expense Category"
        message="Are you sure you want to delete this expense category? This action cannot be undone."
        confirmText="Delete"
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Financial Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track revenue and expenses</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadReport('yearly')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 flex items-center gap-1 text-sm"
            >
              <DownloadIcon />
              Download Report
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 flex items-center gap-1 text-sm"
            >
              <PlusIcon />
              New Record
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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
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
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditRecord(record)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDeleteRecordClick(record)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
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
              <button
                onClick={() => {
                  resetSourceForm();
                  setShowSourceForm(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 flex items-center gap-1 text-sm"
              >
                <PlusIcon />
                Add Source
              </button>
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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {revenueSources.map(source => (
                        <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{source.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{source.description}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditSource(source)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDeleteSourceClick(source)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
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

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Expense Categories</h3>
              <button
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryForm(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 flex items-center gap-1 text-sm"
              >
                <PlusIcon />
                Add Category
              </button>
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
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {expenseCategories.map(category => (
                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{category.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{category.description}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDeleteCategoryClick(category)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
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

      {/* Financial Record Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingRecord ? 'Edit Financial Record' : 'Add Financial Record'}
                </h2>
                <button onClick={() => {
                  setShowForm(false);
                  resetForm();
                }} className="text-white hover:text-gray-200">
                  <CloseIcon />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Revenue Section */}
                <div className="border border-gray-200 dark:border-gray-700 p-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Revenue Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Revenue Source
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Source</option>
                        {revenueSources.map(source => (
                          <option key={source.id} value={source.id.toString()}>{source.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Or Add New Source
                      </label>
                      <input
                        type="text"
                        value={formData.source_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, source_name: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter new source name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount Received
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount_received}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount_received: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Expense Section */}
                <div className="border border-gray-200 dark:border-gray-700 p-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Expense Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expense Reason
                      </label>
                      <input
                        type="text"
                        value={formData.expense_reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, expense_reason: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter expense reason"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expense Category
                      </label>
                      <select
                        value={formData.expense_category}
                        onChange={(e) => setFormData(prev => ({ ...prev, expense_category: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Category</option>
                        {expenseCategories.map(category => (
                          <option key={category.id} value={category.id.toString()}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Or Add New Category
                      </label>
                      <input
                        type="text"
                        value={formData.category_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter new category name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount Used
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount_used}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount_used: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Create Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revenue Source Form Modal */}
      {showSourceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingSource ? 'Edit Revenue Source' : 'Add Revenue Source'}
                </h2>
                <button onClick={() => {
                  setShowSourceForm(false);
                  resetSourceForm();
                }} className="text-white hover:text-gray-200">
                  <CloseIcon />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSourceSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={sourceFormData.name}
                    onChange={(e) => setSourceFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter source name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={sourceFormData.description}
                    onChange={(e) => setSourceFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter source description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSourceForm(false);
                    resetSourceForm();
                  }}
                  className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingSource ? 'Update Source' : 'Create Source')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingCategory ? 'Edit Expense Category' : 'Add Expense Category'}
                </h2>
                <button onClick={() => {
                  setShowCategoryForm(false);
                  resetCategoryForm();
                }} className="text-white hover:text-gray-200">
                  <CloseIcon />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter category description"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    resetCategoryForm();
                  }}
                  className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Treasurer;