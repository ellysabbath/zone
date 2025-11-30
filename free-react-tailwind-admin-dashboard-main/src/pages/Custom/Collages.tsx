import React, { useState, useEffect, useCallback } from 'react';

// Define types
interface District {
  id: number;
  name: string;
  district_name?: string;
}

interface Collage {
  id: number;
  collage_name: string;
  total_members: number;
  district: number | District;
}

interface FormData {
  collage_name: string;
  total_members: number;
  district: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
  title: string;
}

type ActionType = 'create' | 'update' | 'delete' | null;

// Action types for confirmation
const ACTION_TYPES = {
  CREATE: 'create' as const,
  UPDATE: 'update' as const,
  DELETE: 'delete' as const
};

const Collages = () => {
  const [collages, setCollages] = useState<Collage[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ActionType>(null);
  const [confirmData, setConfirmData] = useState<FormData | Collage | null>(null);
  const [editingCollage, setEditingCollage] = useState<Collage | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    collage_name: '',
    total_members: 0,
    district: ''
  });
  const [notification, setNotification] = useState<Notification>({
    type: 'success',
    message: '',
    title: ''
  });

  const API_BASE_URL = 'http://localhost:8000';

  // Show notification
  const showNotificationMessage = useCallback((type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      type,
      title,
      message
    });
    setShowNotification(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }, []);

  // Fetch all collages
  const fetchCollages = useCallback(async (districtId: string = '') => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/collages/`;
      if (districtId) {
        url = `${API_BASE_URL}/collages/by_district?district_id=${districtId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch collages');
      const data = await response.json();
      
      setCollages(data.results || data);
    } catch (error) {
      console.error('Error fetching collages:', error);
      showNotificationMessage('error', 'Error', 'Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, showNotificationMessage]);

  // Fetch all districts
  const fetchDistricts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/districts/`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      
      setDistricts(data.results || data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      showNotificationMessage('error', 'Error', 'Failed to fetch districts');
    }
  }, [API_BASE_URL, showNotificationMessage]);

  useEffect(() => {
    fetchCollages();
    fetchDistricts();
  }, [fetchCollages, fetchDistricts]);

  const handleCreateClick = () => {
    setEditingCollage(null);
    setFormData({
      collage_name: '',
      total_members: 0,
      district: ''
    });
    setShowForm(true);
  };

  const handleEditClick = (collage: Collage) => {
    setEditingCollage(collage);
    setFormData({
      collage_name: collage.collage_name,
      total_members: collage.total_members,
      district: typeof collage.district === 'object' ? collage.district.id.toString() : collage.district.toString()
    });
    setShowForm(true);
  };

  const handleDeleteClick = (collage: Collage) => {
    setConfirmAction(ACTION_TYPES.DELETE);
    setConfirmData(collage);
    setShowConfirm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollage) {
      setConfirmAction(ACTION_TYPES.UPDATE);
      setConfirmData(formData);
    } else {
      setConfirmAction(ACTION_TYPES.CREATE);
      setConfirmData(formData);
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      switch (confirmAction) {
        case ACTION_TYPES.CREATE:
          await handleCreateConfirm();
          break;
        case ACTION_TYPES.UPDATE:
          await handleUpdateConfirm();
          break;
        case ACTION_TYPES.DELETE:
          await handleDeleteConfirm();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showNotificationMessage('error', 'Error', `Failed to ${getActionText(confirmAction).toLowerCase()} college`);
    } finally {
      setShowConfirm(false);
      setConfirmAction(null);
      setConfirmData(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCreateConfirm = async () => {
    if (!confirmData || 'id' in confirmData) return;

    const payload = {
      collage_name: confirmData.collage_name,
      total_members: parseInt(confirmData.total_members.toString()),
      district: parseInt(confirmData.district)
    };

    const response = await fetch(`${API_BASE_URL}/collages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Failed to create college');
    
    setShowForm(false);
    fetchCollages(selectedDistrict);
    showNotificationMessage('success', 'Success', 'College created successfully');
  };

  const handleUpdateConfirm = async () => {
    if (!confirmData || 'id' in confirmData || !editingCollage) return;

    const payload = {
      collage_name: confirmData.collage_name,
      total_members: parseInt(confirmData.total_members.toString()),
      district: parseInt(confirmData.district)
    };

    const response = await fetch(`${API_BASE_URL}/collages/${editingCollage.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Failed to update college');
    
    setShowForm(false);
    setEditingCollage(null);
    fetchCollages(selectedDistrict);
    showNotificationMessage('success', 'Success', 'College updated successfully');
  };

  const handleDeleteConfirm = async () => {
    if (!confirmData || !('id' in confirmData)) return;

    const response = await fetch(`${API_BASE_URL}/collages/${confirmData.id}/`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete college');
    
    fetchCollages(selectedDistrict);
    showNotificationMessage('success', 'Success', 'College deleted successfully');
  };

  const getActionText = (action: ActionType): string => {
    switch (action) {
      case ACTION_TYPES.CREATE: return 'Create';
      case ACTION_TYPES.UPDATE: return 'Update';
      case ACTION_TYPES.DELETE: return 'Delete';
      default: return '';
    }
  };

  const getConfirmMessage = (): string => {
    if (!confirmAction || !confirmData) return '';

    const collageName = 'collage_name' in confirmData ? confirmData.collage_name : '';

    switch (confirmAction) {
      case ACTION_TYPES.CREATE:
        return `Are you sure you want to create a new college "${collageName}"?`;
      case ACTION_TYPES.UPDATE:
        return `Are you sure you want to update the college "${collageName}"?`;
      case ACTION_TYPES.DELETE:
        return `Are you sure you want to delete the college "${collageName}"? This action cannot be undone.`;
      default:
        return '';
    }
  };

  const getConfirmButtonText = (): string => {
    switch (confirmAction) {
      case ACTION_TYPES.CREATE: return 'Create';
      case ACTION_TYPES.UPDATE: return 'Update';
      case ACTION_TYPES.DELETE: return 'Delete';
      default: return 'Confirm';
    }
  };

  const getConfirmButtonColor = (): string => {
    switch (confirmAction) {
      case ACTION_TYPES.DELETE: return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_members' ? parseInt(value) || 0 : value
    }));
  };

  const handleDistrictFilter = (districtId: string) => {
    setSelectedDistrict(districtId);
    fetchCollages(districtId);
  };

  // Function to safely get district name
  const getDistrictName = (collage: Collage): string => {
    if (!collage.district) return 'No District';
    
    if (typeof collage.district === 'object' && collage.district.name) {
      return collage.district.name;
    }
    
    if (typeof collage.district === 'object' && collage.district.district_name) {
      return collage.district.district_name;
    }
    
    if (typeof collage.district === 'number' || typeof collage.district === 'string') {
      const district = districts.find(d => d.id === parseInt(collage.district.toString()));
      return district ? district.name : 'Unknown District';
    }
    
    return 'Unknown District';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Center Notification */}
      {showNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className={`relative rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 ${
            notification.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800'
          }`}>
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                notification.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-800' 
                  : 'bg-red-100 dark:bg-red-800'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="mt-3">
                <h3 className={`text-lg font-medium ${
                  notification.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {notification.title}
                </h3>
                <div className="mt-2">
                  <p className={`text-sm ${
                    notification.type === 'success' 
                      ? 'text-green-600 dark:text-green-300' 
                      : 'text-red-600 dark:text-red-300'
                  }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowNotification(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  notification.type === 'success' 
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Colleges Management
        </h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>+</span>
          Add College
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Districts</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={() => handleDistrictFilter('')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* Colleges Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-blue-100 dark:bg-blue-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Collage name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : collages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No colleges found. Create your first college!
                </td>
              </tr>
            ) : (
              collages.map((collage) => (
                <tr key={collage.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {collage.collage_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {collage.total_members}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getDistrictName(collage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(collage)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(collage)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingCollage ? 'Edit College' : 'Create New College'}
              </h2>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College Name
                  </label>
                  <input
                    type="text"
                    name="collage_name"
                    value={formData.collage_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter college name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Members
                  </label>
                  <input
                    type="number"
                    name="total_members"
                    value={formData.total_members}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingCollage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Confirm {getActionText(confirmAction)}
              </h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {getConfirmMessage()}
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-2 text-white rounded-md transition-colors ${getConfirmButtonColor()}`}
              >
                {getConfirmButtonText()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collages;