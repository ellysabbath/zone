// src/components/auth/SignUpForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { apiService, type RegisterRequest, type ApiError } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from auth context
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isChecked) {
      setError("Please agree to the Terms and Conditions and Privacy Policy");
      return;
    }

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirm) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registerData: RegisterRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        agree_to_terms: isChecked,
      };

      const response = await apiService.register(registerData);
      
      // ✅ NEW: Auto-login after successful registration
      try {
        const loginResponse = await apiService.login({
          username: response.user.username,
          password: formData.password
        });
        
        // ✅ Update auth context with user data
        login(loginResponse.user);
        
        // ✅ Navigate to dashboard with success message
        navigate('/dashboard', { 
          replace: true,
          state: { 
            message: `Welcome, ${response.user.first_name}! Your account has been created successfully.` 
          } 
        });
        
        return; // Exit early since we're navigating away
        
      } catch (loginError) {
        // If auto-login fails, show success message but prompt user to sign in manually
        console.warn('Registration successful but auto-login failed:', loginError);
        setSuccess(response.message || "Registration successful! Please sign in with your credentials.");
        
        // Clear form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          password_confirm: "",
        });
        setIsChecked(false);
      }
      
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.details) {
        // Handle field-specific errors from Django
        const fieldErrors = Object.values(apiError.details).flat();
        setError(fieldErrors[0] || apiError.message);
      } else if (apiError.errors) {
        // Handle nested errors object
        const fieldErrors = Object.values(apiError.errors).flat();
        setError(fieldErrors[0] || apiError.message);
      } else {
        setError(apiError.message || "Registration failed. Please try again.");
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
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
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
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to create an account
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              {/* You can add additional content here if needed */}
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Create your account
                </span>
              </div>
            </div>
            
            {/* Status Messages */}
            {error && (
              <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                {success}
                <div className="mt-2">
                  <Link
                    to="/signin"
                    className="font-medium text-green-900 underline dark:text-green-300 hover:text-green-700"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* First Name */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {/* Last Name */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password (min. 8 characters)"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      disabled={isLoading}
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
                {/* Confirm Password */}
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    className="w-5 h-5 mt-1"
                    checked={isChecked}
                    onChange={setIsChecked}
                    disabled={isLoading}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {/* Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Help section */}
            <div className="p-4 mt-6 text-sm text-gray-600 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-400">
              <h4 className="mb-2 font-medium">After Registration:</h4>
              <ul className="space-y-1 text-xs">
                <li>• You will be automatically logged in</li>
                <li>• Your username will be auto-generated and sent to your email</li>
                <li>• You can update your profile after logging in</li>
                <li>• Contact support if you encounter any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}