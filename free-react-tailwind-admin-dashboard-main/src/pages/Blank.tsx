import React, { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

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

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// Types
interface Writing {
  id: number;
  title: string;
  description: string;
  document: string | null;
  document_type: string;
  document_type_display: string;
  is_active: boolean;
}

interface FormData {
  title: string;
  description: string;
  document: File | null;
  document_type: string;
  is_active: boolean;
}

interface Filters {
  document_type: string;
  is_active: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface DocumentType {
  value: string;
  label: string;
}

// API Service
const writingsService = {
  async getAll(filters: Partial<Filters> = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      const filterKey = key as keyof Filters;
      if (filters[filterKey]) {
        params.append(key, filters[filterKey]);
      }
    });
    const response = await fetch(`http://127.0.0.1:8000/writings/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch writings');
    const data = await response.json();
    return data.results || data;
  },

  async create(data: FormData) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('document_type', data.document_type);
    formData.append('is_active', data.is_active.toString());
    if (data.document) formData.append('document', data.document);

    const response = await fetch('http://127.0.0.1:8000/writings/', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create writing');
    return response.json();
  },

  async update(id: number, data: Partial<FormData>) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.document_type) formData.append('document_type', data.document_type);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.document) formData.append('document', data.document);

    const response = await fetch(`http://127.0.0.1:8000/writings/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update writing');
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`http://127.0.0.1:8000/writings/${id}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete writing');
  },

  async download(id: number) {
    const response = await fetch(`http://127.0.0.1:8000/writings/${id}/download/`);
    if (!response.ok) throw new Error('Failed to download document');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};

// Success Messages
const SUCCESS_MESSAGES = {
  create: "Writing created successfully!",
  update: "Writing updated successfully!",
  delete: "Writing deleted successfully!",
  download: "Download started successfully!",
  activate: "Writing activated successfully!",
  deactivate: "Writing deactivated successfully!"
};

// Error Messages
const ERROR_MESSAGES = {
  create: "Failed to create writing.",
  update: "Failed to update writing.",
  delete: "Failed to delete writing.",
  fetch: "Failed to load writings.",
  download: "Failed to download document."
};

// Center Notification Component
const CenterNotification: React.FC<{ 
  type: 'success' | 'error'; 
  text: string; 
  onClose: () => void 
}> = ({ type, text, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className={`relative max-w-md w-full mx-4 ${
      type === 'success' ? 'bg-green-100 border-green-200' : 'bg-red-50 border-red-200'
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
            type === 'success'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

export default function WritingsManagement() {
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWriting, setEditingWriting] = useState<Writing | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [writingToDelete, setWritingToDelete] = useState<Writing | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<Message>({ type: 'success', text: '' });
  const [filters, setFilters] = useState<Filters>({ document_type: '', is_active: '' });

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    document: null,
    document_type: 'spiritual',
    is_active: true
  });

  const documentTypes: DocumentType[] = [
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'education', label: 'Education' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'economy', label: 'Economy' }
  ];

  // Load writings with useCallback to fix useEffect dependency
  const loadWritings = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: Partial<Filters> = {};
      if (filters.document_type) filterParams.document_type = filters.document_type;
      if (filters.is_active) filterParams.is_active = filters.is_active;
      const data = await writingsService.getAll(filterParams);
      setWritings(data);
    } catch {
      showNotification('error', ERROR_MESSAGES.fetch);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadWritings();
  }, [loadWritings]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setShowMessage(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingWriting) {
        await writingsService.update(editingWriting.id, formData);
        showNotification('success', SUCCESS_MESSAGES.update);
      } else {
        await writingsService.create(formData);
        showNotification('success', SUCCESS_MESSAGES.create);
      }
      setShowForm(false);
      setEditingWriting(null);
      resetForm();
      loadWritings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (editingWriting ? ERROR_MESSAGES.update : ERROR_MESSAGES.create);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      document: null,
      document_type: 'spiritual',
      is_active: true
    });
  };

  const handleEdit = (writing: Writing) => {
    setFormData({
      title: writing.title,
      description: writing.description || '',
      document: null,
      document_type: writing.document_type,
      is_active: writing.is_active
    });
    setEditingWriting(writing);
    setShowForm(true);
  };

  const handleDeleteClick = (writing: Writing) => {
    setWritingToDelete(writing);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!writingToDelete) return;
    setLoading(true);
    try {
      await writingsService.delete(writingToDelete.id);
      showNotification('success', SUCCESS_MESSAGES.delete);
      setShowDeleteConfirm(false);
      setWritingToDelete(null);
      loadWritings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.delete;
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await writingsService.download(id);
      showNotification('success', SUCCESS_MESSAGES.download);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.download;
      showNotification('error', errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, document: file }));
  };

  const handleNewWriting = () => {
    resetForm();
    setEditingWriting(null);
    setShowForm(true);
  };

  const handleStatusToggle = async (writing: Writing) => {
    setLoading(true);
    try {
      await writingsService.update(writing.id, { is_active: !writing.is_active });
      showNotification('success', writing.is_active ? SUCCESS_MESSAGES.deactivate : SUCCESS_MESSAGES.activate);
      loadWritings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.update;
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      spiritual: 'bg-purple-100 text-purple-800 border-purple-200',
      education: 'bg-blue-100 text-blue-800 border-blue-200',
      philosophy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      economy: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div>
      <PageMeta
        title="Writings Management | Admin Dashboard"
        description="Manage spiritual, educational, philosophical, and economic writings and documents"
      />
      <PageBreadcrumb pageTitle="Writings Management" />
      
      <div className="min-h-screen border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        {showMessage && (
          <CenterNotification
            type={message.type}
            text={message.text}
            onClose={() => setShowMessage(false)}
          />
        )}

        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 border-l-4 border-indigo-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Writings Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage and organize writings</p>
              </div>
              <button
                onClick={handleNewWriting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center gap-1"
              >
                <PlusIcon />
                Add New Writing
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2">
              <FilterIcon />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Filter Writings</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                <select
                  value={filters.document_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.is_active}
                  onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : writings.length === 0 ? (
            <div className="text-center p-8">
              <DocumentIcon />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No writings found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Get started by creating your first writing</p>
              <button
                onClick={handleNewWriting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm"
              >
                Create Writing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase border-r border-indigo-400">Title & Description</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase border-r border-indigo-400">Document Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase border-r border-indigo-400">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {writings.map((writing, index) => (
                    <tr 
                      key={writing.id} 
                      className={`transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 ${
                        index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{writing.title}</div>
                          {writing.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {writing.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs border-r border-gray-200 dark:border-gray-700">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${getDocumentTypeColor(writing.document_type)}`}>
                          {writing.document_type_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleStatusToggle(writing)}
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium cursor-pointer ${
                            writing.is_active 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                          }`}
                        >
                          {writing.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center gap-1">
                          {writing.document && (
                            <button
                              onClick={() => handleDownload(writing.id)}
                              className="inline-flex items-center px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white"
                              title="Download Document"
                            >
                              <DownloadIcon />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(writing)}
                            className="inline-flex items-center px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                            title="Edit Writing"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(writing)}
                            className="inline-flex items-center px-2 py-1 bg-red-500 hover:bg-red-600 text-white"
                            title="Delete Writing"
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

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[70vh] overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingWriting ? 'Edit Writing' : 'Create New Writing'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-white hover:text-gray-200">
                    <CloseIcon />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter writing title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter writing description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Document Type *
                      </label>
                      <select
                        required
                        value={formData.document_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {documentTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.is_active.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Document {!editingWriting && '*'}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          required={!editingWriting}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <div className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-400 text-center">
                          <DocumentIcon />
                          Choose File
                        </div>
                      </label>
                      {formData.document && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {formData.document.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PDF, Word, Excel files accepted
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingWriting ? 'Update Writing' : 'Create Writing')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteConfirm && writingToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md">
              <div className="px-4 py-3 border-b border-red-200 bg-red-500 text-white">
                <h2 className="text-lg font-semibold">Confirm Delete</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-red-100">
                  <ErrorIcon />
                </div>
                <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Are you sure you want to delete this writing?
                </p>
                <p className="text-center font-semibold text-gray-900 dark:text-white mb-3">
                  "{writingToDelete.title}"
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Writing'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}