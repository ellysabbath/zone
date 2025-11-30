import React, { useState, useEffect, useCallback } from 'react';

// Define types
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface College {
  id: number;
  collage_name: string;
  district_name?: string;
}

interface Member {
  id: number;
  user?: number;
  member?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  email?: string;
  mobile_number?: string;
  nationality: string;
  region: string;
  collage_name: number | string;
  district?: string;
  date_of_birth: string;
  education_level: string;
  your_course: string;
  your_origin_church: string;
  your_origin_district: string;
  your_secretary_name: string;
  your_elder_from: string;
  picture?: string;
  total_members?: number;
}

interface FormData {
  user: string;
  member: string;
  nationality: string;
  region: string;
  collage_name: string;
  district: string;
  date_of_birth: string;
  education_level: string;
  your_course: string;
  your_origin_church: string;
  your_origin_district: string;
  your_secretary_name: string;
  your_elder_from: string;
}

interface Filters {
  nationality: string;
  region: string;
  education_level: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
  title: string;
}

type ActionType = 'create' | 'update' | 'delete' | 'deactivate' | null;

// Constants
const ACTION_TYPES = {
  CREATE: 'create' as const,
  UPDATE: 'update' as const,
  DELETE: 'delete' as const,
  DEACTIVATE: 'deactivate' as const
};

const TANZANIA_REGIONS = [
  'arusha', 'dar_es_salaam', 'dodoma', 'geita', 'iringa', 
  'kagera', 'katavi', 'kigoma', 'kilimanjaro', 'lindi', 
  'manyara', 'mara', 'mbeya', 'morogoro', 'mtwara', 
  'mwanza', 'njombe', 'pwani', 'rukwa', 'ruvuma', 
  'shinyanga', 'simiyu', 'singida', 'tabora', 'tanga'
];

const EDUCATION_LEVELS = [
  'first_year', 'second_year', 'third_year', 
  'fourth_year', 'fifth_year', 'sixth_year'
];

const API_BASE_URL = 'http://localhost:8000';

