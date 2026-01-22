import { useState } from 'react';
import userService from '../services/userService';
import { createLogger } from '../utils/logger';
import type { FormData, FieldError } from '../types/common';
import type { UserCreatedData } from '../types/user';

const logger = createLogger('useAddUser');

/**
 * Custom hook for managing add user form data and operations
 * @returns {Object} Add user state and operations
 */
export const useAddUser = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    organisation: '',
    applicantType: 'employee',
    sendWelcomeEmail: true,
    accessReason: '',
    phone: '',
    location: ''
  });

  const [errors, setErrors] = useState<FieldError[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? target.checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors.length > 0) {
      setErrors(prev => prev.filter(error => !error.fieldId.includes(name)));
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];

    if (!formData.fullName.trim()) {
      newErrors.push({ fieldId: 'add-user-full-name', message: 'Enter the user\'s full name' });
    }

    if (!formData.email.trim()) {
      newErrors.push({ fieldId: 'add-user-email', message: 'Enter the user\'s email address' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ fieldId: 'add-user-email', message: 'Enter a valid email address' });
    }

    if (!formData.organisation) {
      newErrors.push({ fieldId: 'add-user-organisation', message: 'Select an organisation' });
    }

    if (!formData.accessReason.trim()) {
      newErrors.push({ fieldId: 'add-user-access-reason', message: 'Enter the reason for manual user addition' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Get field error message
  const getFieldError = (fieldId: string): string => {
    return errors.find(error => error.fieldId === fieldId)?.message || '';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, onSuccess: (data: UserCreatedData) => void) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Create user directly (bypassing approval flow)
      const response = await userService.createUser({
        ...formData,
        status: 'active',
        createdBy: 'manual',
        submittedAt: new Date().toISOString(),
        welcomeEmailSent: formData.sendWelcomeEmail
      });
      
      if (response && response.success) {
        onSuccess({
          userName: formData.fullName,
          userEmail: formData.email,
          organisation: formData.organisation,
          welcomeEmailSent: formData.sendWelcomeEmail
        });
      } else {
        setErrors([{ fieldId: 'general', message: 'Failed to create user. Please try again.' }]);
      }
    } catch (error) {
      logger.error('Failed to create user:', error);
      setErrors([{ fieldId: 'general', message: 'Failed to create user. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    getFieldError
  };
};
