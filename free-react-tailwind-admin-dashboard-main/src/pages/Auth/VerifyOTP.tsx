import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { apiService, type ApiError } from "../../services/api";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Get email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/request-password-reset');
    }
  }, [location, navigate]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numbers and empty string
    if (value && !/^\d+$/.test(value)) return;
    
    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is entered and not the last input
    if (value !== "" && index < 5) {
      setFocusedIndex(index + 1);
    }

    // Auto-submit when last digit is filled
    if (value !== "" && index === 5) {
      const otpString = newOtp.join('');
      if (otpString.length === 6) {
        setTimeout(() => {
          handleAutoSubmit(otpString);
        }, 100);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Move to previous input on backspace when current is empty
        e.preventDefault();
        setFocusedIndex(index - 1);
      } else if (otp[index]) {
        // Clear current input but stay in the same field
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    // Handle arrow keys
    else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      setFocusedIndex(index + 1);
    }
    // Handle number input
    else if (e.key >= '0' && e.key <= '9' && index < 5) {
      // If current input already has a value and user types a new number,
      // move to next input and set the value
      if (otp[index] !== "" && e.key !== "") {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index] = e.key;
        setOtp(newOtp);
        setFocusedIndex(index + 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedNumbers = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    const newOtp = [...otp];
    pastedNumbers.forEach((num, index) => {
      if (index < 6) {
        newOtp[index] = num;
      }
    });
    
    setOtp(newOtp);
    
    // Focus the last filled input
    const lastFilledIndex = Math.min(pastedNumbers.length - 1, 5);
    setFocusedIndex(lastFilledIndex);
    
    // Auto-submit if all digits are filled
    if (pastedNumbers.length === 6) {
      setTimeout(() => {
        handleAutoSubmit(pastedNumbers.join(''));
      }, 100);
    }
  };

  const handleAutoSubmit = async (otpString: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await apiService.verifyOTP({ email, otp: otpString });
      navigate('/reset-password', { state: { email, otp: otpString } });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "OTP verification failed. Please try again.");
      
      // Focus back to first input on error
      setFocusedIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      // Focus first empty input
      const firstEmptyIndex = otp.findIndex(digit => digit === "");
      setFocusedIndex(firstEmptyIndex === -1 ? 0 : firstEmptyIndex);
      return;
    }

    await handleAutoSubmit(otpString);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);

    try {
      await apiService.requestPasswordReset({ email });
      setSuccess("New OTP sent to your email!");
      
      // Reset OTP and focus first input
      setOtp(["", "", "", "", "", ""]);
      setFocusedIndex(0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/request-password-reset"
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
              Verify OTP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the 6-digit OTP sent to <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              {success}
            </div>
          )}

          <form onSubmit={handleVerifyOTP}>
            <div className="space-y-6">
              <div>
                <Label>Enter OTP <span className="text-error-500">*</span></Label>
                <div className="flex justify-between gap-2">
                  {otp.map((data, index) => (
                    <Input
                      key={index}
                      className="w-12 h-12 text-lg text-center otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={data}
                      onChange={(e) => handleOtpChange(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      disabled={isLoading}
                      required
                      autoFocus={index === focusedIndex}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
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
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full" 
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={isResending}
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Didn't receive the OTP? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}