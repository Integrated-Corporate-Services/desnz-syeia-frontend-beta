import { useState, useCallback } from 'react';
import { LAND_DETAILS_VALIDATION, UK_POSTCODE_REGEX } from '../constants';

type ValidationErrors = { [key: string]: string };

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateSiteAddress = useCallback((
    addressLine1: string,
    town: string,
    postcode: string
  ): boolean => {
    const newErrors: ValidationErrors = {};

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = LAND_DETAILS_VALIDATION.ADDRESS_LINE1_REQUIRED;
    }

    if (!town.trim()) {
      newErrors.town = LAND_DETAILS_VALIDATION.TOWN_REQUIRED;
    }

    if (!postcode.trim()) {
      newErrors.postcode = LAND_DETAILS_VALIDATION.POSTCODE_REQUIRED;
    } else if (!UK_POSTCODE_REGEX.test(postcode.trim())) {
      newErrors.postcode = LAND_DETAILS_VALIDATION.POSTCODE_INVALID;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateCountry = useCallback((country: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!country || country === '') {
      newErrors.country = LAND_DETAILS_VALIDATION.COUNTRY_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateLandRegistry = useCallback((
    hasLandRegistry: boolean,
    titleNumber?: string
  ): boolean => {
    const newErrors: ValidationErrors = {};

    if (hasLandRegistry && !titleNumber?.trim()) {
      newErrors.titleNumber = LAND_DETAILS_VALIDATION.TITLE_NUMBER_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateOSGridReference = useCallback((
    gridLetter: string,
    easting: string,
    northing: string
  ): boolean => {
    const newErrors: ValidationErrors = {};

    if (!gridLetter.trim()) {
      newErrors.gridLetter = LAND_DETAILS_VALIDATION.GRID_LETTER_REQUIRED;
    }

    if (!easting.trim()) {
      newErrors.easting = LAND_DETAILS_VALIDATION.EASTING_REQUIRED;
    } else if (!/^\d{5,6}$/.test(easting.trim())) {
      newErrors.easting = LAND_DETAILS_VALIDATION.EASTING_INVALID;
    }

    if (!northing.trim()) {
      newErrors.northing = LAND_DETAILS_VALIDATION.NORTHING_REQUIRED;
    } else if (!/^\d{5,6}$/.test(northing.trim())) {
      newErrors.northing = LAND_DETAILS_VALIDATION.NORTHING_INVALID;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateIdentifyingInfo = useCallback((identifyingInfo: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!identifyingInfo.trim()) {
      newErrors.identifyingInfo = LAND_DETAILS_VALIDATION.IDENTIFYING_INFO_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  return {
    errors,
    clearErrors,
    clearError,
    validateSiteAddress,
    validateCountry,
    validateLandRegistry,
    validateOSGridReference,
    validateIdentifyingInfo,
  };
};
