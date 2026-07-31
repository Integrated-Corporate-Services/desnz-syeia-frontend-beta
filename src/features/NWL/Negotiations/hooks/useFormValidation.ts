import { useState } from 'react';
import { FORM_ERRORS } from '../constants/negotiationsConstants';
import type { FormErrors } from '../types';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateRadioSelection = (value: string | boolean | undefined): boolean => {
    if (value === undefined || value === '') {
      setErrors({ radio: FORM_ERRORS.MISSING_RADIO_SELECTION });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateDate = (day: string, month: string, year: string): boolean => {
    const newErrors: FormErrors = {};

    // Check if all fields are empty (date is optional in some cases)
    if (!day && !month && !year) {
      return true;
    }

    // If any field is filled, all must be filled
    if (!day || !month || !year) {
      newErrors.date = FORM_ERRORS.MISSING_DATE;
      setErrors(newErrors);
      return false;
    }

    // Validate day
    const dayNum = parseInt(day, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      newErrors.day = FORM_ERRORS.INVALID_DAY;
    }

    // Validate month
    const monthNum = parseInt(month, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      newErrors.month = FORM_ERRORS.INVALID_MONTH;
    }

    // Validate year
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || year.length !== 4 || yearNum < 1900 || yearNum > 2100) {
      newErrors.year = FORM_ERRORS.INVALID_YEAR;
    }

    // Validate date is valid
    if (Object.keys(newErrors).length === 0) {
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum - 1 ||
        date.getDate() !== dayNum
      ) {
        newErrors.date = FORM_ERRORS.INVALID_DATE;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDateNotInFuture = (day: string, month: string, year: string): boolean => {
    // First validate the date is valid
    if (!validateDate(day, month, year)) {
      return false;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const inputDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      setErrors({ date: FORM_ERRORS.FUTURE_DATE });
      return false;
    }

    return true;
  };

  const validateComments = (comments: string, required: boolean = false): boolean => {
    const newErrors: FormErrors = {};

    if (required && !comments.trim()) {
      newErrors.comments = FORM_ERRORS.MISSING_COMMENTS;
    }

    if (comments.length > 4000) {
      newErrors.comments = FORM_ERRORS.COMMENTS_TOO_LONG;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNoNegotiationsReason = (reason: string): boolean => {
    const newErrors: FormErrors = {};

    if (!reason.trim()) {
      newErrors.reason = FORM_ERRORS.MISSING_NO_NEGOTIATIONS_REASON;
    }

    if (reason.length > 4000) {
      newErrors.reason = FORM_ERRORS.COMMENTS_TOO_LONG;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    setErrors,
    validateRadioSelection,
    validateDate,
    validateDateNotInFuture,
    validateComments,
    validateNoNegotiationsReason,
    clearErrors,
  };
};
