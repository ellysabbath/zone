// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, type BasicUser } from '../services/api';

interface AuthContextType {
  user: BasicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: BasicUser) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Safe logout function using public methods
  const safeLogout = () => {
    // Use public method to clear auth tokens
    if ('setAuthTokens' in apiService && typeof apiService.setAuthTokens === 'function') {
      (apiService.setAuthTokens as (tokens: null) => void)(null);
    } else {
      // Fallback: clear tokens from storage directly
      localStorage.removeItem('authTokens');
      sessionStorage.removeItem('authTokens');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = apiService.getCurrentUser();
        const isAuth = apiService.isAuthenticated();
        
        if (isAuth && currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
          safeLogout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        safeLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: BasicUser) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    safeLogout();
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role || 'user');
  };

  const value = {
    user,
    isAuthenticated: !!user && apiService.isAuthenticated(),
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the hook with a different name and export with alias
// This fixes the Fast Refresh error
const useAuthHook = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export { useAuthHook as useAuth };
