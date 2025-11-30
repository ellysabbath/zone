import { useState, useEffect } from 'react';

interface APTEC {
  id: number;
  name: string;
  mobile: string;
  name_collage: string;
  name_member: string;
  talent_member: string;
  created_at: string;
  updated_at: string;
}

interface APTEC_MISSION {
  id: number;
  title_mission: string;
  description: string;
  cost: string;
  success_expected: string;
  location_expected: string;
  list_members_expected: string;
  role_per_member: string;
  success_reached: string;
  assets_required: string;
  aptec_group: number | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type DeleteTarget = APTEC | APTEC_MISSION | null;
type DeleteType = 'aptec' | 'mission';

// Type guards
const isAPTEC = (item: DeleteTarget): item is APTEC => {
  return item !== null && 'name' in item;
};

const isAPTEC_MISSION = (item: DeleteTarget): item is APTEC_MISSION => {
  return item !== null && 'title_mission' in item;
};

const APTEC = () => {
  const [aptecData, setAptecData] = useState<APTEC[]>([]);
  const [missionData, setMissionData] = useState<APTEC_MISSION[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMissionDialog, setOpenMissionDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<APTEC_MISSION | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingAptec, setEditingAptec] = useState<APTEC | null>(null);
  const [editingMission, setEditingMission] = useState<APTEC_MISSION | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleteType, setDeleteType] = useState<DeleteType>('aptec');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'aptec' | 'mission'>('aptec');

  const [aptecForm, setAptecForm] = useState({
    name: '',
    mobile: '',
    name_collage: '',
    name_member: '',
    talent_member: ''
  });

