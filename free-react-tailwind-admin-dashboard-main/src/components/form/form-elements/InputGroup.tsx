import { useState, useEffect, useCallback } from 'react';

interface District {
  id: number;
  name: string;
  pastor_name: string;
}

interface DistrictTimetable {
  id: number;
  title: string;
  description?: string;
  document: string;
  district: number;
  district_name: string;
  period: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface DistrictTimetableFormData {
  title: string;
  description: string;
  document: File | null;
  district: number;
  period: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface FilterParams {
  district?: number;
  period?: string;
  is_active?: boolean;
}

interface Filters {
  district: string;
  period: string;
  is_active: string;
}

const districtTimetableService = {
  async getAll(filters?: FilterParams) {
    const params = new URLSearchParams();
    if (filters?.district) params.append('district', filters.district.toString());
    if (filters?.period) params.append('period', filters.period);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const response = await fetch(`http://127.0.0.1:8000/district-timetables/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch timetables');
    const data = await response.json();
    return data.results;
  },

  async create(data: DistrictTimetableFormData) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('district', data.district.toString());
    formData.append('period', data.period);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('is_active', data.is_active.toString());
    if (data.document) formData.append('document', data.document);

    const response = await fetch('http://127.0.0.1:8000/district-timetables/', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create timetable');
    return response.json();
  },

  async update(id: number, data: Partial<DistrictTimetableFormData>) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.district) formData.append('district', data.district.toString());
    if (data.period) formData.append('period', data.period);
    if (data.start_date) formData.append('start_date', data.start_date);
    if (data.end_date) formData.append('end_date', data.end_date);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.document) formData.append('document', data.document);

    const response = await fetch(`http://127.0.0.1:8000/district-timetables/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update timetable');
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`http://127.0.0.1:8000/district-timetables/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete timetable');
  },

  async download(id: number) {
    const response = await fetch(`http://127.0.0.1:8000/district-timetables/${id}/download/`);
    if (!response.ok) throw new Error('Failed to download document');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async getDistricts(): Promise<District[]> {
    const response = await fetch('http://127.0.0.1:8000/districts/');
    if (!response.ok) throw new Error('Failed to fetch districts');
    const data = await response.json();
    return data.results;
  }
};

const CenterNotification = ({ type, text, onClose }: { type: 'success' | 'error'; text: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className={`relative max-w-md w-full mx-4 ${
      type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    } border-2 p-6`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {type === 'success' ? '✓' : '✕'}
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-lg font-semibold ${
            type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {type === 'success' ? 'Success!' : 'Error!'}
          </h3>
          <p className={`mt-1 text-sm ${
            type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {text}
          </p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className={`px-4 py-2 text-sm font-medium ${
            type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

export default function DistrictTimetableManagement() {
  const [timetables, setTimetables] = useState<DistrictTimetable[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTimetable, setEditingTimetable] = useState<DistrictTimetable | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationConfig, setConfirmationConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [filters, setFilters] = useState<Filters>({
    district: '',
    period: '',
    is_active: ''
  });

  const [formData, setFormData] = useState<DistrictTimetableFormData>({
    title: '',
    description: '',
    document: null,
    district: 0,
    period: '',
    start_date: '',
    end_date: '',
    is_active: true
  });

  const loadTimetables = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const filterParams: FilterParams = {};
      if (filters.district) filterParams.district = parseInt(filters.district);
      if (filters.period) filterParams.period = filters.period;
      if (filters.is_active) filterParams.is_active = filters.is_active === 'true';
      
      const data = await districtTimetableService.getAll(filterParams);
      setTimetables(data);
    } catch {
      showNotification('error', 'Failed to load timetables');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDistricts = useCallback(async (): Promise<void> => {
    try {
      const data = await districtTimetableService.getDistricts();
      setDistricts(data);
    } catch {
      showNotification('error', 'Failed to load districts');
    }
  }, []);

  useEffect(() => {
    loadTimetables();
    loadDistricts();
  }, [loadTimetables, loadDistricts]);

  const showNotification = (type: 'success' | 'error', text: string): void => {
    setMessage({ type, text });
    setShowMessage(true);
  };

  const showConfirmationDialog = (config: {
    title: string;
    message: string;
    onConfirm: () => void;
  }): void => {
    setConfirmationConfig(config);
    setShowConfirmation(true);
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    showConfirmationDialog({
      title: editingTimetable ? 'Update Timetable' : 'Create Timetable',
      message: editingTimetable ? 'Update this timetable?' : 'Create new timetable?',
      onConfirm: async () => {
        setLoading(true);
        try {
          if (editingTimetable) {
            await districtTimetableService.update(editingTimetable.id, formData);
            showNotification('success', 'Timetable updated successfully');
          } else {
            await districtTimetableService.create(formData);
            showNotification('success', 'Timetable created successfully');
          }
          
          setShowForm(false);
          setEditingTimetable(null);
          resetForm();
          loadTimetables();
          setShowConfirmation(false);
        } catch (submitError) {
          const errorMessage = submitError instanceof Error ? submitError.message : 'Operation failed';
          showNotification('error', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const resetForm = (): void => {
    setFormData({
      title: '',
      description: '',
      document: null,
      district: 0,
      period: '',
      start_date: '',
      end_date: '',
      is_active: true
    });
  };

  const handleEdit = (timetable: DistrictTimetable): void => {
    setFormData({
      title: timetable.title,
      description: timetable.description || '',
      document: null,
      district: timetable.district,
      period: timetable.period,
      start_date: timetable.start_date,
      end_date: timetable.end_date,
      is_active: timetable.is_active
    });
    setEditingTimetable(timetable);
    setShowForm(true);
  };

  const handleDeleteClick = (timetable: DistrictTimetable): void => {
    showConfirmationDialog({
      title: 'Delete Timetable',
      message: `Delete "${timetable.title}"? This cannot be undone.`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await districtTimetableService.delete(timetable.id);
          showNotification('success', 'Timetable deleted successfully');
          setShowConfirmation(false);
          loadTimetables();
        } catch (deleteError) {
          const errorMessage = deleteError instanceof Error ? deleteError.message : 'Delete failed';
          showNotification('error', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleStatusToggle = (timetable: DistrictTimetable): void => {
    showConfirmationDialog({
      title: timetable.is_active ? 'Deactivate Timetable' : 'Activate Timetable',
      message: timetable.is_active ? 'Deactivate this timetable?' : 'Activate this timetable?',
      onConfirm: async () => {
        setLoading(true);
        try {
          await districtTimetableService.update(timetable.id, { is_active: !timetable.is_active });
          showNotification('success', timetable.is_active ? 'Timetable deactivated' : 'Timetable activated');
          setShowConfirmation(false);
          loadTimetables();
        } catch (statusError) {
          const errorMessage = statusError instanceof Error ? statusError.message : 'Operation failed';
          showNotification('error', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDownload = async (id: number): Promise<void> => {
    try {
      await districtTimetableService.download(id);
      showNotification('success', 'Download started');
    } catch (downloadError) {
      const errorMessage = downloadError instanceof Error ? downloadError.message : 'Download failed';
      showNotification('error', errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, document: file }));
  };

  const handleNewTimetable = (): void => {
    resetForm();
    setEditingTimetable(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">District Timetables</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage district timetable schedules</p>
              </div>
              
              <button
                onClick={handleNewTimetable}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2"
              >
                +
                Add Timetable
              </button>
            </div>
          </div>
        </div>

        {/* Center Notification */}
        {showMessage && (
          <CenterNotification
            type={message.type as 'success' | 'error'}
            text={message.text}
            onClose={() => setShowMessage(false)}
          />
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Timetables</h3>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Periods</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.is_active}
                  onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : timetables.length === 0 ? (
            <div className="text-center p-8">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📅</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No timetables found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first timetable</p>
              <button
                onClick={handleNewTimetable}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              >
                Create Timetable
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">District</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Period</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Date Range</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {timetables.map((timetable, index) => (
                    <tr key={timetable.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white">{timetable.title}</div>
                          {timetable.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {timetable.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {timetable.district_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {timetable.period}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {new Date(timetable.start_date).toLocaleDateString()} - {new Date(timetable.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleStatusToggle(timetable)}
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium cursor-pointer ${
                            timetable.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {timetable.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(timetable.id)}
                            className="inline-flex items-center px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                            title="Download"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleEdit(timetable)}
                            className="inline-flex items-center px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(timetable)}
                            className="inline-flex items-center px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-sm"
                            title="Delete"
                          >
                            🗑️
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

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[75vh] overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingTimetable ? 'Edit Timetable' : 'Create Timetable'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-white hover:text-gray-200">
                    ×
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Timetable title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      District *
                    </label>
                    <select
                      required
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select District</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Period *
                    </label>
                    <select
                      required
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Period</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.is_active.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Document {!editingTimetable && '*'}
                    </label>
                    <input
                      type="file"
                      required={!editingTimetable}
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                    {formData.document && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {formData.document.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingTimetable ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && confirmationConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-red-500 text-white">
                <h2 className="text-lg font-semibold">{confirmationConfig.title}</h2>
              </div>
              
              <div className="p-4">
                <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                  {confirmationConfig.message}
                </p>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmationConfig.onConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}