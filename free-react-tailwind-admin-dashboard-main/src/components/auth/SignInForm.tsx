// src/components/auth/SignInForm.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { apiService, type LoginRequest, type ApiError } from "../../services/api";
import { useAuth } from "../../context/AuthContext"; 

export default function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get the login function from auth context
  
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Check for success message from registration
  const successMessage = location.state?.message;

  // Get the intended destination from navigation state or default to dashboard
  const from = ((location.state as { from?: { pathname: string } })?.from?.pathname) || '/profile';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };

  const extractErrorMessage = (error: ApiError): string => {
    // Handle non-field errors first
    if (error.non_field_errors && error.non_field_errors.length > 0) {
      return error.non_field_errors[0];
    }
    
    // Handle field-specific errors
    if (error.details) {
      const fieldErrors = Object.values(error.details).flat();
      if (fieldErrors.length > 0) {
        return fieldErrors[0];
      }
    }
    
    if (error.errors) {
      const fieldErrors = Object.values(error.errors).flat();
      if (fieldErrors.length > 0) {
        return fieldErrors[0];
      }
    }
    
    // Handle specific error messages
    if (error.message.includes('not active') || error.message.includes('verify your email')) {
      return 'Account is not active. Please verify your email first.';
    }
    
    if (error.message.includes('Invalid username or password')) {
      return 'Invalid username or password. Please try again.';
    }
    
    // Default error message
    return error.message || "Login failed. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginRequest = {
        username: formData.username.trim(),
        password: formData.password,
      };

      const response = await apiService.login(loginData);
      
      // Double-check that user is active (backend should have already handled this)
      if (!response.user.is_active) {
        setError("Your account is not active. Please verify your email first.");
        return;
      }
      
      // ✅ CRITICAL: Update the auth context with user data
      login(response.user);
      
      // Successful login - redirect to intended destination or dashboard
      navigate(from, { 
        replace: true,
        state: { 
          message: `Welcome back, ${response.user.first_name}!` 
        } 
      });
      
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = extractErrorMessage(apiError);
      setError(errorMessage);
      
      // Clear form on certain errors for security
      if (errorMessage.includes('Invalid username or password')) {
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to home
        </Link>
      </div>
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in!
            </p>
          </div>

          {/* Success message from registration */}
          {successMessage && (
            <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">
                Username <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={isLoading}
                required
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use the username sent to your email after registration
              </p>
            </div>

            <div>
              <Label htmlFor="password">
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="remember-me"
                  checked={isChecked} 
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <label 
                  htmlFor="remember-me"
                  className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400 cursor-pointer"
                >
                  Keep me logged in
                </label>
              </div>
              <Link
                to="/request-password-reset"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <div>
              <Button 
                type="submit"
                className="w-full" 
                size="sm"
                disabled={isLoading || !formData.username.trim() || !formData.password.trim()}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account? {""}
              <Link
                to="/signup"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Help section */}
          <div className="p-4 mt-6 text-sm text-gray-600 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-400">
            <h4 className="mb-2 font-medium">Need help signing in?</h4>
            <ul className="space-y-1 text-xs">
              <li>• Make sure your account is verified via email</li>
              <li>• Check your username and password</li>
              <li>• Use the &quot;Forgot password&quot; link if needed</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}