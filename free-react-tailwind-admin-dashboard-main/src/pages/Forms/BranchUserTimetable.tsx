import { useState, useEffect, useCallback } from 'react';

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

const BranchTimetables = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [collages, setCollages] = useState<Collage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCollage, setFilterCollage] = useState('');

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
      console.error('Failed to fetch timetables');
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
      console.error('Failed to fetch collages');
    }
  }, []);

  useEffect(() => {
    fetchTimetables();
    fetchCollages();
  }, [fetchTimetables, fetchCollages]);

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
    } catch {
      console.error('Failed to download document');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        {/* Header and Filters */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">College Timetables</h1>
                <p className="text-gray-600 dark:text-gray-300">View college timetable schedules</p>
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
                        <span className="text-blue-600 dark:text-blue-400">
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
                        <p className="text-sm">No timetables available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchTimetables;