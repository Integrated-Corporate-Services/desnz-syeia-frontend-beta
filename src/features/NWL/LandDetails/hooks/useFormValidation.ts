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
    hasSelection: boolean
  ): boolean => {
    const newErrors: ValidationErrors = {};

    if (hasSelection === undefined || hasSelection === null) {
      newErrors.hasLandRegistry = LAND_DETAILS_VALIDATION.HAS_LAND_REGISTRY_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateTitleNumber = useCallback((titleNumber: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!titleNumber.trim()) {
      newErrors.titleNumber = LAND_DETAILS_VALIDATION.TITLE_NUMBER_REQUIRED;
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

  const validateUnregisteredLand = useCallback((explanation: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!explanation.trim()) {
      newErrors.unregisteredLand = LAND_DETAILS_VALIDATION.UNREGISTERED_LAND_REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateEquipmentVisibility = useCallback((hasSelection: boolean): boolean => {
    const newErrors: ValidationErrors = {};

    if (hasSelection === undefined || hasSelection === null) {
      newErrors.equipmentVisibility = LAND_DETAILS_VALIDATION.EQUIPMENT_VISIBILITY_REQUIRED;
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
    validateTitleNumber,
    validateUnregisteredLand,
    validateIdentifyingInfo,
    validateEquipmentVisibility,
  };
};
