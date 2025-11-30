// src/services/api.ts

// Request Interfaces
export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  agree_to_terms: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface PasswordResetConfirmRequest {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirm: string;
}

// Response Interfaces
export interface RegisterResponse {
  message: string;
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
  };
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
    role?: 'admin' | 'user'; // Add role field
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface PasswordResetConfirmResponse {
  success: boolean;
  message: string;
  email?: string;
}

// User Profile Interfaces
export interface UserProfile {
  bio: string | null;
  phone: string | null;
  location: string | null;
  profile_picture: string | null;
  profile_picture_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  country: string | null;
  city_state: string | null;
  postal_code: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FullUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  profile: UserProfile;
  role?: 'admin' | 'user'; // Add role field
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  profile_picture?: File | null;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  country?: string;
  city_state?: string;
  postal_code?: string;
  tax_id?: string;
}

// User Management Interfaces
export interface BasicUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  role?: 'admin' | 'user'; // Add role field
}

export interface UsersListResponse {
  count: number;
  results: BasicUser[];
}

export interface UserActionResponse {
  message: string;
  user: BasicUser;
}

// Error Interface
export interface ApiError {
  message: string;
  details?: Record<string, string[]>;
  status?: number;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://127.0.0.1:8000'; // Use 127.0.0.1 for consistency
  }

  private getCSRFToken(): string | null {
    try {
      // Get CSRF token from cookie
      const name = 'csrftoken';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private getAuthHeaders(isFormData: boolean = false): Record<string, string> {
    const token = localStorage.getItem('access_token');
    const csrfToken = this.getCSRFToken();
    
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
    };

    // Add Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    // Add Authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private extractErrorMessage(data: unknown): string {
    if (!data) return 'An unknown error occurred';
    
    // Handle string responses
    if (typeof data === 'string') {
      return data;
    }
    
    // Handle Django REST Framework error formats
    if (typeof data === 'object' && data !== null) {
      const errorData = data as Record<string, unknown>;
      
      // Check common error field names
      const errorFields = ['detail', 'message', 'error', 'non_field_errors'];
      for (const field of errorFields) {
        if (errorData[field]) {
          if (Array.isArray(errorData[field]) && (errorData[field] as unknown[]).length > 0) {
            return String((errorData[field] as unknown[])[0]);
          }
          return String(errorData[field]);
        }
      }
      
      // Handle field-specific errors
      for (const key in errorData) {
        if (Array.isArray(errorData[key]) && (errorData[key] as unknown[]).length > 0) {
          const firstError = (errorData[key] as unknown[])[0];
          if (typeof firstError === 'string') {
            return `${key}: ${firstError}`;
          }
        } else if (typeof errorData[key] === 'string') {
          return `${key}: ${errorData[key] as string}`;
        }
      }

      // Handle nested errors object
      if (errorData.errors && typeof errorData.errors === 'object') {
        const errors = errorData.errors as Record<string, unknown>;
        for (const key in errors) {
          if (Array.isArray(errors[key]) && (errors[key] as unknown[]).length > 0) {
            return String((errors[key] as unknown[])[0]);
          }
        }
      }
    }
    
    return 'An unexpected error occurred';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      throw {
        message: 'Failed to parse server response',
        status: response.status,
      } as ApiError;
    }

    if (!response.ok) {
      const errorMessage = this.extractErrorMessage(data);
      
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };

      // Add additional error details if available
      if (typeof data === 'object' && data !== null) {
        const errorData = data as Record<string, unknown>;
        if (errorData.details) error.details = errorData.details as Record<string, string[]>;
        if (errorData.errors) error.errors = errorData.errors as Record<string, string[]>;
        if (errorData.non_field_errors) error.non_field_errors = errorData.non_field_errors as string[];
      }

      throw error;
    }

    return data as T;
  }

  // Make request method public so it can be used in components
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const isFormData = options.body instanceof FormData;
    
    const headers = this.getAuthHeaders(isFormData);

    // Merge with options headers
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      body: options.body,
      credentials: 'include', // Important for CSRF and session cookies
    };

    console.log(`API Request: ${config.method} ${url}`, {
      headers: config.headers,
      hasBody: !!config.body
    });

    try {
      const response = await fetch(url, config);
      const result = await this.handleResponse<T>(response);
      console.log(`API Response: ${config.method} ${url}`, result);
      return result;
    } catch (error) {
      console.error(`API Error: ${config.method} ${url}`, error);
      
      // Re-throw API errors as-is
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError) {
        throw {
          message: 'Network error: Unable to connect to server. Please check your internet connection.',
          status: 0,
        } as ApiError;
      }
      
      throw {
        message: 'An unexpected error occurred',
        status: 0,
      } as ApiError;
    }
  }

  public async requestWithAuthRetry<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error: unknown) {
      // If token is expired (401), try to refresh and retry
      const apiError = error as ApiError;
      if (apiError.status === 401 && localStorage.getItem('refresh_token')) {
        try {
          console.log('Token expired, attempting refresh...');
          await this.refreshToken();
          console.log('Token refreshed, retrying request...');
          return await this.request<T>(endpoint, options);
        } catch (refreshError) {
          console.log('Token refresh failed, clearing auth...');
          this.clearAuth();
          window.location.href = '/signin';
          throw refreshError;
        }
      }
      throw error;
    }
  }

  // Authentication Methods
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/api/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/login/', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    this.setAuth(response.tokens.access, response.tokens.refresh, response.user);
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.request<{ message: string }>('/api/logout/', {
        method: 'POST',
      });
      return response;
    } finally {
      this.clearAuth();
    }
  }

  // Password Reset Methods
  async requestPasswordReset(emailData: PasswordResetRequest): Promise<PasswordResetResponse> {
    return this.request<PasswordResetResponse>('/api/password-reset/', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async verifyOTP(otpData: OTPVerifyRequest): Promise<OTPVerifyResponse> {
    return this.request<OTPVerifyResponse>('/api/password-reset/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  }

  async confirmPasswordReset(resetData: PasswordResetConfirmRequest): Promise<PasswordResetConfirmResponse> {
    return this.request<PasswordResetConfirmResponse>('/api/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  // User Profile Methods
  async getUserProfile(): Promise<FullUser> {
    return this.requestWithAuthRetry<FullUser>('/api/profile/');
  }

  async updateUserProfile(profileData: UpdateProfileRequest): Promise<FullUser> {
    const formData = new FormData();
    
    // Append user fields
    if (profileData.first_name) formData.append('first_name', profileData.first_name);
    if (profileData.last_name) formData.append('last_name', profileData.last_name);
    if (profileData.email) formData.append('email', profileData.email);
    
    // Append profile fields
    if (profileData.bio !== undefined) formData.append('bio', profileData.bio || '');
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (profileData.location) formData.append('location', profileData.location);
    if (profileData.profile_picture) formData.append('profile_picture', profileData.profile_picture);
    if (profileData.facebook_url) formData.append('facebook_url', profileData.facebook_url);
    if (profileData.twitter_url) formData.append('twitter_url', profileData.twitter_url);
    if (profileData.linkedin_url) formData.append('linkedin_url', profileData.linkedin_url);
    if (profileData.instagram_url) formData.append('instagram_url', profileData.instagram_url);
    if (profileData.country) formData.append('country', profileData.country);
    if (profileData.city_state) formData.append('city_state', profileData.city_state);
    if (profileData.postal_code) formData.append('postal_code', profileData.postal_code);
    if (profileData.tax_id) formData.append('tax_id', profileData.tax_id);

    return this.requestWithAuthRetry<FullUser>('/api/profile/update/', {
      method: 'PATCH',
      body: formData,
    });
  }

  // Token Management
  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw {
        message: 'No refresh token available',
        status: 401,
      } as ApiError;
    }

    const response = await this.request<{ access: string }>('/api/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    localStorage.setItem('access_token', response.access);
    return response;
  }

  // User Management Methods
  async getUsers(): Promise<UsersListResponse> {
    return this.requestWithAuthRetry<UsersListResponse>('/users/');
  }

  async deactivateUser(userId: number): Promise<UserActionResponse> {
    return this.requestWithAuthRetry<UserActionResponse>('/api/users/deactivate/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async activateUser(userId: number): Promise<UserActionResponse> {
    return this.requestWithAuthRetry<UserActionResponse>('/api/users/activate/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  // Auth Status Methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  getCurrentUser(): BasicUser | null {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Private Helper Methods
  private setAuth(accessToken: string, refreshToken: string, user: BasicUser): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
  }

  // Utility Methods
  checkAuthStatus(): { isAuthenticated: boolean; user: BasicUser | null } {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getCurrentUser(),
    };
  }

  // Initialize auth state on app start
  initializeAuth(): void {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    if (token && user) {
      if (!this.isAuthenticated()) {
        console.log('Token expired, clearing auth...');
        this.clearAuth();
      } else {
        console.log('User is authenticated:', user.email);
      }
    } else {
      console.log('No valid auth found, clearing...');
      this.clearAuth();
    }
  }

  // CSRF Token Methods
  async getCSRFTokenFromServer(): Promise<void> {
    try {
      // Make a GET request to get CSRF token set in cookies
      await this.request('/api/csrf/', {
        method: 'GET',
      });
      console.log('CSRF token retrieved successfully');
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Initialize auth state when module loads
if (typeof window !== 'undefined') {
  apiService.initializeAuth();
  
  // Get CSRF token on app startup
  setTimeout(() => {
    apiService.getCSRFTokenFromServer().catch(console.error);
  }, 1000);
}