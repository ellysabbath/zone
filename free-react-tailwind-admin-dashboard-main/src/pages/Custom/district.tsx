import React, { useState, useEffect, useCallback } from 'react';

// Define types
interface College {
  id: number;
  collage_name: string;
  total_members: number;
}

interface District {
  id: number;
  name: string;
  pastor_name: string;
  date_created: string;
  total_members?: number;
  collages_count?: number;
  calculated_total_members?: number;
  collages?: College[];
}

interface FormData {
  name: string;
  pastor_name: string;
}

interface ConfirmationData {
  type: string;
  title: string;
  message: string;
  action: () => void;
  district: District | null;
}

const District = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    pastor_name: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData>({
    type: '',
    title: '',
    message: '',
    action: () => {},
    district: null
  });

  const API_BASE_URL = 'http://localhost:8000';

  // Function to calculate total members from colleges
  const calculateTotalMembers = (district: District): number => {
    if (district.total_members && district.total_members > 0) {
      return district.total_members;
    }
    
    if (district.collages && district.collages.length > 0) {
      return district.collages.reduce((total, collage) => total + (collage.total_members || 0), 0);
    }
    
    return 0;
  };

  const fetchDistricts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/districts/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Enhance districts data with calculated total members
      const enhancedDistricts = (data.results || data || []).map((district: District) => ({
        ...district,
        calculated_total_members: calculateTotalMembers(district)
      }));
      
      setDistricts(enhancedDistricts);
    } catch (err) {
      setError(`Failed to load districts: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Zone name is required');
      return false;
    }
    if (!formData.pastor_name.trim()) {
      setError('Pastor name is required');
      return false;
    }
    return true;
  };

  const confirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isEditing = !!editingDistrict;
    const actionType = isEditing ? 'update' : 'create';
    const districtName = isEditing ? editingDistrict!.name : formData.name;

    setConfirmationData({
      type: actionType,
      title: isEditing ? 'Update Zone' : 'Create Zone',
      message: isEditing 
        ? `Update "${districtName}" zone?`
        : `Create "${formData.name}" zone?`,
      action: () => performSave(),
      district: isEditing ? editingDistrict : null
    });
    setShowConfirmation(true);
  };

  const performSave = async () => {
    try {
      setLoading(true);
      const apiData = {
        name: formData.name.trim(),
        pastor_name: formData.pastor_name.trim(),
      };

      let response;
      if (editingDistrict) {
        response = await fetch(`${API_BASE_URL}/districts/${editingDistrict.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
        if (!response.ok) throw new Error(`Failed to update: ${response.status}`);
        const result = await response.json();
        
        // Enhance the updated district with calculated total members
        const enhancedDistrict = {
          ...result,
          calculated_total_members: calculateTotalMembers(result)
        };
        
        setDistricts(prev => prev.map(d => d.id === editingDistrict.id ? enhancedDistrict : d));
        setError('Zone updated successfully!');
      } else {
        response = await fetch(`${API_BASE_URL}/districts/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiData),
        });
        if (!response.ok) throw new Error(`Failed to create: ${response.status}`);
        await fetchDistricts();
        setError('Zone created successfully!');
      }
      resetForm();
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (district: District) => {
    setConfirmationData({
      type: 'delete',
      title: 'Delete Zone',
      message: `Delete "${district.name}" zone? This cannot be undone.`,
      action: () => performDelete(district.id),
      district: district
    });
    setShowConfirmation(true);
  };

  const performDelete = async (districtId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/districts/${districtId}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete: ${response.status}`);
      setDistricts(prev => prev.filter(d => d.id !== districtId));
      setError('Zone deleted successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    setFormData({
      name: district.name,
      pastor_name: district.pastor_name,
    });
    setShowForm(true);
    setError(null);
  };

  const resetForm = () => {
    setFormData({ name: '', pastor_name: '' });
    setShowForm(false);
    setEditingDistrict(null);
  };

  const cancelForm = () => {
    resetForm();
    setError(null);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData({
      type: '', title: '', message: '', action: () => {}, district: null
    });
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleRefresh = () => {
    fetchDistricts();
    setError('Refreshing...');
    setTimeout(() => setError(null), 2000);
  };

  const getConfirmationButtonStyle = (type: string): string => {
    switch (type) {
      case 'delete': return 'bg-red-600 hover:bg-red-700';
      case 'update': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'create': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  // Function to display college details in a tooltip or modal
  const renderCollegeDetails = (district: District) => {
    if (!district.collages || district.collages.length === 0) {
      return <span className="text-gray-400">No colleges</span>;
    }

    return (
      <div className="group relative">
        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 underline text-xs">
          View Colleges ({district.collages_count || district.collages.length})
        </button>
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
              Colleges in {district.name}
            </div>
            {district.collages.map((college, index) => (
              <div key={college.id || index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-700 dark:text-gray-300">{college.collage_name}</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {college.total_members?.toLocaleString() || 0} members
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Total</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {calculateTotalMembers(district).toLocaleString()} members
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && districts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading zones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Zone Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all zones with full CRUD operations
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className={`mb-4 p-3 border ${
            error.includes('successfully') || error.includes('Refreshing')
              ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-current hover:opacity-70">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Zone
            </button>
            
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium flex items-center gap-2"
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 border border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-800 dark:text-white">{districts.length}</span> zones • 
            <span className="font-semibold text-green-600 dark:text-green-400 ml-1">
              {districts.reduce((total, district) => total + (district.calculated_total_members || 0), 0).toLocaleString()}
            </span> total members
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingDistrict ? 'Edit Zone' : 'Create Zone'}
              </h2>
              <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" disabled={loading}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={confirmSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Zone name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pastor Name *
                  </label>
                  <input
                    type="text"
                    name="pastor_name"
                    value={formData.pastor_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pastor name"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {loading ? 'Processing...' : (editingDistrict ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table View */}
        {districts.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-100 dark:bg-blue-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Zone Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Pastor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Colleges
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Total Members
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {districts.map((district) => (
                    <tr key={district.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {district.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-800 dark:text-white">
                          {district.pastor_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 w-fit">
                            {district.collages_count || district.collages?.length || 0} colleges
                          </span>
                          {renderCollegeDetails(district)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {calculateTotalMembers(district).toLocaleString()}
                        </div>
                        {district.total_members === 0 && (district.calculated_total_members || 0) > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Calculated from colleges
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(district.date_created)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(district)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            disabled={loading}
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(district)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            disabled={loading}
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-300 dark:text-gray-600 text-4xl mb-3">🏛️</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No Zones Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first zone to get started.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Zone
            </button>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 shadow max-w-md w-full p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                {confirmationData.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {confirmationData.message}
              </p>

              {confirmationData.district && (
                <div className="bg-gray-50 dark:bg-gray-700 p-2 mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Zone:</strong> {confirmationData.district.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Pastor:</strong> {confirmationData.district.pastor_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Colleges:</strong> {confirmationData.district.collages_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Total Members:</strong> {calculateTotalMembers(confirmationData.district).toLocaleString()}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={closeConfirmation}
                  className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmationData.action();
                    closeConfirmation();
                  }}
                  disabled={loading}
                  className={`px-3 py-2 text-white font-medium flex items-center gap-2 ${getConfirmationButtonStyle(confirmationData.type)}`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  {loading ? 'Processing...' : 
                   confirmationData.type === 'delete' ? 'Delete' :
                   confirmationData.type === 'update' ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default District;