import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';

interface ChartData {
  monthly: PeriodData;
  quarterly: PeriodData;
  annual: PeriodData;
}

interface PeriodData {
  categories: string[];
  donations: number[];
  distributions: number[];
  balances: number[];
}

const CharityPerformanceChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [chartType, setChartType] = useState<'grouped' | 'stacked'>('grouped');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Real-time connection states
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE = 'http://localhost:8000';

  // Format labels for better display
  const formatLabels = (categories: string[], periodType: string): string[] => {
    if (!categories || categories.length === 0) return categories;

    return categories.map(category => {
      switch (periodType) {
        case 'monthly':
          if (category.includes('-')) {
            const [year, month] = category.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = parseInt(month, 10) - 1;
            return `${monthNames[monthIndex]} ${year}`;
          }
          return category;
        case 'quarterly':
          if (category.includes('Q')) {
            if (category.includes('-')) {
              const [year, quarter] = category.split('-');
              return `${quarter} ${year}`;
            }
            return category;
          }
          return `Q${category}`;
        case 'annual':
          return category;
        default:
          return category;
      }
    });
  };

  // Real-time data fetching - defined first to avoid dependency issues
  const fetchChartData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/charity-performances/chart_data/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ChartData = await response.json();
      setChartData(data);
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error occurred';
      setError(`Backend Connection Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // WebSocket setup for real-time updates - now includes fetchChartData in dependencies
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/charity-updates/');
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected for chart updates');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'data_update') {
          fetchChartData();
          setSuccessMessage('Chart data updated in real-time!');
        }
      } catch (parseError) {
        console.error('Error parsing WebSocket message:', parseError);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (wsError) => {
      console.error('WebSocket error:', wsError);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [fetchChartData]); // Added fetchChartData as dependency

  // Initial fetch and backup polling (every 5 seconds)
  useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, 5000);
    return () => clearInterval(interval);
  }, [fetchChartData]);

  const handleExportExcel = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/charity-performances/export_excel/`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'charity_performance.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Export feature requires backend connection.');
      }
    } catch (exportError) {
      console.error('Export failed:', exportError);
      alert('Export failed. Please check your backend connection.');
    }
    setMenuOpen(false);
  };

  const getSeriesData = (): Array<{name: string; data: number[]}> => {
    if (!chartData) return [];
    
    const periodData = chartData[selectedPeriod];
    return [
      {
        name: 'Donations Received',
        data: periodData.donations
      },
      {
        name: 'Funds Distributed',
        data: periodData.distributions
      },
      {
        name: 'Net Balance',
        data: periodData.balances
      }
    ];
  };

  // Fixed chart options without the invalid 'easing' property
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: true },
      stacked: chartType === 'stacked',
      background: 'transparent',
      foreColor: '#6B7280',
      animations: { 
        enabled: true,
        speed: 800,
        animateGradually: { 
          enabled: true, 
          delay: 150 
        },
        dynamicAnimation: { 
          enabled: true, 
          speed: 350 
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: chartType === 'stacked' ? '60%' : '45%',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: chartType === 'stacked' ? ['transparent'] : ['#fff']
    },
    xaxis: {
      categories: chartData ? formatLabels(chartData[selectedPeriod].categories, selectedPeriod) : [],
      labels: { 
        style: { colors: '#6B7280' },
        formatter: function(value: string) {
          // For better mobile display
          if (typeof window !== 'undefined' && window.innerWidth < 768 && selectedPeriod === 'monthly') {
            return value.split(' ')[0]; // Show only month abbreviation on mobile
          }
          return value;
        }
      }
    },
    yaxis: {
      title: { text: 'Amount (TZS)' },
      labels: { 
        formatter: (val: number) => {
          if (typeof window !== 'undefined' && window.innerWidth < 768 && val >= 1000000) {
            return `TZS ${(val / 1000000).toFixed(1)}M`;
          }
          if (typeof window !== 'undefined' && window.innerWidth < 768 && val >= 1000) {
            return `TZS ${(val / 1000).toFixed(0)}K`;
          }
          return `TZS ${val.toLocaleString()}`;
        }
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val: number) => `TZS ${val.toLocaleString()}` }
    },
    colors: ['#8884d8', '#82ca9d', '#ffc658'],
    legend: { 
      position: 'top', 
      horizontalAlign: 'center',
      labels: { colors: '#6B7280' }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
    }
  };

  const getSummaryStats = (): { totalDonations: number; totalDistributed: number; totalBalance: number } | null => {
    if (!chartData) return null;
    
    const data = chartData[selectedPeriod];
    const totalDonations = data.donations.reduce((sum, val) => sum + val, 0);
    const totalDistributed = data.distributions.reduce((sum, val) => sum + val, 0);
    const totalBalance = data.balances.reduce((sum, val) => sum + val, 0);

    return { totalDonations, totalDistributed, totalBalance };
  };

  // Clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const summaryStats = getSummaryStats();

  if (loading && !chartData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
          Loading charity data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Charity Performance Overview
        </h2>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
          <div className="flex">
            <div className="ml-2">
              <h3 className="text-xs font-medium text-red-800 dark:text-red-300">
                Connection Failed
              </h3>
              <div className="mt-1 text-xs text-red-700 dark:text-red-400">
                <p>{error}</p>
                <button
                  onClick={fetchChartData}
                  className="mt-2 px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 max-h-[80vh] overflow-auto w-full overflow-x-auto">
      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 mr-2"></div>
            <span className="text-green-700 text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
            <span className="text-blue-700 text-sm">
              {isConnected ? 'Live Connection Active' : 'Using Polling Mode (5s)'}
            </span>
          </div>
          <span className="text-blue-600 text-xs">Last update: {lastUpdate}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Charity Performance
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time chart updates • Live data synchronization
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'quarterly' | 'annual')}
            className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>

          {/* Menu */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <button 
                  onClick={() => { 
                    setChartType(prev => prev === 'grouped' ? 'stacked' : 'grouped'); 
                    setMenuOpen(false); 
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Switch to {chartType === 'grouped' ? 'Stacked' : 'Grouped'}
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to Excel
                </button>
                <button 
                  onClick={() => { fetchChartData(); setMenuOpen(false); }}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData && chartData[selectedPeriod] && chartData[selectedPeriod].categories.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Chart
              options={chartOptions}
              series={getSeriesData()}
              type="bar"
              height={280}
            />
          </div>
          
          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-gray-50 dark:bg-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300">Total Donations</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  TZS {summaryStats.totalDonations.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300">Total Distributed</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  TZS {summaryStats.totalDistributed.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300">Net Balance</p>
                <p className={`text-sm font-semibold ${summaryStats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  TZS {summaryStats.totalBalance.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center min-h-48 bg-gray-50 dark:bg-gray-700">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              No data available
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Data will appear automatically when available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharityPerformanceChart;