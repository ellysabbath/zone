import { useState, useEffect, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";

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

const Calendar = () => {
  // State management
  const [calendars, setCalendars] = useState<DistrictCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    visible: false
  });

  // API configuration
  const API_BASE_URL = 'http://127.0.0.1:8000';
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

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

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
  }, [CALENDARS_URL, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        description="View district calendar events and documents"
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
                    View calendar events and documents for districts
                  </p>
                </div>
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
                    No district calendars available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendar;