import { useState, useEffect, useCallback } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import Chat from "./Chat";
import { apiService } from "../../services/api";

interface UserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  date_joined?: string;
  role?: 'admin' | 'user';
}

interface UsersListResponse {
  count: number;
  results: Array<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
    role?: 'admin' | 'user';
  }>;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  const determineFallbackRole = useCallback((user: UserData): 'admin' | 'user' => {
    // 1. Check if role is directly in user data
    if (user.role && (user.role === 'admin' || user.role === 'user')) {
      return user.role;
    }

    // 2. Check localStorage for stored role
    const storedRole = localStorage.getItem('user_role');
    if (storedRole && (storedRole === 'admin' || storedRole === 'user')) {
      return storedRole;
    }

    // 3. Check for admin users based on email or username
    const userEmail = user.email?.toLowerCase() || '';
    const username = user.username?.toLowerCase() || '';
    
    // Define admin criteria
    const adminEmails = [
      'mwananjelaelisha36@gmail.com',
      'admin@tucasa-udom.com',
      'administrator@tucasa-udom.com'
    ];
    
    const adminUsernames = [
      'udom-zone-0001',
      'admin',
      'administrator',
      'superuser'
    ];

    if (adminEmails.includes(userEmail) || adminUsernames.includes(username)) {
      return 'admin';
    }

    // 4. Default to user role
    return 'user';
  }, []);

  const fetchUserRole = useCallback(async (user: UserData) => {
    try {
      setIsLoadingRole(true);
      
      // Check if we have a current user
      const currentUser = apiService.getCurrentUser();
      if (!currentUser) {
        console.log('No current user found');
        setUserRole('user');
        return;
      }

      // Fetch users list from the API
      const response = await apiService.request<UsersListResponse>('/users/', {
        method: 'GET',
      });

      console.log('Users API response:', response);

      // Find the current user in the users list to get their role
      const currentUserInList = response.results.find(
        u => u.id === currentUser.id || u.username === currentUser.username || u.email === currentUser.email
      );

      if (currentUserInList && currentUserInList.role) {
        console.log('Found user role from API:', currentUserInList.role);
        setUserRole(currentUserInList.role);
        // Store the role in localStorage for future use
        localStorage.setItem('user_role', currentUserInList.role);
      } else {
        // Fallback: try to determine role from existing data
        const fallbackRole = determineFallbackRole(user);
        console.log('Using fallback role:', fallbackRole);
        setUserRole(fallbackRole);
      }

    } catch (error) {
      console.error('Error fetching user role from API:', error);
      // Fallback to determining role from existing data
      const fallbackRole = determineFallbackRole(user);
      console.log('Error fallback role:', fallbackRole);
      setUserRole(fallbackRole);
    } finally {
      setIsLoadingRole(false);
    }
  }, [determineFallbackRole]);

  const loadUserDataAndRole = useCallback(async () => {
    try {
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      const parsedUser: UserData = storedUser ? JSON.parse(storedUser) : {};
      setUserData(parsedUser);

      // Fetch user role from the users endpoint
      await fetchUserRole(parsedUser);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData({});
      setUserRole('user');
      setIsLoadingRole(false);
    }
  }, [fetchUserRole]);

  // Load user data and fetch role on component mount
  useEffect(() => {
    loadUserDataAndRole();
  }, [loadUserDataAndRole]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call the logout API
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      
      // Close dropdown
      closeDropdown();
      
      // Force complete page reload to reset all application state
      window.location.href = '/signin';
    }
  };

  // User display information
  const userName = userData.first_name && userData.last_name 
    ? `${userData.first_name} ${userData.last_name}`
    : userData.username || 'User';

  const userEmail = userData.email || 'user@example.com';

  // Format role for display
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  // Role badge styling
  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (userData.first_name) {
      return userData.first_name.charAt(0).toUpperCase();
    }
    if (userData.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get avatar background color based on role
  const getAvatarGradient = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-gradient-to-br from-red-500 to-pink-600';
      case 'user':
        return 'bg-gradient-to-br from-blue-500 to-purple-600';
      default:
        return 'bg-gradient-to-br from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="relative">
      {/* Dropdown Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 text-gray-700 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
        disabled={isLoggingOut}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar with Role-based Color */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 ${getAvatarGradient()}`}>
          <span className="text-sm font-semibold text-white">
            {getUserInitial()}
          </span>
        </div>

        {/* User Info - Hidden on mobile, visible on desktop */}
        <div className="hidden sm:flex sm:flex-col sm:items-start">
          <span className="block text-sm font-medium text-gray-900 dark:text-white">
            {isLoggingOut ? "Logging out..." : userName}
          </span>
          <div className="flex items-center gap-2">
            <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
              {isLoadingRole ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                displayRole
              )}
            </span>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 text-gray-500 dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          } ${isLoggingOut ? "opacity-50" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50"
      >
        {/* User Header Section */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {/* Large Avatar */}
            <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-lg ${getAvatarGradient()}`}>
              <span className="text-xl font-bold text-white">
                {getUserInitial()}
              </span>
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {userName}
                </h3>
                {!isLoadingRole && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                    {displayRole}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {userEmail}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Member since {userData.date_joined ? new Date(userData.date_joined).toLocaleDateString() : 'recently'}
              </p>
              {isLoadingRole && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Loading role...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <ul className="space-y-1">
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                to="/profile"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Edit Profile</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your personal information</p>
                </div>
              </DropdownItem>
            </li>

            <li>
              <DropdownItem
                onItemClick={Chat}
                tag="a"
                to="/chat"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Public Chat Room</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Join community discussions</p>
                </div>
              </DropdownItem>
            </li>

            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                to="/support"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium">Support</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get help and assistance</p>
                </div>
              </DropdownItem>
            </li>
          </ul>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoggingOut ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing out...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </>
            )}
          </button>
        </div>
      </Dropdown>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40 lg:hidden"
          onClick={closeDropdown}
          aria-hidden="true"
        />
      )}
    </div>
  );
}