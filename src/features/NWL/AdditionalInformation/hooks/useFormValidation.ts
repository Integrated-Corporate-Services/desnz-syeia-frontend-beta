import { useState } from 'react';
import { FormErrors } from '../types';
import { ERRORS, CHARACTER_LIMIT } from '../constants';

/**
 * Custom hook for form validation
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate radio button selection
   */
  const validateRadioSelection = (
    value: string,
    errorMessage: string = ERRORS.RADIO_REQUIRED
  ): boolean => {
    if (!value) {
      setErrors({ radio: errorMessage });
      return false;
    }
    setErrors({});
    return true;
  };

  /**
   * Validate related applications details
   */
  const validateRelatedApplicationsDetails = (details: string): boolean => {
    if (!details || details.trim().length === 0) {
      setErrors({ details: ERRORS.DETAILS_REQUIRED });
      return false;
    }
    
    if (details.length > CHARACTER_LIMIT) {
      setErrors({ details: ERRORS.DETAILS_TOO_LONG });
      return false;
    }
    
    setErrors({});
    return true;
  };

  /**
   * Validate other important information details
   */
  const validateOtherInformationDetails = (details: string): boolean => {
    if (!details || details.trim().length === 0) {
      setErrors({ details: ERRORS.OTHER_INFO_REQUIRED });
      return false;
    }
    
    if (details.length > CHARACTER_LIMIT) {
      setErrors({ details: ERRORS.DETAILS_TOO_LONG });
      return false;
    }
    
    setErrors({});
    return true;
  };

  return {
    errors,
    setErrors,
    validateRadioSelection,
    validateRelatedApplicationsDetails,
    validateOtherInformationDetails,
  };
};
