import React, { useState, useEffect, useCallback } from 'react';
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface CharityRecord {
  id?: number;
  period_type: 'monthly' | 'quarterly' | 'annual';
  period_label: string;
  period_date: string;
  donations_received: number;
  funds_distributed: number;
  current_period_balance?: number;
  period_display?: string;
}

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

const StatisticsChart: React.FC = () => {
  const [charityData, setCharityData] = useState<CharityRecord[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  const [isConnected, setIsConnected] = useState<boolean>(false);

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

  // Screen size detection
  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time data fetching with proper dependencies
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const [recordsResponse, chartResponse] = await Promise.all([
        fetch(`${API_BASE}/charity-performances/`),
        fetch(`${API_BASE}/charity-performances/chart_data/`)
      ]);

      if (!recordsResponse.ok || !chartResponse.ok) throw new Error('Failed to fetch data');
      
      const recordsData = await recordsResponse.json();
      const chartDataResponse: ChartData = await chartResponse.json();
      
      setCharityData(recordsData.results || []);
      setChartData(chartDataResponse);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // WebSocket setup for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/charity-updates/');
    
    ws.onopen = (): void => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event: MessageEvent): void => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'data_update') {
          // Refresh data when update is received
          fetchData();
        }
      } catch (parseError) {
        console.error('Error parsing WebSocket message:', parseError);
      }
    };

    ws.onclose = (): void => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (wsError: Event): void => {
      console.error('WebSocket error:', wsError);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [fetchData]);

  // Initial fetch and backup polling (every 5 seconds)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getChartOptions = (): ApexOptions => {
    const isMobile = screenSize === 'mobile';
    const isTablet = screenSize === 'tablet';

    const currentCategories = chartData ? chartData[selectedPeriod]?.categories || [] : [];
    const formattedCategories = formatLabels(currentCategories, selectedPeriod);

    return {
      legend: {
        show: true,
        position: isMobile ? "bottom" : "top",
        horizontalAlign: "center",
        labels: { colors: '#6B7280' },
        fontSize: isMobile ? '12px' : '14px',
      },
      colors: ["#465FFF", "#82ca9d", "#ffc658"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: isMobile ? 300 : isTablet ? 350 : 400,
        type: "line",
        toolbar: { show: true },
        zoom: { enabled: !isMobile },
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
      stroke: { 
        curve: "smooth" as const, 
        width: isMobile ? 2 : 3 
      },
      markers: { size: isMobile ? 3 : 5 },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: {
        shared: true,
        y: { 
          formatter: (val: number) => `TZS ${val ? val.toLocaleString() : '0'}` 
        }
      },
      xaxis: {
        type: "category" as const,
        categories: formattedCategories,
        labels: {
          style: { colors: '#6B7280', fontSize: isMobile ? '10px' : '12px' },
          rotate: isMobile ? -45 : 0,
        }
      },
      yaxis: {
        labels: {
          style: { fontSize: isMobile ? "10px" : "12px", colors: ["#6B7280"] },
          formatter: (val: number) => {
            if (isMobile && val >= 1000000) return `TZS ${(val / 1000000).toFixed(1)}M`;
            if (isMobile && val >= 1000) return `TZS ${(val / 1000).toFixed(0)}K`;
            return `TZS ${val ? val.toLocaleString() : '0'}`;
          }
        }
      },
    };
  };

  const chartSeries = chartData ? [
    { name: "Donations", data: chartData[selectedPeriod]?.donations || [] },
    { name: "Distributions", data: chartData[selectedPeriod]?.distributions || [] },
    { name: "Net Balance", data: chartData[selectedPeriod]?.balances || [] }
  ] : [
    { name: "Donations", data: [] },
    { name: "Distributions", data: [] },
    { name: "Net Balance", data: [] }
  ];

  // Clear error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading && charityData.length === 0) {
    return (
      <div className="border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading charity data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03] max-h-[80vh] overflow-y-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 mr-2"></div>
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500">×</button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-green-700 text-sm">
              {isConnected ? 'Live Connection Active' : 'Using Polling Mode'}
            </span>
          </div>
          <span className="text-blue-600 text-xs">Last update: {lastUpdate}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Charity Performance</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-500">Live View</span>
            </div>
          </div>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Real-time updates • View-only mode
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'quarterly' | 'annual')}
            className="w-full sm:w-auto border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 w-full">
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <Chart 
            options={getChartOptions()} 
            series={chartSeries} 
            type="line" 
            height={screenSize === 'mobile' ? 300 : screenSize === 'tablet' ? 350 : 400}
            width="100%"
          />
        </div>
      </div>

      {/* Summary Stats */}
      {chartData && chartData[selectedPeriod] && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Donations</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              TZS {chartData[selectedPeriod].donations.reduce((sum, val) => sum + val, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Distributed</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              TZS {chartData[selectedPeriod].distributions.reduce((sum, val) => sum + val, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Net Balance</p>
            <p className={`text-lg font-semibold ${chartData[selectedPeriod].balances.reduce((sum, val) => sum + val, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              TZS {chartData[selectedPeriod].balances.reduce((sum, val) => sum + val, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
          Live Data ({charityData.length} records)
        </h4>
        
        {charityData.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Donations</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Distributions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
                {charityData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white capitalize">{record.period_type}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium">{record.period_label}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        TZS {parseFloat(record.donations_received.toString()).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span className="font-mono text-green-600 dark:text-green-400">
                        TZS {parseFloat(record.funds_distributed.toString()).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700">
            <p className="text-gray-600 dark:text-gray-300">No charity records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsChart;