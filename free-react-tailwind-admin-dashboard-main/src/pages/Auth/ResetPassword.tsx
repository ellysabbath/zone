import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiService, type ApiError } from "../../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Get email and OTP from navigation state
  useEffect(() => {
    if (location.state?.email && location.state?.otp) {
      setEmail(location.state.email);
      setOtp(location.state.otp);
    } else {
      // If no email/OTP, redirect back
      navigate('/request-password-reset');
    }
  }, [location, navigate]);

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

    // Validation
    if (!formData.new_password || !formData.confirm_password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.new_password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fix: Use the correct property names expected by the API
      await apiService.confirmPasswordReset({
        email,
        otp,
        new_password: formData.new_password,
        new_password_confirm: formData.confirm_password, // Changed from confirm_password to new_password_confirm
      });
      
      // Redirect to signin with success message
      navigate('/signin', { 
        state: { message: "Password reset successfully! Please sign in with your new password." } 
      });
      
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.details) {
        const fieldErrors = Object.values(apiError.details).flat();
        setError(fieldErrors[0] || apiError.message);
      } else if (apiError.errors) {
        const fieldErrors = Object.values(apiError.errors).flat();
        setError(fieldErrors[0] || apiError.message);
      } else {
        setError(apiError.message || "Password reset failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/verify-otp"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a new password for your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  New Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder="Enter new password (min. 8 characters)"
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div>
                <Label>
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>
              
              <div>
                <Button 
                  type="submit"
                  className="w-full" 
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Remember your password? {""}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}