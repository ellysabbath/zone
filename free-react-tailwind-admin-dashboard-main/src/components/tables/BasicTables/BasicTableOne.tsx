import React, { useState, useEffect } from 'react';

interface Profile {
  bio: string | null;
  phone: string | null;
  location: string | null;
  profile_picture: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  country: string | null;
  city_state: string | null;
  postal_code: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  agree_to_terms: boolean;
  profile: Profile;
}

interface Member {
  id: number;
  user: number;
  user_details: UserDetails;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  middle_name: string;
  mobile_number: string;
  image: string;
  role: 'admin' | 'user';
  date_joined: string;
  is_active: boolean;
  user_is_active: boolean;
  full_name: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Member[];
}

interface FormData {
  user: string;
  role: 'admin' | 'user';
  middle_name: string;
  mobile_number: string;
  image: File | null;
  is_active: boolean;
}

const MembersTable = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    user: '',
    role: 'user',
    middle_name: '',
    mobile_number: '',
    image: null,
    is_active: true
  });

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data.results || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load users: ${errorMessage}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/members/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: ApiResponse = await response.json();
      setMembers(data.results || data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load members: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value as 'admin' | 'user'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('user', formData.user);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('middle_name', formData.middle_name);
      formDataToSend.append('mobile_number', formData.mobile_number);
      formDataToSend.append('is_active', formData.is_active.toString());
      if (formData.image) formDataToSend.append('image', formData.image);

      const response = await fetch(`${API_BASE_URL}/members/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to create member');
      await fetchMembers();
      setShowForm(false);
      resetForm();
      setError('Member created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error creating member: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('user', editingMember.user.toString());
      formDataToSend.append('role', formData.role);
      formDataToSend.append('middle_name', formData.middle_name);
      formDataToSend.append('mobile_number', formData.mobile_number);
      formDataToSend.append('is_active', formData.is_active.toString());
      if (formData.image) formDataToSend.append('image', formData.image);

      const response = await fetch(`${API_BASE_URL}/members/${editingMember.id}/`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to update member');
      await fetchMembers();
      setShowForm(false);
      setEditingMember(null);
      resetForm();
      setError('Member updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error updating member: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memberId: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/members/${memberId}/`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete member');
      await fetchMembers();
      setError('Member deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error deleting member: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      setLoading(true);
      const action = member.is_active ? 'deactivate' : 'activate';
      const response = await fetch(`${API_BASE_URL}/members/${member.id}/${action}/`, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to ${action} member`);
      await fetchMembers();
      setError(`Member ${action}d successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error updating member status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      user: member.user.toString(),
      role: member.role,
      middle_name: member.middle_name,
      mobile_number: member.mobile_number,
      image: null,
      is_active: member.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      user: '',
      role: 'user',
      middle_name: '',
      mobile_number: '',
      image: null,
      is_active: true
    });
    setEditingMember(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  interface BadgeProps {
    color: 'success' | 'warning' | 'error' | 'info';
    children: React.ReactNode;
  }

  const Badge = ({ color, children }: BadgeProps) => {
    const colorClasses = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${colorClasses[color]}`}>
        {children}
      </span>
    );
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Members Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage church members and their profiles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add New Member
        </button>
      </div>

      {error && (
        <div className={`p-3 ${
          error.includes('successfully') 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-current hover:opacity-70">
              ×
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            {editingMember ? 'Edit Member' : 'Add New Member'}
          </h3>
          <form onSubmit={editingMember ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingMember || usersLoading}
                  className="w-full px-2 py-1.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select user account</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} - {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
                {usersLoading && <p className="text-xs text-gray-500 mt-1">Loading users...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  placeholder="Middle name"
                  className="w-full px-2 py-1.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  placeholder="Mobile number"
                  className="w-full px-2 py-1.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-2 py-1.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.image && <p className="text-xs text-green-600 mt-1">Selected: {formData.image.name}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Is Active
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (editingMember ? 'Update Member' : 'Create Member')}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={loading}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-x-auto">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-100 dark:bg-blue-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Date Joined
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 overflow-hidden bg-gray-200 flex items-center justify-center">
                        {member.image ? (
                          <img
                            width={32}
                            height={32}
                            src={member.image}
                            alt={member.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs font-medium">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900 text-sm dark:text-white">
                          {member.full_name}
                        </span>
                        <span className="block text-gray-500 text-xs dark:text-gray-400">
                          First: {member.first_name} | Last: {member.last_name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>
                      <div>{member.email}</div>
                      <div className="text-gray-500 text-xs dark:text-gray-400">
                        {member.mobile_number || 'No phone'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge color={member.role === 'admin' ? 'warning' : 'success'}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge color={member.is_active ? 'success' : 'error'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(member.date_joined)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(member)}
                        disabled={loading}
                        className="px-2 py-1 bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(member)}
                        disabled={loading}
                        className="px-2 py-1 bg-yellow-600 text-white text-xs hover:bg-yellow-700 disabled:opacity-50"
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={loading}
                        className="px-2 py-1 bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50"
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

      {members.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No members found. Create the first member to get started.
        </div>
      )}
    </div>
  );
};

export default MembersTable;