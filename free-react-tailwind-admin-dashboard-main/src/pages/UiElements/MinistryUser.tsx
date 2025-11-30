import { useState, useEffect } from 'react';

interface Ministry {
  id: number;
  ministry_name: string;
  services: string;
  performance: string;
  created_at: string;
  updated_at: string;
}

interface MinistryInfo {
  id: number;
  ministry_name: string;
  services: string;
  performance: string;
  ministry_members: string;
  ministry_assets: string;
  ministry_orders: string;
  costs_per_ministry: string;
  pdf_report: string;
  download_url?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const Ministries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [ministryInfos, setMinistryInfos] = useState<MinistryInfo[]>([]);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedMinistryInfo, setSelectedMinistryInfo] = useState<MinistryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchMinistries();
    fetchMinistryInfos();
  }, []);

  const fetchMinistries = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ministries/`);
      const data: ApiResponse<Ministry> = await response.json();
      setMinistries(data.results);
    } catch (error) {
      console.error('Error fetching ministries:', error);
    }
  };

  const fetchMinistryInfos = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ministry-infos/`);
      const data: ApiResponse<MinistryInfo> = await response.json();
      setMinistryInfos(data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ministry information:', error);
      setLoading(false);
    }
  };

  const handleViewMinistryInfo = (info: MinistryInfo) => {
    setSelectedMinistryInfo(info);
    setOpenInfoModal(true);
  };

  const handleDownloadReport = async (ministryInfo: MinistryInfo) => {
    try {
      if (ministryInfo.download_url) {
        window.open(ministryInfo.download_url, '_blank');
      } else if (ministryInfo.pdf_report) {
        const response = await fetch(`${API_BASE}/api/ministry-infos/${ministryInfo.id}/download_report/`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ministry_report_${ministryInfo.ministry_name}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const filteredMinistryInfos = filter === 'all' 
    ? ministryInfos 
    : ministryInfos.filter(info => info.ministry_name === filter);

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
      {/* Ministry Info View Modal */}
      {openInfoModal && selectedMinistryInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl max-w-4xl w-full max-h-[75vh] overflow-y-auto">
            <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Ministry Information</h3>
              <button 
                className="text-white hover:text-indigo-200 text-2xl"
                onClick={() => setOpenInfoModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Basic Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Ministry Name</label>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedMinistryInfo.ministry_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Services</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.services}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Performance</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.performance || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financial</h4>
                    <div className="bg-blue-50 dark:bg-blue-900 p-4">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Costs</label>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {parseFloat(selectedMinistryInfo.costs_per_ministry).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Team & Resources</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Members</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.ministry_members || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Assets</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.ministry_assets || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Orders</label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedMinistryInfo.ministry_orders || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  {selectedMinistryInfo.pdf_report && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Documents</h4>
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 transition duration-200 flex items-center justify-center space-x-2"
                        onClick={() => handleDownloadReport(selectedMinistryInfo)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
                onClick={() => setOpenInfoModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Ministry Management System</h1>
        <p className="text-gray-600 dark:text-gray-300">View ministries and their information</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Ministries</h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{ministries.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Ministry Info</h3>
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{ministryInfos.length}</div>
        </div>
      </div>

      {/* Ministries Table */}
      <div className="bg-white dark:bg-gray-800 shadow mb-8">
        <div className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Ministries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {ministries.map((ministry) => (
                <tr key={ministry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{ministry.ministry_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 dark:text-gray-300 max-w-md truncate">{ministry.services}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                      ministry.performance ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {ministry.performance ? 'Available' : 'Not Set'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ministry Infos Section */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <h2 className="text-xl font-bold">Ministry Information</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white text-gray-800 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="all">All</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.ministry_name}>
                  {ministry.ministry_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Costs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Report</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMinistryInfos.map((info) => (
                <tr key={info.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{info.ministry_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {info.ministry_members || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                      parseFloat(info.costs_per_ministry) > 10000 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {parseFloat(info.costs_per_ministry).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {info.pdf_report ? (
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm font-medium transition duration-200"
                        onClick={() => handleDownloadReport(info)}
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No Report</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        onClick={() => handleViewMinistryInfo(info)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ministries;