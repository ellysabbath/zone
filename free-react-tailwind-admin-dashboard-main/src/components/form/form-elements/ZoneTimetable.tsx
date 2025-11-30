import { useState, useEffect, useCallback } from 'react';

interface District {
  id: number;
  name: string;
  pastor_name: string;
}

interface DistrictTimetable {
  id: number;
  title: string;
  description?: string;
  document: string;
  district: number;
  district_name: string;
  period: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface Filters {
  district: string;
  period: string;
  is_active: string;
}

const districtTimetableService = {
  async getAll(filters?: { district?: number; period?: string; is_active?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.district) params.append('district', filters.district.toString());
    if (filters?.period) params.append('period', filters.period);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const response = await fetch(`http://127.0.0.1:8000/district-timetables/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch timetables');
    const data = await response.json();
    return data.results;
  },

  async download(id: number) {
    const response = await fetch(`http://127.0.0.1:8000/district-timetables/${id}/download/`);
    if (!response.ok) throw new Error('Failed to download document');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async getDistricts(): Promise<District[]> {
    const response = await fetch('http://127.0.0.1:8000/districts/');
    if (!response.ok) throw new Error('Failed to fetch districts');
    const data = await response.json();
    return data.results;
  }
};

export default function DistrictTimetableManagement() {
  const [timetables, setTimetables] = useState<DistrictTimetable[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    district: '',
    period: '',
    is_active: ''
  });

  const loadTimetables = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const filterParams: { district?: number; period?: string; is_active?: boolean } = {};
      if (filters.district) filterParams.district = parseInt(filters.district);
      if (filters.period) filterParams.period = filters.period;
      if (filters.is_active) filterParams.is_active = filters.is_active === 'true';
      
      const data = await districtTimetableService.getAll(filterParams);
      setTimetables(data);
    } catch {
      console.error('Failed to load timetables');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDistricts = useCallback(async (): Promise<void> => {
    try {
      const data = await districtTimetableService.getDistricts();
      setDistricts(data);
    } catch {
      console.error('Failed to load districts');
    }
  }, []);

  useEffect(() => {
    loadTimetables();
    loadDistricts();
  }, [loadTimetables, loadDistricts]);

  const handleDownload = async (id: number): Promise<void> => {
    try {
      await districtTimetableService.download(id);
    } catch {
      console.error('Download failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">District Timetables</h1>
                <p className="text-gray-600 dark:text-gray-300">View district timetable schedules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filter Timetables</h3>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Periods</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.is_active}
                  onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : timetables.length === 0 ? (
            <div className="text-center p-8">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📅</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No timetables found</h3>
              <p className="text-gray-500 dark:text-gray-400">No timetables available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">District</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Period</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Date Range</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {timetables.map((timetable, index) => (
                    <tr key={timetable.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white">{timetable.title}</div>
                          {timetable.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {timetable.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {timetable.district_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {timetable.period}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {new Date(timetable.start_date).toLocaleDateString()} - {new Date(timetable.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
                          timetable.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {timetable.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(timetable.id)}
                            className="inline-flex items-center px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                            title="Download"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}