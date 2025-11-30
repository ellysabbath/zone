import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'user';
  username?: string;
}

interface ApiResponse {
  users?: User[];
  data?: User[];
  results?: User[];
}

// SignUp Form Component
const SignUpForm = ({ 
  onSuccess, 
  onCancel,
  isLoading,
  setIsLoading 
}: { 
  onSuccess: () => void;
  onCancel: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isChecked) {
      setError("Please agree to the Terms and Conditions and Privacy Policy");
      return;
    }

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirm) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        agree_to_terms: isChecked,
      };

      const response = await fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }

      const result = await response.json();
      setSuccess(result.message || "User created successfully! The user will receive an email with their credentials.");
      
      // Clear form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirm: "",
      });
      setIsChecked(false);
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">
          Add New User
        </h2>
        
        {/* Status Messages */}
        {error && (
          <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                />
              </div>
              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
                disabled={isLoading}
                className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  placeholder="Enter password (min. 8 characters)"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                By creating an account means you agree to the{" "}
                <span className="text-blue-600 dark:text-blue-400">Terms and Conditions</span>
                {" "}and our{" "}
                <span className="text-blue-600 dark:text-blue-400">Privacy Policy</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 text-white py-2 px-3 font-medium text-sm transition duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Creating User...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 disabled:opacity-50 text-blue-700 dark:text-blue-300 py-2 px-3 font-medium text-sm transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main UserManagement Component
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user'
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'deactivate' | 'activate';
    user: User | null;
    open: boolean;
  }>({ type: 'delete', user: null, open: false });

// Inside your component:
const fetchUsers = useCallback(async () => {
  try {
    setLoading(true);
    const response = await fetch('http://127.0.0.1:8000/users/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse | User[] = await response.json();
    
    let usersArray: User[] = [];
    
    if (Array.isArray(data)) {
      usersArray = data;
    } else if (data && typeof data === 'object') {
      usersArray = (data.users || data.data || data.results || []) as User[];
    }
    
    if (!Array.isArray(usersArray)) {
      console.warn('Expected array but got:', usersArray);
      usersArray = [];
    }
    
    setUsers(usersArray);
  } catch (error) {
    console.error('Error fetching users:', error);
    showMessage(
      error instanceof Error 
        ? `Failed to fetch users: ${error.message}` 
        : 'Error fetching users', 
      'error'
    );
    setUsers([]);
  } finally {
    setLoading(false);
  }
}, []); // Add dependencies if needed, but empty array is fine here

useEffect(() => {
  fetchUsers();
}, [fetchUsers]); // Now fetchUsers is stable

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update user
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${editingUser.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          username: editingUser.username
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }

      const updatedUser: User = await response.json();
      showMessage(`User ${updatedUser.username} updated successfully!`, 'success');
      resetForm();
      setView('list');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage(
        error instanceof Error 
          ? `Error updating user: ${error.message}` 
          : 'Error updating user', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showMessage('User deleted successfully!', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage(
        error instanceof Error 
          ? `Error deleting user: ${error.message}` 
          : 'Error deleting user', 
        'error'
      );
    } finally {
      setConfirmAction({ type: 'delete', user: null, open: false });
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !user.is_active
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser: User = await response.json();
      showMessage(
        `User ${updatedUser.username} ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully!`,
        'success'
      );
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showMessage(
        error instanceof Error 
          ? `Error updating user status: ${error.message}` 
          : 'Error updating user status', 
        'error'
      );
    } finally {
      setConfirmAction({ type: 'delete', user: null, open: false });
    }
  };

  // Start editing user
  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
    setView('edit');
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'user'
    });
    setEditingUser(null);
    setView('list');
  };

  // Open confirmation dialog
  const openConfirmDialog = (type: 'delete' | 'deactivate' | 'activate', user: User) => {
    setConfirmAction({ type, user, open: true });
  };

  // Handle confirmed action
  const handleConfirmedAction = () => {
    if (!confirmAction.user) return;

    switch (confirmAction.type) {
      case 'delete':
        handleDelete(confirmAction.user.id);
        break;
      case 'deactivate':
      case 'activate':
        toggleUserStatus(confirmAction.user);
        break;
    }
  };

  // Get confirmation button colors based on action type
  const getConfirmButtonColors = () => {
    switch (confirmAction.type) {
      case 'delete':
        return {
          bg: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
          text: 'text-white'
        };
      case 'deactivate':
        return {
          bg: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800',
          text: 'text-white'
        };
      case 'activate':
        return {
          bg: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
          text: 'text-white'
        };
    }
  };

  // Get confirmation details based on action type
  const getConfirmDetails = () => {
    switch (confirmAction.type) {
      case 'delete':
        return {
          title: 'Delete User',
          icon: '🗑️',
          description: `Are you sure you want to delete user "${confirmAction.user?.username}"? This action cannot be undone.`
        };
      case 'deactivate':
        return {
          title: 'Deactivate User',
          icon: '⏸️',
          description: `Are you sure you want to deactivate user "${confirmAction.user?.username}"? They will not be able to access the system.`
        };
      case 'activate':
        return {
          title: 'Activate User',
          icon: '▶️',
          description: `Are you sure you want to activate user "${confirmAction.user?.username}"? They will be able to access the system.`
        };
      default:
        return {
          title: 'Confirm Action',
          icon: '❓',
          description: 'Are you sure you want to proceed?'
        };
    }
  };

  // Handle successful user creation
  const handleUserCreationSuccess = () => {
    showMessage('User created successfully!', 'success');
    setView('list');
    fetchUsers();
  };

  // Safe users array for rendering
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-1">
            User Management
          </h1>
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            Manage system users and their permissions
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-4 p-3 ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Navigation */}
        <div className="mb-4 flex space-x-3">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 font-medium text-sm ${
              view === 'list'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            User List
          </button>
          <button
            onClick={() => setView('add')}
            className={`px-3 py-1.5 font-medium text-sm ${
              view === 'add'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            Add User
          </button>
        </div>

        {/* Confirmation Dialog */}
        {confirmAction.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-4 max-w-md w-full shadow-lg">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{getConfirmDetails().icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getConfirmDetails().title}
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                {getConfirmDetails().description}
              </p>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => setConfirmAction({ type: 'delete', user: null, open: false })}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedAction}
                  className={`px-3 py-1.5 font-medium text-sm ${getConfirmButtonColors().bg} ${getConfirmButtonColors().text}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User List View */}
        {view === 'list' && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-blue-200 dark:border-blue-700">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                All Users ({safeUsers.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-blue-600 dark:text-blue-400 text-sm">
                Loading users...
              </div>
            ) : safeUsers.length === 0 ? (
              <div className="p-6 text-center text-blue-600 dark:text-blue-400 text-sm">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-700">
                  <thead className="bg-blue-50 dark:bg-blue-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-blue-200 dark:divide-blue-700">
                    {safeUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50 dark:hover:bg-blue-900">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-900 dark:text-blue-100">
                          {user.username}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-700 dark:text-blue-300">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-700 dark:text-blue-300">
                          {user.email}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${
                            user.is_active
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium space-x-1">
                          <button
                            onClick={() => startEdit(user)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openConfirmDialog(
                              user.is_active ? 'deactivate' : 'activate', 
                              user
                            )}
                            className={`text-sm ${
                              user.is_active
                                ? 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200'
                                : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openConfirmDialog('delete', user)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add User View - SignUp Form */}
        {view === 'add' && (
          <SignUpForm 
            onSuccess={handleUserCreationSuccess}
            onCancel={resetForm}
            isLoading={loading}
            setIsLoading={setLoading}
          />
        )}

        {/* Edit User View - Simple Form */}
        {view === 'edit' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow p-4">
              <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">
                Edit User
              </h2>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-blue-300 dark:border-blue-600 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {editingUser && (
                      <span className="block">
                        Current username: <strong>{editingUser.username}</strong>
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 text-white py-1.5 px-3 font-medium text-sm transition duration-200"
                  >
                    {loading ? 'Updating User...' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 disabled:opacity-50 text-blue-700 dark:text-blue-300 py-1.5 px-3 font-medium text-sm transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;