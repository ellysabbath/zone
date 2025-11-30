import  { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

// SVG Icons
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

interface Filters {
  document_type: string;
  is_active: string;
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

export default function WritingsManagement() {
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ document_type: '', is_active: '' });

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
      console.error('Failed to load writings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadWritings();
  }, [loadWritings]);

  const handleDownload = async (id: number) => {
    try {
      await writingsService.download(id);
    } catch (error) {
      console.error('Failed to download document:', error);
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
        title="Writings Library | Admin Dashboard"
        description="Browse spiritual, educational, philosophical, and economic writings and documents"
      />
      <PageBreadcrumb pageTitle="Writings Library" />
      
      <div className="min-h-screen border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 border-l-4 border-indigo-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Writings Library</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Browse and download writings</p>
              </div>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">No writings available in the library</p>
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
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                          writing.is_active 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                        }`}>
                          {writing.is_active ? 'Active' : 'Inactive'}
                        </span>
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
    </div>
  );
}