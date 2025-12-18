import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accessRequestApplicationService from '../services/accessRequestApplicationService';

interface ValidationError {
  fieldId: string;
  message: string;
}

export const useEmailVerification = (email: string) => {
  const navigate = useNavigate();
  const [authCode, setAuthCode] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  const validateCode = (code: string): boolean => {
    const newErrors: ValidationError[] = [];

    if (!code.trim()) {
      newErrors.push({ fieldId: 'auth-code', message: 'Enter the 6-digit code' });
    } else if (code.length !== 6) {
      newErrors.push({ fieldId: 'auth-code', message: 'Enter a 6-digit code' });
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.push({ fieldId: 'auth-code', message: 'Code must contain only numbers' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const clean = value.replace(/\D/g, '').slice(0, 6);
    setAuthCode(clean);
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const verifyCode = async () => {
    if (!validateCode(authCode)) {
      return false;
    }

    setIsVerifying(true);
    setErrors([]);

    try {
      const response = await accessRequestApplicationService.verifyEmailCode(authCode, email);

      if (response.success) {
        // Navigate to dashboard or appropriate page
        const redirectUrl = response.redirectUrl || '/admin/dashboard';
        navigate(redirectUrl);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setErrors([{ fieldId: 'auth-code', message: errorMessage }]);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    setIsResending(true);
    setShowResendSuccess(false);
    setErrors([]);

    try {
      await accessRequestApplicationService.resendVerificationCode(email);
      setShowResendSuccess(true);
      setAuthCode(''); // Clear the code input

      // Hide success message after 5 seconds
      setTimeout(() => setShowResendSuccess(false), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      setErrors([{ fieldId: 'general', message: errorMessage }]);
    } finally {
      setIsResending(false);
    }
  };

  const getFieldError = (fieldId: string): string => {
    const error = errors.find(err => err.fieldId === fieldId);
    return error ? error.message : '';
  };

  return {
    authCode,
    errors,
    isVerifying,
    isResending,
    showResendSuccess,
    handleCodeChange,
    verifyCode,
    resendCode,
    getFieldError
  };
};
