import { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

// Define types directly in the component file
interface College {
  total_members?: number;
}

interface District {
  total_members?: number;
  collages?: College[];
  collages_count?: number;
  calculated_total_members?: number;
}

interface ApiResponse {
  results?: District[];
}

export default function DistrictMetrics() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8000';

  // Function to calculate total members from colleges - FIXED TYPES
  const calculateTotalMembers = (district: District): number => {
    if (district.total_members && district.total_members > 0) {
      return district.total_members;
    }
    
    if (district.collages && district.collages.length > 0) {
      return district.collages.reduce((total: number, collage: College) => 
        total + (collage.total_members || 0), 0);
    }
    
    return 0;
  };

  // Wrap fetchDistricts in useCallback to fix the dependency warning
  const fetchDistricts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/districts/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: ApiResponse = await response.json();
      
      // Enhance districts data with calculated total members
      const enhancedDistricts: District[] = (data.results || []).map((district: District) => ({
        ...district,
        calculated_total_members: calculateTotalMembers(district)
      }));
      
      setDistricts(enhancedDistricts);
    } catch (err) {
      // Fix the type error for the error message
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load districts: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]); // Now fetchDistricts is stable due to useCallback

  // Calculate totals across all districts - FIXED TYPES
  const calculateTotals = (): { totalMembers: number; totalColleges: number } => {
    const totalMembers = districts.reduce((total: number, district: District) => 
      total + (district.calculated_total_members || 0), 0);
    const totalColleges = districts.reduce((total: number, district: District) => 
      total + (district.collages_count || 0), 0);
    
    return { totalMembers, totalColleges };
  };

  const { totalMembers, totalColleges } = calculateTotals();

  // Mock growth calculations
  const membersGrowth = 11.01;
  const collegesGrowth = 8.5;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card - Total Members Loading */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700 mb-5"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/4"></div>
            </div>
          </div>
        </div>
        
        {/* Right Card - Total Colleges Loading */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700 mb-5"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 lg:col-span-2">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">Error Loading Data</p>
            <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
            <button
              onClick={fetchDistricts}
              className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Left Card - Total Members */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30 mb-5">
          <GroupIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              TOTAL MEMBERS
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              {totalMembers.toLocaleString()}
            </h4>
          </div>
          
          <div className="flex items-center">
            <Badge color={membersGrowth >= 0 ? "success" : "error"}>
              {membersGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(membersGrowth).toFixed(2)}%
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              vs last period
            </span>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Across {districts.length} zones
            </p>
          </div>
        </div>
      </div>

      {/* Right Card - Total Colleges */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30 mb-5">
          <BoxIconLine className="text-purple-600 size-6 dark:text-purple-400" />
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              TOTAL COLLEGES
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              {totalColleges.toLocaleString()}
            </h4>
          </div>
          
          <div className="flex items-center">
            <Badge color={collegesGrowth >= 0 ? "success" : "error"}>
              {collegesGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(collegesGrowth).toFixed(2)}%
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              vs last period
            </span>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Across {districts.length} zones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}