const Members: React.FC = () => {
  // State declarations
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [confirmAction, setConfirmAction] = useState<ActionType>(null);
  const [confirmData, setConfirmData] = useState<FormData | Member | null>(null);
  const [filters, setFilters] = useState<Filters>({
    nationality: '',
    region: '',
    education_level: ''
  });
  const [formData, setFormData] = useState<FormData>({
    user: '',
    member: '',
    nationality: '',
    region: '',
    collage_name: '',
    district: '',
    date_of_birth: '',
    education_level: '',
    your_course: '',
    your_origin_church: '',
    your_origin_district: '',
    your_secretary_name: '',
    your_elder_from: ''
  });
  const [notification, setNotification] = useState<Notification>({
    type: 'success',
    message: '',
    title: ''
  });

  // Utility functions
  const formatRegionName = useCallback((region: string): string => {
    return region
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const formatEducationLevel = useCallback((level: string): string => {
    return level
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // Notification handler
  const showNotificationMessage = useCallback((type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      type,
      title,
      message
    });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }, []);

  // API functions
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.results || data);
    } catch {
      console.error('Error fetching users');
      showNotificationMessage('error', 'Error', 'Failed to fetch users');
    }
  }, [showNotificationMessage]);

  const fetchColleges = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/collages/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const collegesData = data.results || data;
      setColleges(collegesData);
    } catch {
      console.error('Error fetching colleges');
      showNotificationMessage('error', 'Error', 'Failed to fetch colleges');
    }
  }, [showNotificationMessage]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (filters.nationality) params.append('nationality', filters.nationality);
      if (filters.region) params.append('region', filters.region);
      if (filters.education_level) params.append('education_level', filters.education_level);

      const url = `${API_BASE_URL}/collage-members/?${params.toString()}`;
      console.log('Fetching from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      
      const membersData = data.results || data;
      const enhancedMembers = membersData.map((member: Member) => {
        if (member.user) {
          const user = users.find(u => u.id === member.user);
          return {
            ...member,
            username: user?.username || 'N/A',
            first_name: member.first_name || user?.first_name,
            last_name: member.last_name || user?.last_name,
            email: member.email || user?.email
          };
        }
        return member;
      });
      
      setMembers(enhancedMembers);
      
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(`Failed to fetch members: ${(err as Error).message}`);
      showNotificationMessage('error', 'Error', 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [filters, users, showNotificationMessage]);

  // Helper functions
  const getUsername = useCallback((userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user?.username || 'N/A';
  }, [users]);

  const getCollegeDisplayName = useCallback((collegeId: number | string): string => {
    if (!collegeId) return 'N/A';
    const college = colleges.find(c => c.id === parseInt(collegeId.toString()));
    return college ? college.collage_name : `College ID: ${collegeId}`;
  }, [colleges]);

  // Effects
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchUsers();
      await fetchColleges();
    };
    loadInitialData();
  }, [fetchUsers, fetchColleges]);

  useEffect(() => {
    if (users.length > 0) {
      fetchMembers();
    }
  }, [users, filters, fetchMembers]);

  // Event handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      nationality: '',
      region: '',
      education_level: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      user: '',
      member: '',
      nationality: '',
      region: '',
      collage_name: '',
      district: '',
      date_of_birth: '',
      education_level: '',
      your_course: '',
      your_origin_church: '',
      your_origin_district: '',
      your_secretary_name: '',
      your_elder_from: ''
    });
    setShowModal(true);
  };

  const openEditModal = (member: Member) => {
    setModalMode('edit');
    setSelectedMember(member);
    setFormData({
      user: member.user?.toString() || '',
      member: member.member?.toString() || '',
      nationality: member.nationality || '',
      region: member.region || '',
      collage_name: member.collage_name?.toString() || '',
      district: member.district || '',
      date_of_birth: member.date_of_birth || '',
      education_level: member.education_level || '',
      your_course: member.your_course || '',
      your_origin_church: member.your_origin_church || '',
      your_origin_district: member.your_origin_district || '',
      your_secretary_name: member.your_secretary_name || '',
      your_elder_from: member.your_elder_from || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      setConfirmAction(ACTION_TYPES.CREATE);
      setConfirmData(formData);
    } else {
      setConfirmAction(ACTION_TYPES.UPDATE);
      setConfirmData(formData);
    }
    setShowConfirm(true);
  };

  const handleDeleteClick = (member: Member) => {
    setConfirmAction(ACTION_TYPES.DELETE);
    setConfirmData(member);
    setShowConfirm(true);
  };

  const handleDeactivateClick = (member: Member) => {
    setConfirmAction(ACTION_TYPES.DEACTIVATE);
    setConfirmData(member);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction || !confirmData) return;

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
        case ACTION_TYPES.DEACTIVATE:
          await handleDeactivateConfirm();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showNotificationMessage('error', 'Error', `Failed to ${getActionText(confirmAction)} member`);
    } finally {
      setShowConfirm(false);
      setShowModal(false);
      setConfirmAction(null);
      setConfirmData(null);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setShowModal(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCreateConfirm = async () => {
    if (!confirmData || 'id' in confirmData) return;

    const payload = {
      ...confirmData,
      user: (confirmData as FormData).user ? parseInt((confirmData as FormData).user) : null,
      member: (confirmData as FormData).member ? parseInt((confirmData as FormData).member) : null,
      collage_name: (confirmData as FormData).collage_name ? parseInt((confirmData as FormData).collage_name) : null,
      district: (confirmData as FormData).district ? parseInt((confirmData as FormData).district) : null
    };

    const response = await fetch(`${API_BASE_URL}/collage-members/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Failed to create member');
    
    fetchMembers();
    showNotificationMessage('success', 'Success', 'Member created successfully');
  };

  const handleUpdateConfirm = async () => {
    if (!confirmData || 'id' in confirmData || !selectedMember) return;

    const payload = {
      ...confirmData,
      user: (confirmData as FormData).user ? parseInt((confirmData as FormData).user) : null,
      member: (confirmData as FormData).member ? parseInt((confirmData as FormData).member) : null,
      collage_name: (confirmData as FormData).collage_name ? parseInt((confirmData as FormData).collage_name) : null,
      district: (confirmData as FormData).district ? parseInt((confirmData as FormData).district) : null
    };

    const response = await fetch(`${API_BASE_URL}/collage-members/${selectedMember.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Failed to update member');
    
    setSelectedMember(null);
    fetchMembers();
    showNotificationMessage('success', 'Success', 'Member updated successfully');
  };

  const handleDeleteConfirm = async () => {
    if (!confirmData || !('id' in confirmData)) return;

    const response = await fetch(`${API_BASE_URL}/collage-members/${confirmData.id}/`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete member');
    
    fetchMembers();
    showNotificationMessage('success', 'Success', 'Member deleted successfully');
  };

  const handleDeactivateConfirm = async () => {
    if (!confirmData || !('id' in confirmData)) return;

    const response = await fetch(`${API_BASE_URL}/collage-members/${confirmData.id}/deactivate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error('Failed to deactivate member');
    
    fetchMembers();
    showNotificationMessage('success', 'Success', 'Member deactivated successfully');
  };

  // Helper functions for confirmation modal
  const getActionText = (action: ActionType): string => {
    switch (action) {
      case ACTION_TYPES.CREATE: return 'Create';
      case ACTION_TYPES.UPDATE: return 'Update';
      case ACTION_TYPES.DELETE: return 'Delete';
      case ACTION_TYPES.DEACTIVATE: return 'Deactivate';
      default: return '';
    }
  };

  const getConfirmMessage = (): string => {
    if (!confirmAction || !confirmData) return '';

    const firstName = 'first_name' in confirmData ? confirmData.first_name : '';
    const lastName = 'last_name' in confirmData ? confirmData.last_name : '';
    const username = 'username' in confirmData ? confirmData.username : '';

    switch (confirmAction) {
      case ACTION_TYPES.CREATE:
        return `Are you sure you want to create a new member?`;
      case ACTION_TYPES.UPDATE:
        return `Are you sure you want to update this member?`;
      case ACTION_TYPES.DELETE:
        return `Are you sure you want to delete "${firstName} ${lastName}" (${username})? This action cannot be undone.`;
      case ACTION_TYPES.DEACTIVATE:
        return `Are you sure you want to deactivate "${firstName} ${lastName}" (${username})?`;
      default:
        return '';
    }
  };

  const getConfirmButtonText = (): string => {
    switch (confirmAction) {
      case ACTION_TYPES.CREATE: return 'Create';
      case ACTION_TYPES.UPDATE: return 'Update';
      case ACTION_TYPES.DELETE: return 'Delete';
      case ACTION_TYPES.DEACTIVATE: return 'Deactivate';
      default: return 'Confirm';
    }
  };

  const getConfirmButtonColor = (): string => {
    switch (confirmAction) {
      case ACTION_TYPES.DELETE: return 'bg-red-600 hover:bg-red-700';
      case ACTION_TYPES.DEACTIVATE: return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  // Loading state
  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl dark:text-white text-gray-800 mb-4">Loading members...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 overflow-x-auto max-w-[160vh] overflow-y-auto max-h-[200vh]">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
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

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              College Members
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage college member information
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
          >
            <span>+</span>
            Add New Member
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nationality
              </label>
              <select
                name="nationality"
                value={filters.nationality}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Nationalities</option>
                <option value="tanzania">Tanzania</option>
                <option value="kenya">Kenya</option>
                <option value="uganda">Uganda</option>
                <option value="rwanda">Rwanda</option>
                <option value="burundi">Burundi</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Region
              </label>
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Regions</option>
                {TANZANIA_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {formatRegionName(region)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Education Level
              </label>
              <select
                name="education_level"
                value={filters.education_level}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Levels</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {formatEducationLevel(level)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-blue-100 dark:bg-blue-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Member Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nationality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Education Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No members found. Create your first member!
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {member.picture && member.picture !== '/media/members/images/download.png' ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={member.picture}
                                alt={`${member.first_name} ${member.last_name}`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  👤
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.first_name} {member.middle_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {member.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {member.mobile_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {member.username || (member.user ? getUsername(member.user) : 'N/A')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getCollegeDisplayName(member.collage_name)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 capitalize">
                          {member.nationality?.toLowerCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                        {member.region ? formatRegionName(member.region) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                        {member.education_level ? formatEducationLevel(member.education_level) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {member.your_course || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(member.date_of_birth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(member)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeactivateClick(member)}
                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto max-h-[150vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[120vh] max-h-[75vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {modalMode === 'create' ? 'Add New Member' : 'Edit Member'}
                </h2>
              </div>
              
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User (Username - Name)
                    </label>
                    <select
                      name="user"
                      value={formData.user}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} - {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* College Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College
                    </label>
                    <select
                      name="collage_name"
                      value={formData.collage_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select College</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.collage_name} {college.district_name ? `- ${college.district_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nationality
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Nationality</option>
                      <option value="tanzania">Tanzania</option>
                      <option value="kenya">Kenya</option>
                      <option value="uganda">Uganda</option>
                      <option value="rwanda">Rwanda</option>
                      <option value="burundi">Burundi</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Region
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Region</option>
                      {TANZANIA_REGIONS.map((region) => (
                        <option key={region} value={region}>
                          {formatRegionName(region)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education Level
                    </label>
                    <select
                      name="education_level"
                      value={formData.education_level}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Education Level</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {formatEducationLevel(level)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Additional Fields */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      name="your_course"
                      value={formData.your_course}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Course name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Origin Church
                    </label>
                    <input
                      type="text"
                      name="your_origin_church"
                      value={formData.your_origin_church}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Origin church"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Origin District
                    </label>
                    <input
                      type="text"
                      name="your_origin_district"
                      value={formData.your_origin_district}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Origin district"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secretary Name
                    </label>
                    <input
                      type="text"
                      name="your_secretary_name"
                      value={formData.your_secretary_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Secretary name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Elder From
                    </label>
                    <input
                      type="text"
                      name="your_elder_from"
                      value={formData.your_elder_from}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Elder from"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
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
    </div>
  );
};

export default Members;