  const [missionForm, setMissionForm] = useState({
    title_mission: '',
    description: '',
    cost: '',
    success_expected: '',
    location_expected: '',
    list_members_expected: '',
    role_per_member: '',
    success_reached: '',
    assets_required: '',
    aptec_group: null as number | null
  });

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchAPTECData();
    fetchMissionData();
  }, []);

  const fetchAPTECData = async () => {
    try {
      const response = await fetch(`${API_BASE}/aptec/`);
      const data: ApiResponse<APTEC> = await response.json();
      setAptecData(data.results);
    } catch (error) {
      console.error('Error fetching APTEC data:', error);
    }
  };

  const fetchMissionData = async () => {
    try {
      const response = await fetch(`${API_BASE}/aptec-mission/`);
      const data: ApiResponse<APTEC_MISSION> = await response.json();
      setMissionData(data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mission data:', error);
      setLoading(false);
    }
  };

  const handleCreateAPTEC = async () => {
    try {
      const response = await fetch(`${API_BASE}/aptec/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptecForm)
      });
      if (response.ok) {
        const newAPTEC: APTEC = await response.json();
        setAptecData(prev => [...prev, newAPTEC]);
        resetForms();
        setOpenDialog(false);
        showSuccess('APTEC group created successfully!');
      }
    } catch (error) {
      console.error('Error creating APTEC:', error);
    }
  };

  const handleUpdateAPTEC = async () => {
    if (!editingAptec) return;
    try {
      const response = await fetch(`${API_BASE}/aptec/${editingAptec.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptecForm)
      });
      if (response.ok) {
        const updatedAPTEC: APTEC = await response.json();
        setAptecData(prev => prev.map(a => a.id === updatedAPTEC.id ? updatedAPTEC : a));
        resetForms();
        setOpenDialog(false);
        showSuccess('APTEC group updated successfully!');
      }
    } catch (error) {
      console.error('Error updating APTEC:', error);
    }
  };

  const handleDeleteAPTEC = async () => {
    if (!deleteTarget || deleteType !== 'aptec') return;
    try {
      const response = await fetch(`${API_BASE}/aptec/${deleteTarget.id}/`, { method: 'DELETE' });
      if (response.ok) {
        setAptecData(prev => prev.filter(a => a.id !== deleteTarget.id));
        setOpenDeleteDialog(false);
        showSuccess('APTEC group deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting APTEC:', error);
    }
  };

  const handleCreateMission = async () => {
    try {
      const response = await fetch(`${API_BASE}/aptec-mission/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionForm)
      });
      if (response.ok) {
        const newMission: APTEC_MISSION = await response.json();
        setMissionData(prev => [...prev, newMission]);
        resetForms();
        setOpenMissionDialog(false);
        showSuccess('Mission created successfully!');
      }
    } catch (error) {
      console.error('Error creating mission:', error);
    }
  };

  const handleUpdateMission = async () => {
    if (!editingMission) return;
    try {
      const response = await fetch(`${API_BASE}/aptec-mission/${editingMission.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionForm)
      });
      if (response.ok) {
        const updatedMission: APTEC_MISSION = await response.json();
        setMissionData(prev => prev.map(m => m.id === updatedMission.id ? updatedMission : m));
        resetForms();
        setOpenMissionDialog(false);
        showSuccess('Mission updated successfully!');
      }
    } catch (error) {
      console.error('Error updating mission:', error);
    }
  };

  const handleDeleteMission = async () => {
    if (!deleteTarget || deleteType !== 'mission') return;
    try {
      const response = await fetch(`${API_BASE}/aptec-mission/${deleteTarget.id}/`, { method: 'DELETE' });
      if (response.ok) {
        setMissionData(prev => prev.filter(m => m.id !== deleteTarget.id));
        setOpenDeleteDialog(false);
        showSuccess('Mission deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };

  const handleViewMission = (mission: APTEC_MISSION) => {
    setSelectedMission(mission);
    setOpenViewModal(true);
  };

  const resetForms = () => {
    setAptecForm({ name: '', mobile: '', name_collage: '', name_member: '', talent_member: '' });
    setMissionForm({
      title_mission: '', description: '', cost: '', success_expected: '',
      location_expected: '', list_members_expected: '', role_per_member: '',
      success_reached: '', assets_required: '', aptec_group: null
    });
    setEditingAptec(null);
    setEditingMission(null);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setOpenSuccessDialog(true);
  };

  const openCreateAPTEC = () => {
    resetForms();
    setEditingAptec(null);
    setOpenDialog(true);
  };

  const openEditAPTEC = (aptec: APTEC) => {
    setAptecForm({
      name: aptec.name,
      mobile: aptec.mobile,
      name_collage: aptec.name_collage,
      name_member: aptec.name_member,
      talent_member: aptec.talent_member
    });
    setEditingAptec(aptec);
    setOpenDialog(true);
  };

  const openCreateMission = () => {
    resetForms();
    setEditingMission(null);
    setOpenMissionDialog(true);
  };

  const openEditMission = (mission: APTEC_MISSION) => {
    setMissionForm({
      title_mission: mission.title_mission,
      description: mission.description,
      cost: mission.cost,
      success_expected: mission.success_expected,
      location_expected: mission.location_expected,
      list_members_expected: mission.list_members_expected,
      role_per_member: mission.role_per_member,
      success_reached: mission.success_reached,
      assets_required: mission.assets_required,
      aptec_group: mission.aptec_group
    });
    setEditingMission(mission);
    setOpenMissionDialog(true);
  };

  const confirmDelete = (target: DeleteTarget, type: DeleteType) => {
    setDeleteTarget(target);
    setDeleteType(type);
    setOpenDeleteDialog(true);
  };

  const handleDelete = () => {
    if (deleteType === 'aptec') {
      handleDeleteAPTEC();
    } else {
      handleDeleteMission();
    }
  };

  // Helper function to get display name for delete confirmation
  const getDeleteDisplayName = () => {
    if (!deleteTarget) return '';
    
    if (deleteType === 'aptec' && isAPTEC(deleteTarget)) {
      return deleteTarget.name;
    } else if (deleteType === 'mission' && isAPTEC_MISSION(deleteTarget)) {
      return deleteTarget.title_mission;
    }
    
    return '';
  };

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
                Delete {getDeleteDisplayName()} {deleteType === 'aptec' ? '- APTEC Group' : '- Mission'}?
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

      {/* Mission View Modal */}
      {openViewModal && selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-4xl w-full max-h-[75vh] overflow-y-auto">
            <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Mission Details</h3>
              <button 
                className="text-white hover:text-indigo-200 text-2xl"
                onClick={() => setOpenViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Mission Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Title</label>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedMission.title_mission}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.description}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Expected Location</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.location_expected}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financial</h4>
                    <div className="bg-blue-50 dark:bg-blue-900 p-4">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Cost</label>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${parseFloat(selectedMission.cost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Team & Resources</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Expected Members</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.list_members_expected}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Roles</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.role_per_member}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Assets Required</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.assets_required}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Success Metrics</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Expected Success</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.success_expected}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Success Reached</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMission.success_reached}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium"
                onClick={() => setOpenViewModal(false)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
                onClick={() => {
                  setOpenViewModal(false);
                  openEditMission(selectedMission);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APTEC Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-2xl w-full max-h-[70vh] overflow-y-auto">
            <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingAptec ? 'Edit APTEC Group' : 'Create APTEC Group'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">APTEC Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={aptecForm.name}
                  onChange={(e) => setAptecForm({ ...aptecForm, name: e.target.value })}
                  placeholder="Enter APTEC group name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">College Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={aptecForm.name_collage}
                    onChange={(e) => setAptecForm({ ...aptecForm, name_collage: e.target.value })}
                    placeholder="Enter college name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={aptecForm.name_member}
                    onChange={(e) => setAptecForm({ ...aptecForm, name_member: e.target.value })}
                    placeholder="Enter member name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={aptecForm.mobile}
                  onChange={(e) => setAptecForm({ ...aptecForm, mobile: e.target.value })}
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Talent</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  value={aptecForm.talent_member}
                  onChange={(e) => setAptecForm({ ...aptecForm, talent_member: e.target.value })}
                  placeholder="Describe member talents"
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
                onClick={editingAptec ? handleUpdateAPTEC : handleCreateAPTEC}
              >
                {editingAptec ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Dialog */}
      {openMissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-4xl w-full max-h-[70vh] overflow-y-auto">
            <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingMission ? 'Edit Mission' : 'Create Mission'}
              </h3>
              <button 
                className="text-white hover:text-indigo-200 text-2xl"
                onClick={() => setOpenMissionDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mission Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={missionForm.title_mission}
                    onChange={(e) => setMissionForm({ ...missionForm, title_mission: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    value={missionForm.description}
                    onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={missionForm.cost}
                    onChange={(e) => setMissionForm({ ...missionForm, cost: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Location *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={missionForm.location_expected}
                    onChange={(e) => setMissionForm({ ...missionForm, location_expected: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Members</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={missionForm.list_members_expected}
                    onChange={(e) => setMissionForm({ ...missionForm, list_members_expected: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roles per Member</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={missionForm.role_per_member}
                    onChange={(e) => setMissionForm({ ...missionForm, role_per_member: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expected Success</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={missionForm.success_expected}
                    onChange={(e) => setMissionForm({ ...missionForm, success_expected: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Success Reached</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={missionForm.success_reached}
                    onChange={(e) => setMissionForm({ ...missionForm, success_reached: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assets Required</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    value={missionForm.assets_required}
                    onChange={(e) => setMissionForm({ ...missionForm, assets_required: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium"
                onClick={() => setOpenMissionDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
                onClick={editingMission ? handleUpdateMission : handleCreateMission}
              >
                {editingMission ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">APTEC UDOM Management System</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage APTEC groups and their missions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-4 px-6 border-b-2 font-medium transition-colors ${
            activeTab === 'aptec'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('aptec')}
        >
          APTEC Groups
        </button>
        <button
          className={`py-4 px-6 border-b-2 font-medium transition-colors ${
            activeTab === 'mission'
              ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('mission')}
        >
          APTEC Missions
        </button>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">APTEC Groups</h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">{aptecData.length}</div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-200"
            onClick={openCreateAPTEC}
          >
            Add New APTEC Group
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">APTEC Missions</h3>
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{missionData.length}</div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 transition duration-200"
            onClick={openCreateMission}
          >
            Add New Mission
          </button>
        </div>
      </div>

      {/* APTEC Groups Table */}
      {activeTab === 'aptec' && (
        <div className="bg-white dark:bg-gray-800 shadow mb-8">
          <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4">
            <h2 className="text-xl font-bold">APTEC Groups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">College</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {aptecData.map((aptec) => (
                  <tr key={aptec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{aptec.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 dark:text-gray-300">{aptec.name_collage}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 dark:text-gray-300">{aptec.name_member}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 dark:text-gray-300">{aptec.mobile || 'Not provided'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          onClick={() => openEditAPTEC(aptec)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          onClick={() => confirmDelete(aptec, 'aptec')}
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
      )}

      {/* Missions Table */}
      {activeTab === 'mission' && (
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4">
            <h2 className="text-xl font-bold">APTEC Missions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {missionData.map((mission) => (
                  <tr key={mission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{mission.title_mission}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        parseFloat(mission.cost) > 10000 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        ${parseFloat(mission.cost).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 dark:text-gray-300">{mission.location_expected}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          onClick={() => handleViewMission(mission)}
                        >
                          View
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                          onClick={() => openEditMission(mission)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          onClick={() => confirmDelete(mission, 'mission')}
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
      )}
    </div>
  );
};

export default APTEC;