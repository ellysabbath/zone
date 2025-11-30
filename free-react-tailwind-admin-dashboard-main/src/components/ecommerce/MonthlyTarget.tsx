import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const chartRef = useRef<ApexCharts | null>(null);

  const API_BASE = 'http://localhost:8000';

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Attractive color palettes for different period views
  const colorPalettes = {
    monthly: [
      '#465FFF', '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#118AB2',
      '#06D6A0', '#EF476F', '#FF9E64', '#7209B7', '#3A86FF', '#FB5607'
    ],
    quarterly: [
      '#465FFF', '#FF6B6B', '#4ECDC4', '#FFD166'
    ],
    annual: [
      '#465FFF', '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#118AB2',
      '#06D6A0', '#EF476F', '#FF9E64', '#7209B7'
    ]
  };

  // Real-time data fetching with auto-refresh
  const fetchChartData = useCallback(async (): Promise<void> => {
    if (!autoRefresh) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/charity-performances/chart_data/`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: ChartData = await response.json();
      setChartData(data);
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error occurred';
      setError(`Backend Connection Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [autoRefresh, API_BASE]);

  // Auto-refresh effect
  useEffect(() => {
    fetchChartData(); // Initial fetch
    
    if (autoRefresh) {
      const interval = setInterval(fetchChartData, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [fetchChartData, autoRefresh]);

  // Export to CSV
  const handleExportCSV = (): void => {
    if (!chartData) return;
    
    const periodData = chartData[selectedPeriod];
    const headers = ['Period', 'Donations (TZS)', 'Distributions (TZS)', 'Balance (TZS)'];
    
    const csvContent = [
      headers.join(','),
      ...periodData.categories.map((category, index) => 
        [
          category,
          periodData.donations[index],
          periodData.distributions[index],
          periodData.balances[index]
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charity_performance_${selectedPeriod}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setMenuOpen(false);
    setSuccessMessage('CSV exported successfully!');
  };

  // Export to PNG
  const handleExportPNG = (): void => {
    if (chartRef.current) {
      const chartElement = document.querySelector('.apexcharts-canvas');
      if (chartElement) {
        // Create a canvas element to draw the chart
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgElement = chartElement.querySelector('svg');
        
        if (svgElement && ctx) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const pngUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `charity_performance_${selectedPeriod}.png`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(pngUrl);
                document.body.removeChild(a);
                setSuccessMessage('PNG exported successfully!');
              }
            });
          };
          
          img.src = url;
        }
      }
    }
    setMenuOpen(false);
  };

  // Export to SVG
  const handleExportSVG = (): void => {
    const chartElement = document.querySelector('.apexcharts-canvas');
    if (chartElement) {
      const svgElement = chartElement.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `charity_performance_${selectedPeriod}.svg`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccessMessage('SVG exported successfully!');
      }
    }
    setMenuOpen(false);
  };

  // Prepare polar chart data based on period view
  const getPolarChartData = (): { series: number[]; options: ApexCharts.ApexOptions } => {
    if (!chartData || !chartData[selectedPeriod]) {
      const defaultData = {
        monthly: {
          series: [8500000, 9200000, 7800000, 9500000, 8800000, 9100000],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        quarterly: {
          series: [26500000, 29800000, 27500000, 31000000],
          labels: ['Q1', 'Q2', 'Q3', 'Q4']
        },
        annual: {
          series: [98500000, 112000000, 105000000, 124000000, 98000000],
          labels: ['2020', '2021', '2022', '2023', '2024']
        }
      };

      const data = defaultData[selectedPeriod];
      const currentColors = colorPalettes[selectedPeriod];

      return {
        series: data.series,
        options: {
          chart: {
            type: 'polarArea' as const,
            height: 380,
            fontFamily: "Outfit, sans-serif",
            background: 'transparent',
            foreColor: isDarkMode ? '#E5E7EB' : '#374151',
            animations: {
              enabled: true,
              speed: 800,
            }
          },
          labels: data.labels,
          colors: currentColors.slice(0, data.series.length),
          stroke: {
            colors: isDarkMode ? ['#1F2937'] : ['#fff'],
            width: 2
          },
          fill: {
            opacity: 0.9
          },
          yaxis: {
            show: false
          },
          legend: {
            position: 'bottom' as const,
            labels: {
              colors: isDarkMode ? '#E5E7EB' : '#6B7280',
              useSeriesColors: false
            }
          },
          plotOptions: {
            polarArea: {
              rings: {
                strokeWidth: 1,
                strokeColor: isDarkMode ? '#374151' : '#E4E7EC'
              },
              spokes: {
                strokeWidth: 1,
                connectorColors: isDarkMode ? '#374151' : '#E4E7EC'
              }
            }
          },
          theme: {
            mode: isDarkMode ? 'dark' : 'light'
          },
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '11px',
              fontWeight: '600',
              colors: isDarkMode ? ['#E5E7EB'] : ['#1D2939']
            },
            formatter: function(val: number) {
              if (val >= 1000000) {
                return `TZS ${(val / 1000000).toFixed(1)}M`;
              } else if (val >= 1000) {
                return `TZS ${(val / 1000).toFixed(0)}K`;
              }
              return `TZS ${val}`;
            }
          },
          tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            y: {
              formatter: function(val: number) {
                return `TZS ${val.toLocaleString()}`;
              }
            }
          }
        }
      };
    }

    const currentData = chartData[selectedPeriod];
    const series = currentData.donations;
    const labels = currentData.categories;
    const currentColors = colorPalettes[selectedPeriod];

    return {
      series: series,
      options: {
        chart: {
          type: 'polarArea' as const,
          height: 380,
          fontFamily: "Outfit, sans-serif",
          background: 'transparent',
          foreColor: isDarkMode ? '#E5E7EB' : '#374151',
          animations: {
            enabled: true,
            speed: 800,
          }
        },
        labels: labels,
        colors: currentColors.slice(0, series.length),
        stroke: {
          colors: isDarkMode ? ['#1F2937'] : ['#fff'],
          width: 2
        },
        fill: {
          opacity: 0.9
        },
        yaxis: {
          show: false
        },
        legend: {
          position: 'bottom' as const,
          labels: {
            colors: isDarkMode ? '#E5E7EB' : '#6B7280',
            useSeriesColors: false
          }
        },
        plotOptions: {
          polarArea: {
            rings: {
              strokeWidth: 1,
              strokeColor: isDarkMode ? '#374151' : '#E4E7EC'
            },
            spokes: {
              strokeWidth: 1,
              connectorColors: isDarkMode ? '#374151' : '#E4E7EC'
            }
          }
        },
        theme: {
          mode: isDarkMode ? 'dark' : 'light'
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '11px',
            fontWeight: '600',
            colors: isDarkMode ? ['#E5E7EB'] : ['#1D2939']
          },
          formatter: function(val: number) {
            if (val >= 1000000) {
              return `TZS ${(val / 1000000).toFixed(1)}M`;
            } else if (val >= 1000) {
              return `TZS ${(val / 1000).toFixed(0)}K`;
            }
            return `TZS ${val}`;
          }
        },
        tooltip: {
          theme: isDarkMode ? 'dark' : 'light',
          y: {
            formatter: function(val: number) {
              return `TZS ${val.toLocaleString()}`;
            }
          }
        }
      }
    };
  };

  const polarChartData = getPolarChartData();

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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Charity Performance Overview
        </h2>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
          <div className="flex">
            <div className="ml-2">
              <h3 className="text-xs font-medium text-red-800 dark:text-red-300">
                Connection Failed
              </h3>
              <div className="mt-1 text-xs text-red-700 dark:text-red-400">
                <p>{error}</p>
                <button
                  onClick={fetchChartData}
                  className="mt-2 px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded"
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">
      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 mr-2"></div>
            <span className="text-green-700 dark:text-green-300 text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Auto-refresh Toggle */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              {autoRefresh ? 'Auto-refresh: ON (3s)' : 'Auto-refresh: OFF'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 text-xs rounded ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {autoRefresh ? 'Stop' : 'Start'} Auto-refresh
            </button>
            <span className="text-blue-600 dark:text-blue-400 text-xs">Last: {lastUpdate}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Charity Performance
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Polar Chart View • {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Data
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'quarterly' | 'annual')}
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>

          {/* Menu */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 rounded z-10">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to CSV
                </button>
                <button 
                  onClick={handleExportPNG}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Export to PNG
                </button>
                <button 
                  onClick={handleExportSVG}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Export to SVG
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

      {/* Polar Chart */}
      {chartData && chartData[selectedPeriod] && chartData[selectedPeriod].categories.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Chart
              options={polarChartData.options}
              series={polarChartData.series}
              type="polarArea"
              height={380}
            />
          </div>
          
          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Total Donations</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(summaryStats.totalDonations)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Total Distributed</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(summaryStats.totalDistributed)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Net Balance</p>
                <p className={`text-sm font-semibold mt-1 ${
                  summaryStats.totalBalance >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(summaryStats.totalBalance)}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center min-h-48 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              No data available
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {autoRefresh ? 'Data will appear automatically when available' : 'Enable auto-refresh to load data'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharityPerformanceChart;