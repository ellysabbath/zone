import { useState, useEffect } from 'react';

interface Ministry {
  id: number;
  ministry_name: string;
  services: string;
  performance: string;
  created_at: string;
  updated_at: string;
}

interface MinistryInfo {
  id: number;
  ministry_name: string;
  services: string;
  performance: string;
  ministry_members: string;
  ministry_assets: string;
  ministry_orders: string;
  costs_per_ministry: string;
  pdf_report: string;
  download_url?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type DeleteTarget = Ministry | MinistryInfo | null;
type DeleteType = 'ministry' | 'ministryInfo';

const Ministries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [ministryInfos, setMinistryInfos] = useState<MinistryInfo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedMinistryInfo, setSelectedMinistryInfo] = useState<MinistryInfo | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [editingMinistryInfo, setEditingMinistryInfo] = useState<MinistryInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleteType, setDeleteType] = useState<DeleteType>('ministry');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [ministryForm, setMinistryForm] = useState({
    ministry_name: '',
    services: '',
    performance: ''
  });

  const [ministryInfoForm, setMinistryInfoForm] = useState({
    ministry_name: '',
    services: '',
    performance: '',
    ministry_members: '',
    ministry_assets: '',
    ministry_orders: '',
    costs_per_ministry: '0.00',
    pdf_report: null as File | null
  });

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchMinistries();
    fetchMinistryInfos();
  }, []);

  const fetchMinistries = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ministries/`);
      const data: ApiResponse<Ministry> = await response.json();
      setMinistries(data.results);
    } catch (error) {
      console.error('Error fetching ministries:', error);
    }
  };

  const fetchMinistryInfos = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ministry-infos/`);
      const data: ApiResponse<MinistryInfo> = await response.json();
      setMinistryInfos(data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ministry information:', error);
      setLoading(false);
    }
  };

  const handleCreateMinistry = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ministries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ministryForm)
      });
      if (response.ok) {
        const newMinistry: Ministry = await response.json();
        setMinistries(prev => [...prev, newMinistry]);
        resetForms();
        setOpenDialog(false);
        showSuccess('Ministry created successfully!');
      }
    } catch (error) {
      console.error('Error creating ministry:', error);
    }
  };

  const handleUpdateMinistry = async () => {
    if (!editingMinistry) return;
    try {
      const response = await fetch(`${API_BASE}/api/ministries/${editingMinistry.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ministryForm)
      });
      if (response.ok) {
        const updatedMinistry: Ministry = await response.json();
        setMinistries(prev => prev.map(m => m.id === updatedMinistry.id ? updatedMinistry : m));
        resetForms();
        setOpenDialog(false);
        showSuccess('Ministry updated successfully!');
      }
    } catch (error) {
      console.error('Error updating ministry:', error);
    }
  };

  const handleDeleteMinistry = async () => {
    if (!deleteTarget || deleteType !== 'ministry') return;
    try {
      const response = await fetch(`${API_BASE}/api/ministries/${deleteTarget.id}/`, { method: 'DELETE' });
      if (response.ok) {
        setMinistries(prev => prev.filter(m => m.id !== deleteTarget.id));
        setOpenDeleteDialog(false);
        showSuccess('Ministry deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting ministry:', error);
    }
  };

  const handleCreateMinistryInfo = async () => {
    try {
      const formData = new FormData();
      Object.keys(ministryInfoForm).forEach(key => {
        if (key === 'pdf_report' && ministryInfoForm[key]) {
          formData.append(key, ministryInfoForm[key] as File);
        } else {
          formData.append(key, ministryInfoForm[key as keyof typeof ministryInfoForm] as string);
        }
      });
      const response = await fetch(`${API_BASE}/api/ministry-infos/`, { method: 'POST', body: formData });
      if (response.ok) {
        const newMinistryInfo: MinistryInfo = await response.json();
        setMinistryInfos(prev => [...prev, newMinistryInfo]);
        resetForms();
        setOpenInfoDialog(false);
        showSuccess('Ministry information created successfully!');
      }
    } catch (error) {
      console.error('Error creating ministry information:', error);
    }
  };

  const handleUpdateMinistryInfo = async () => {
    if (!editingMinistryInfo) return;
    try {
      const formData = new FormData();
      Object.keys(ministryInfoForm).forEach(key => {
        if (key === 'pdf_report' && ministryInfoForm[key]) {
          formData.append(key, ministryInfoForm[key] as File);
        } else {
          formData.append(key, ministryInfoForm[key as keyof typeof ministryInfoForm] as string);
        }
      });
      const response = await fetch(`${API_BASE}/api/ministry-infos/${editingMinistryInfo.id}/`, { method: 'PUT', body: formData });
      if (response.ok) {
        const updatedMinistryInfo: MinistryInfo = await response.json();
        setMinistryInfos(prev => prev.map(m => m.id === updatedMinistryInfo.id ? updatedMinistryInfo : m));
        resetForms();
        setOpenInfoDialog(false);
        showSuccess('Ministry information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating ministry information:', error);
    }
  };

  const handleDeleteMinistryInfo = async () => {
    if (!deleteTarget || deleteType !== 'ministryInfo') return;
    try {
      const response = await fetch(`${API_BASE}/api/ministry-infos/${deleteTarget.id}/`, { method: 'DELETE' });
      if (response.ok) {
        setMinistryInfos(prev => prev.filter(m => m.id !== deleteTarget.id));
        setOpenDeleteDialog(false);
        showSuccess('Ministry information deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting ministry information:', error);
    }
  };

  const handleCreateInfoFromMinistry = (ministry: Ministry) => {
    setMinistryInfoForm({
      ministry_name: ministry.ministry_name,
      services: ministry.services,
      performance: ministry.performance || '',
      ministry_members: '',
      ministry_assets: '',
      ministry_orders: '',
      costs_per_ministry: '0.00',
      pdf_report: null
    });
    setEditingMinistryInfo(null);
    setOpenInfoDialog(true);
  };

  const handleViewMinistryInfo = (info: MinistryInfo) => {
    setSelectedMinistryInfo(info);
    setOpenInfoModal(true);
  };

  const handleDownloadReport = async (ministryInfo: MinistryInfo) => {
    try {
      if (ministryInfo.download_url) {
        window.open(ministryInfo.download_url, '_blank');
      } else if (ministryInfo.pdf_report) {
        const response = await fetch(`${API_BASE}/api/ministry-infos/${ministryInfo.id}/download_report/`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ministry_report_${ministryInfo.ministry_name}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showSuccess('Report downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const resetForms = () => {
    setMinistryForm({ ministry_name: '', services: '', performance: '' });
    setMinistryInfoForm({
      ministry_name: '', services: '', performance: '', ministry_members: '',
      ministry_assets: '', ministry_orders: '', costs_per_ministry: '0.00', pdf_report: null
    });
    setEditingMinistry(null);
    setEditingMinistryInfo(null);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setOpenSuccessDialog(true);
  };

  const openCreateMinistry = () => {
    resetForms();
    setEditingMinistry(null);
    setOpenDialog(true);
  };

  const openEditMinistry = (ministry: Ministry) => {
    setMinistryForm({
      ministry_name: ministry.ministry_name,
      services: ministry.services,
      performance: ministry.performance || ''
    });
    setEditingMinistry(ministry);
    setOpenDialog(true);
  };

  const openEditMinistryInfo = (ministryInfo: MinistryInfo) => {
    setMinistryInfoForm({
      ministry_name: ministryInfo.ministry_name,
      services: ministryInfo.services,
      performance: ministryInfo.performance || '',
      ministry_members: ministryInfo.ministry_members || '',
      ministry_assets: ministryInfo.ministry_assets || '',
      ministry_orders: ministryInfo.ministry_orders || '',
      costs_per_ministry: ministryInfo.costs_per_ministry || '0.00',
      pdf_report: null
    });
    setEditingMinistryInfo(ministryInfo);
    setOpenInfoDialog(true);
  };

  const confirmDelete = (target: DeleteTarget, type: DeleteType) => {
    setDeleteTarget(target);
    setDeleteType(type);
    setOpenDeleteDialog(true);
  };

  const handleDelete = () => {
    if (deleteType === 'ministry') {
      handleDeleteMinistry();
    } else {
      handleDeleteMinistryInfo();
    }
  };

  const filteredMinistryInfos = filter === 'all' 
    ? ministryInfos 
    : ministryInfos.filter(info => info.ministry_name === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Success Dialog */}
      {openSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Success!</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{successMessage}</p>
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 transition duration-200"
              onClick={() => setOpenSuccessDialog(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-md w-full">
            <div className="bg-red-100 dark:bg-red-900 px-6 py-4 border-b border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 text-center">Confirm Deletion</h3>
            </div>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Delete {deleteType === 'ministry' ? deleteTarget?.ministry_name : `${deleteTarget?.ministry_name} - Info`}?
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">This action cannot be undone.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium"
                onClick={() => setOpenDeleteDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium transition duration-200"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ministry Info View Modal */}
      {openInfoModal && selectedMinistryInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-4xl w-full max-h-[75vh] overflow-y-auto">
            <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Ministry Information</h3>
              <button 
                className="text-white hover:text-indigo-200 text-2xl"
                onClick={() => setOpenInfoModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Basic Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Ministry Name</label>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedMinistryInfo.ministry_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Services</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.services}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Performance</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.performance || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financial</h4>
                    <div className="bg-blue-50 dark:bg-blue-900 p-4">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Costs</label>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {parseFloat(selectedMinistryInfo.costs_per_ministry).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Team & Resources</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Members</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.ministry_members || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Assets</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.ministry_assets || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Orders</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.ministry_orders || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  {selectedMinistryInfo.pdf_report && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Documents</h4>
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 transition duration-200 flex items-center justify-center space-x-2"
                        onClick={() => handleDownloadReport(selectedMinistryInfo)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium"
                onClick={() => setOpenInfoModal(false)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
                onClick={() => {
                  setOpenInfoModal(false);
                  openEditMinistryInfo(selectedMinistryInfo);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ministry Dialog */}
      {openDialog && (
        <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto">
            <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingMinistry ? 'Edit Ministry' : 'Create Ministry'}
              </h3>
              <button 
                className="text-white hover:text-blue-200 text-2xl"
                onClick={() => setOpenDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ministry Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={ministryForm.ministry_name}
                  onChange={(e) => setMinistryForm({ ...ministryForm, ministry_name: e.target.value })}
                  placeholder="Enter ministry name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Services *</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  value={ministryForm.services}
                  onChange={(e) => setMinistryForm({ ...ministryForm, services: e.target.value })}
                  placeholder="Describe services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  value={ministryForm.performance}
                  onChange={(e) => setMinistryForm({ ...ministryForm, performance: e.target.value })}
                  placeholder="Describe performance"
                />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200"
                onClick={editingMinistry ? handleUpdateMinistry : handleCreateMinistry}
              >
                {editingMinistry ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ministry Info Dialog */}
      {openInfoDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-4xl w-full max-h-[70vh] overflow-y-auto">
            <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingMinistryInfo ? 'Edit Ministry Info' : 'Create Ministry Info'}
              </h3>
              <button 
                className="text-white hover:text-indigo-200 text-2xl"
                onClick={() => setOpenInfoDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ministry Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={ministryInfoForm.ministry_name}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, ministry_name: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Services *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={ministryInfoForm.services}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, services: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={ministryInfoForm.performance}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, performance: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Members</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={ministryInfoForm.ministry_members}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, ministry_members: e.target.value })}
                    placeholder="List members"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assets</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={ministryInfoForm.ministry_assets}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, ministry_assets: e.target.value })}
                    placeholder="List assets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Orders</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={ministryInfoForm.ministry_orders}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, ministry_orders: e.target.value })}
                    placeholder="List orders"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Costs</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={ministryInfoForm.costs_per_ministry}
                    onChange={(e) => setMinistryInfoForm({ ...ministryInfoForm, costs_per_ministry: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PDF Report</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setMinistryInfoForm({ 
                      ...ministryInfoForm, 
                      pdf_report: e.target.files ? e.target.files[0] : null
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium"
                onClick={() => setOpenInfoDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
                onClick={editingMinistryInfo ? handleUpdateMinistryInfo : handleCreateMinistryInfo}
              >
                {editingMinistryInfo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Ministry Management System</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage ministries and their information</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Ministries</h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">{ministries.length}</div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200"
            onClick={openCreateMinistry}
          >
            Add New Ministry
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Ministry Info</h3>
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{ministryInfos.length}</div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 transition duration-200"
            onClick={() => { setEditingMinistryInfo(null); setOpenInfoDialog(true); }}
          >
            Add Ministry Info
          </button>
        </div>
      </div>

      {/* Ministries Table */}
      <div className="bg-white dark:bg-gray-800 shadow mb-8">
        <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Ministries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {ministries.map((ministry) => (
                <tr key={ministry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{ministry.ministry_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 dark:text-gray-300 max-w-md truncate">{ministry.services}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                      ministry.performance ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {ministry.performance ? 'Available' : 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        onClick={() => openEditMinistry(ministry)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                        onClick={() => handleCreateInfoFromMinistry(ministry)}
                      >
                        Create Info
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        onClick={() => confirmDelete(ministry, 'ministry')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ministry Infos Section */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <h2 className="text-xl font-bold">Ministry Information</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white text-gray-800 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="all">All</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.ministry_name}>
                  {ministry.ministry_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Costs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMinistryInfos.map((info) => (
                <tr key={info.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{info.ministry_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {info.ministry_members || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                      parseFloat(info.costs_per_ministry) > 10000 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {parseFloat(info.costs_per_ministry).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {info.pdf_report ? (
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm font-medium transition duration-200"
                        onClick={() => handleDownloadReport(info)}
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No Report</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        onClick={() => handleViewMinistryInfo(info)}
                      >
                        View
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                        onClick={() => openEditMinistryInfo(info)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        onClick={() => confirmDelete(info, 'ministryInfo')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ministries;