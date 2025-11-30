import { useState, useEffect, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";

interface District {
  id: number;
  name: string;
}

interface DistrictCalendar {
  id: number;
  title: string;
  description: string;
  document: string;
  document_url: string;
  district: number;
  district_name: string;
  year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  visible: boolean;
}

interface ConfirmationDialog {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

interface FormData {
  title: string;
  description: string;
  district: string;
  year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  document: File | null;
}

const Calendar = () => {
  // State management
  const [calendars, setCalendars] = useState<DistrictCalendar[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<DistrictCalendar | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    visible: false
  });

  // Confirmation dialog state
  const [confirmation, setConfirmation] = useState<ConfirmationDialog>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'danger'
  });

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    district: "",
    year: new Date().getFullYear().toString(),
    start_date: "",
    end_date: "",
    is_active: true,
    document: null,
  });

  // API configuration
  const API_BASE_URL = 'http://127.0.0.1:8000';
  const DISTRICTS_URL = `${API_BASE_URL}/districts/`;
  const CALENDARS_URL = `${API_BASE_URL}/district-calendars/`;

  // Notification handlers
  const showNotification = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({
      type,
      message,
      visible: true
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, type === 'error' ? 6000 : 4000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  // Confirmation dialog handlers
  const showConfirmation = useCallback((options: Omit<ConfirmationDialog, 'visible'>) => {
    setConfirmation({
      ...options,
      visible: true
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, visible: false }));
  }, []);

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch districts
      const districtsResponse = await fetch(DISTRICTS_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (districtsResponse.ok) {
        const districtsData = await districtsResponse.json();
        setDistricts(districtsData.results || districtsData || []);
      }

      // Fetch calendars
      const calendarsResponse = await fetch(CALENDARS_URL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (calendarsResponse.ok) {
        const calendarsData = await calendarsResponse.json();
        
        let calendarsArray: DistrictCalendar[] = [];
        
        if (Array.isArray(calendarsData)) {
          calendarsArray = calendarsData;
        } else if (calendarsData.results && Array.isArray(calendarsData.results)) {
          calendarsArray = calendarsData.results;
        } else if (calendarsData && typeof calendarsData === 'object' && calendarsData.id) {
          calendarsArray = [calendarsData];
        }
        
        setCalendars(calendarsArray);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', 'Failed to load calendars. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [DISTRICTS_URL, CALENDARS_URL, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        document: e.target.files![0]
      }));
      showNotification('info', `File selected: ${e.target.files![0].name}`);
    }
  };

  // CRUD operations
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('district', formData.district);
      data.append('year', formData.year);
      data.append('start_date', formData.start_date);
      data.append('end_date', formData.end_date);
      data.append('is_active', formData.is_active.toString());
      if (formData.document) {
        data.append('document', formData.document);
      }

      const response = await fetch(CALENDARS_URL, {
        method: 'POST',
        body: data,
      });
      
      if (response.ok) {
        showNotification('success', 'Calendar created successfully!');
        await fetchData();
        closeModal();
      } else {
        const errorText = await response.text();
        showNotification('error', `Error creating calendar: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating calendar:', error);
      showNotification('error', 'Error creating calendar. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCalendar) return;

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('district', formData.district);
      data.append('year', formData.year);
      data.append('start_date', formData.start_date);
      data.append('end_date', formData.end_date);
      data.append('is_active', formData.is_active.toString());
      if (formData.document) {
        data.append('document', formData.document);
      }

      const updateUrl = `${CALENDARS_URL}${editingCalendar.id}/`;
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        body: data,
      });
      
      if (response.ok) {
        showNotification('success', 'Calendar updated successfully!');
        await fetchData();
        closeModal();
      } else {
        const errorText = await response.text();
        showNotification('error', `Error updating calendar: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating calendar:', error);
      showNotification('error', 'Error updating calendar. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    const calendarToDelete = calendars.find(cal => cal.id === id);
    
    showConfirmation({
      title: 'Delete Calendar',
      message: `Are you sure you want to delete "${calendarToDelete?.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const deleteUrl = `${CALENDARS_URL}${id}/`;
          const response = await fetch(deleteUrl, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            showNotification('success', 'Calendar deleted successfully!');
            await fetchData();
          } else {
            showNotification('error', 'Error deleting calendar. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting calendar:', error);
          showNotification('error', 'Error deleting calendar. Please try again.');
        }
        hideConfirmation();
      },
      onCancel: () => {
        showNotification('info', 'Deletion cancelled.');
        hideConfirmation();
      }
    });
  };

  const handleDownload = async (calendar: DistrictCalendar) => {
    if (!calendar.document) {
      showNotification('info', 'No document available for download.');
      return;
    }

    try {
      let downloadUrl = calendar.document;
      
      // If the document URL is relative, construct absolute URL
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = `${API_BASE_URL}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
      }

      const response = await fetch(downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = calendar.document.split('/').pop() || `calendar-${calendar.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('success', 'Document downloaded successfully!');
      } else {
        showNotification('error', 'Error downloading document. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      showNotification('error', 'Error downloading document. Please try again.');
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingCalendar(null);
    setFormData({
      title: "",
      description: "",
      district: "",
      year: new Date().getFullYear().toString(),
      start_date: "",
      end_date: "",
      is_active: true,
      document: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (calendar: DistrictCalendar) => {
    setEditingCalendar(calendar);
    setFormData({
      title: calendar.title,
      description: calendar.description,
      district: calendar.district.toString(),
      year: calendar.year,
      start_date: calendar.start_date,
      end_date: calendar.end_date,
      is_active: calendar.is_active,
      document: null,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCalendar(null);
    setFormData({
      title: "",
      description: "",
      district: "",
      year: new Date().getFullYear().toString(),
      start_date: "",
      end_date: "",
      is_active: true,
      document: null,
    });
  };

  // UI helper functions
  const getNotificationStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg transition-all duration-300";
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border border-green-200 dark:bg-green-900 dark:border-green-700`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200 dark:bg-red-900 dark:border-red-700`;
      case 'info':
        return `${baseStyles} bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700`;
      case 'warning':
        return `${baseStyles} bg-amber-50 border border-amber-200 dark:bg-amber-900 dark:border-amber-700`;
      default:
        return `${baseStyles} bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700`;
    }
  };

  const getNotificationIcon = () => {
    const iconClass = "w-5 h-5";
    
    switch (notification.type) {
      case 'success':
        return (
          <svg className={`${iconClass} text-green-600 dark:text-green-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconClass} text-red-600 dark:text-red-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className={`${iconClass} text-blue-600 dark:text-blue-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconClass} text-amber-600 dark:text-amber-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading calendars...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="District Calendars"
        description="Manage district calendar events and documents"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        {/* Notification */}
        {notification.visible && (
          <div className={getNotificationStyles()}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon()}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800 dark:text-green-200' :
                  notification.type === 'error' ? 'text-red-800 dark:text-red-200' :
                  notification.type === 'info' ? 'text-blue-800 dark:text-blue-200' :
                  'text-amber-800 dark:text-amber-200'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={hideNotification}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmation.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  confirmation.type === 'danger' ? 'bg-red-100 dark:bg-red-900' :
                  confirmation.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900' :
                  'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <svg className={`w-5 h-5 ${
                    confirmation.type === 'danger' ? 'text-red-600 dark:text-red-400' :
                    confirmation.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {confirmation.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {confirmation.message}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={confirmation.onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {confirmation.cancelText}
                </button>
                <button
                  onClick={confirmation.onConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${
                    confirmation.type === 'danger' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : confirmation.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmation.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    District Calendars
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage calendar events and documents for districts
                  </p>
                </div>
                <button 
                  onClick={openCreateModal}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Calendar</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title & Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {calendars.map((calendar) => (
                    <tr key={calendar.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {calendar.title}
                          </div>
                          {calendar.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {calendar.description.length > 80 
                                ? `${calendar.description.substring(0, 80)}...`
                                : calendar.description
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {calendar.district_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {calendar.year}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div>{new Date(calendar.start_date).toLocaleDateString()}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            to {new Date(calendar.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          calendar.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {calendar.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {calendar.document && (
                            <button
                              onClick={() => handleDownload(calendar)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1"
                              title="Download Document"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm">Download</span>
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(calendar)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Calendar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-sm">Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(calendar.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 flex items-center space-x-1"
                            title="Delete Calendar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {calendars.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No calendars found</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Get started by creating your first district calendar.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Add Calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingCalendar ? "Edit Calendar" : "Create Calendar"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={editingCalendar ? handleUpdate : handleCreate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter calendar title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter calendar description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        District *
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select District</option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year *
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter year"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Calendar
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{editingCalendar ? "Update Calendar" : "Create Calendar"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Calendar;