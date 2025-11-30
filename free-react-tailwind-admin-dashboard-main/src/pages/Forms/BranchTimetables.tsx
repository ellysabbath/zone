import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';

interface Collage {
  id: string;
  collage_name: string;
}

interface Timetable {
  id: string;
  title: string;
  description: string;
  document?: string;
  document_url?: string;
  start_date: string;
  end_date: string;
  collage: string;
  collage_name: string;
  is_active: boolean;
}

interface FormData {
  title: string;
  description: string;
  document: File | null;
  start_date: string;
  end_date: string;
  collage: string;
  is_active: boolean;
}

const BranchTimetables = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [collages, setCollages] = useState<Collage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [filterCollage, setFilterCollage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    document: null,
    start_date: '',
    end_date: '',
    collage: '',
    is_active: true
  });

  const fetchTimetables = useCallback(async () => {
    try {
      let url = 'http://127.0.0.1:8000/collage-timetables/';
      if (filterCollage) url += `?collage=${filterCollage}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch timetables');
      const data = await response.json();
      setTimetables(data.results || data);
      setLoading(false);
    } catch {
      setError('Failed to fetch timetables');
      setLoading(false);
    }
  }, [filterCollage]);

  const fetchCollages = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/collages/');
      if (!response.ok) throw new Error('Failed to fetch collages');
      const data = await response.json();
      setCollages(data.results || data);
    } catch {
      setError('Failed to fetch collages');
    }
  }, []);

  useEffect(() => {
    fetchTimetables();
    fetchCollages();
  }, [fetchTimetables, fetchCollages]);

  const handleOpenDialog = (timetable: Timetable | null = null) => {
    if (timetable) {
      setFormData({
        title: timetable.title,
        description: timetable.description || '',
        document: null,
        start_date: timetable.start_date,
        end_date: timetable.end_date,
        collage: timetable.collage,
        is_active: timetable.is_active
      });
      setSelectedTimetable(timetable);
    } else {
      setFormData({
        title: '',
        description: '',
        document: null,
        start_date: '',
        end_date: '',
        collage: '',
        is_active: true
      });
      setSelectedTimetable(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTimetable(null);
    setFormData({
      title: '',
      description: '',
      document: null,
      start_date: '',
      end_date: '',
      collage: '',
      is_active: true
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        document: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('start_date', formData.start_date);
      submitData.append('end_date', formData.end_date);
      submitData.append('collage', formData.collage);
      submitData.append('is_active', formData.is_active.toString());
      
      if (formData.document) submitData.append('document', formData.document);

      const url = selectedTimetable 
        ? `http://127.0.0.1:8000/collage-timetables/${selectedTimetable.id}/`
        : 'http://127.0.0.1:8000/collage-timetables/';

      const options = {
        method: selectedTimetable ? 'PUT' : 'POST',
        body: submitData,
      };

      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Failed to save timetable');

      setSuccessMessage(selectedTimetable ? 'Timetable updated successfully!' : 'Timetable created successfully!');
      handleCloseDialog();
      fetchTimetables();
    } catch {
      setError('Failed to save timetable');
    }
  };

  const handleDeleteClick = (timetable: Timetable) => {
    setSelectedTimetable(timetable);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTimetable) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/collage-timetables/${selectedTimetable.id}/`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete timetable');

      setSuccessMessage('Timetable deleted successfully!');
      setOpenDeleteDialog(false);
      setSelectedTimetable(null);
      fetchTimetables();
    } catch {
      setError('Failed to delete timetable');
    }
  };

  const handleDownload = async (timetable: Timetable) => {
    try {
      let downloadUrl;
      
      if (timetable.document) {
        downloadUrl = `http://127.0.0.1:8000/collage-timetables/${timetable.id}/download/`;
      } else if (timetable.document_url) {
        downloadUrl = timetable.document_url;
      } else {
        throw new Error('No document available');
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to download timetable');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'timetable.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Document downloaded successfully!');
    } catch {
      setError('Failed to download document');
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterCollage(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-700 dark:text-gray-300">Loading timetables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-green-500 text-white px-6 py-4 border-l-4 border-green-600">
              <div className="flex items-center">
                ✓
                {successMessage}
              </div>
            </div>
          </div>
        )}

        {/* Header and Filters */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">College Timetables</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage college timetable schedules</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by College</label>
                  <select
                    value={filterCollage}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Colleges</option>
                    {collages.map((collage) => (
                      <option key={collage.id} value={collage.id}>
                        {collage.collage_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => handleOpenDialog()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2"
                  >
                    +
                    Add Timetable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timetables Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">College</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">End Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Document</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {timetables.map((timetable, index) => (
                  <tr key={timetable.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                      {timetable.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        {timetable.collage_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      {timetable.start_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      {timetable.end_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      {timetable.document && (
                        <span className="text-blue-600 dark:text-blue-400 cursor-pointer">
                          📄 {timetable.document.split('/').pop()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
                        timetable.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {timetable.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {timetable.document && (
                          <button
                            onClick={() => handleDownload(timetable)}
                            className="inline-flex items-center px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                            title="Download"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDialog(timetable)}
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
                {timetables.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">📅</div>
                        <p className="text-lg font-medium mb-2">No timetables found</p>
                        <p className="text-sm">Create your first timetable</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        {openDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[75vh] overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white">
                <h2 className="text-lg font-semibold">
                  {selectedTimetable ? 'Edit Timetable' : 'Create Timetable'}
                </h2>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Timetable title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">College *</label>
                    <select
                      name="collage"
                      value={formData.collage}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select College</option>
                      {collages.map((collage) => (
                        <option key={collage.id} value={collage.id}>
                          {collage.collage_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Document {selectedTimetable && <span className="text-gray-500 text-sm">(Leave empty to keep current)</span>}
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.document && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {formData.document.name}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      name="is_active"
                      value={formData.is_active.toString()}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {selectedTimetable ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {openDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-red-500 text-white">
                <h2 className="text-lg font-semibold">Confirm Delete</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-red-100 dark:bg-red-900">
                  ⚠️
                </div>
                <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
                  Delete this timetable?
                </p>
                <p className="text-center font-semibold text-gray-800 dark:text-white mb-3">
                  "{selectedTimetable?.title}"
                </p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  This cannot be undone.
                </p>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setOpenDeleteDialog(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-4 py-2 flex items-center">
              ✕
              {error}
              <button onClick={() => setError('')} className="ml-2 hover:opacity-70">
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchTimetables;