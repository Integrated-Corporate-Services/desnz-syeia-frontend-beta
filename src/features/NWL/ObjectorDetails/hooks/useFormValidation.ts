import { useState } from 'react';
import { FORM_ERRORS } from '../constants/objectorDetailsConstants';
import type { FormErrors } from '../types';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate email format
   * Only validates if email is provided (optional field)
   */
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return null; // Optional field, empty is OK
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return FORM_ERRORS.INVALID_EMAIL;
    }
    return null;
  };

  /**
   * Validate phone number format
   * Only validates if phone is provided (optional field)
   * Supports UK mobile, landline, and international formats
   */
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return null; // Optional field, empty is OK
    }
    
    // Remove spaces, hyphens, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Phone should contain only digits and optional + at the start
    if (!/^\+?\d+$/.test(cleanPhone)) {
      return FORM_ERRORS.INVALID_PHONE;
    }
    
    // Check length: UK numbers are 10-11 digits (or 12-13 with +44)
    // Allow a reasonable range: minimum 10 digits, maximum 15 digits (international standard)
    const digitCount = cleanPhone.replace(/\+/g, '').length;
    if (digitCount < 10 || digitCount > 15) {
      return FORM_ERRORS.INVALID_PHONE;
    }
    
    // Original input (with formatting) should not exceed 20 characters
    if (phone.length > 20) {
      return FORM_ERRORS.INVALID_PHONE;
    }
    
    return null;
  };

  /**
   * Validate UK postcode format
   * Only validates if postcode is provided (optional field)
   */
  const validatePostcode = (postcode: string): string | null => {
    if (!postcode.trim()) {
      return null; // Optional field, empty is OK
    }
    // UK postcode format: 1-2 letters, 1-2 digits, optional letter, optional space, 1 digit, 2 letters
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      return 'Enter a valid postcode, like M1 1AA';
    }
    return null;
  };

  const validatePersonDetails = (fullName: string, email: string, phone: string = ''): boolean => {
    const newErrors: FormErrors = {};

    // Full name is mandatory
    if (!fullName.trim()) {
      newErrors.fullName = FORM_ERRORS.MISSING_FULL_NAME;
    }

    // Email is optional, but validate format if provided
    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Phone is optional, but validate format if provided
    const phoneError = validatePhone(phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = (
    addressLine1: string,
    town: string,
    postcode: string
  ): boolean => {
    const newErrors: FormErrors = {};

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = FORM_ERRORS.MISSING_ADDRESS_LINE1;
    }

    if (!town.trim()) {
      newErrors.town = FORM_ERRORS.MISSING_TOWN;
    }

    if (!postcode.trim()) {
      newErrors.postcode = FORM_ERRORS.MISSING_POSTCODE;
    } else {
      // Postcode is provided, validate format
      const postcodeError = validatePostcode(postcode);
      if (postcodeError) {
        newErrors.postcode = postcodeError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRadioSelection = (value: string): boolean => {
    if (!value) {
      setErrors({ radio: FORM_ERRORS.MISSING_RADIO_SELECTION });
      return false;
    }
    setErrors({});
    return true;
  };

  const clearErrors = () => setErrors({});

  const clearFieldError = (fieldName: string) => {
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return {
    errors,
    setErrors,
    validatePersonDetails,
    validateAddress,
    validateRadioSelection,
    validateEmail,
    validatePhone,
    validatePostcode,
    clearErrors,
    clearFieldError,
  };
};
