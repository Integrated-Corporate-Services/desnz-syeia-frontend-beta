import { useState } from 'react';
import { FORM_ERRORS } from '../constants/objectorDetailsConstants';
import type { FormErrors } from '../types';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validatePersonDetails = (fullName: string, email: string): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = FORM_ERRORS.MISSING_FULL_NAME;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = FORM_ERRORS.INVALID_EMAIL;
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

  return {
    errors,
    setErrors,
    validatePersonDetails,
    validateAddress,
    validateRadioSelection,
    clearErrors,
  };
};
