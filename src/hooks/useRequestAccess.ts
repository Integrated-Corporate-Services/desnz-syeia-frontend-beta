import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accessRequestApplicationService from '../services/accessRequestApplicationService';
import type { RequestAccessRequest } from '../types/requestAccess';

interface ValidationError {
  fieldId: string;
  message: string;
}

export const useRequestAccess = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  const validateForm = (formData: RequestAccessRequest): boolean => {
    const newErrors: ValidationError[] = [];

    if (!formData.fullName.trim()) {
      newErrors.push({ fieldId: 'full-name', message: 'Enter your full name' });
    }

    if (!formData.email.trim()) {
      newErrors.push({ fieldId: 'email', message: 'Enter your email address' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.push({ fieldId: 'email', message: 'Enter a valid email address' });
      }
    }

    // TODO: Address validation is currently disabled. Uncomment and test when address fields are required
    // if (!formData.line1?.trim()) {
    //   newErrors.push({ fieldId: 'line1', message: 'Enter address line 1' });
    // }
    //
    // if (!formData.town?.trim()) {
    //   newErrors.push({ fieldId: 'town', message: 'Enter a town or city' });
    // }
    //
    // if (!formData.country?.trim()) {
    //   newErrors.push({ fieldId: 'country', message: 'Enter a country' });
    // }
    //
    // if (!formData.postCode?.trim()) {
    //   newErrors.push({ fieldId: 'post-code', message: 'Enter a postcode' });
    // }

    if (!formData.organisations || formData.organisations.length === 0) {
      newErrors.push({ fieldId: 'organisations', message: 'Select at least one organisation' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const submitRequestAccess = async (formData: RequestAccessRequest) => {
    if (!validateForm(formData)) {
      return false;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await accessRequestApplicationService.submitRequestAccess(formData);

      if (response.success && response.referenceNumber) {
        setReferenceNumber(response.referenceNumber);
        navigate('/sent-for-approval', {
          state: { referenceNumber: response.referenceNumber }
        });
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors([{ fieldId: 'general', message: errorMessage }]);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errors,
    referenceNumber,
    validateForm,
    submitRequestAccess,
    setErrors
  };
};
