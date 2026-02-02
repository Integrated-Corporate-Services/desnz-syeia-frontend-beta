/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if email already exists in a list (case-insensitive)
 * @param email - Email to check
 * @param existingEmails - Array of existing emails
 * @returns true if email exists
 */
export const isDuplicateEmail = (
  email: string,
  existingEmails: string[]
): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return existingEmails.some(
    (existing) => existing.toLowerCase().trim() === normalizedEmail
  );
};

/**
 * Validate reference string length
 * @param reference - Reference string to validate
 * @param maxLength - Maximum allowed length
 * @returns true if valid length
 */
export const isValidReferenceLength = (
  reference: string,
  maxLength: number
): boolean => {
  return reference.trim().length > 0 && reference.length <= maxLength;
};

export interface DateComponents {
  day: string;
  month: string;
  year: string;
}

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a date from day, month, year components
 * @param dateComponents - Object containing day, month, year strings
 * @param fieldName - Name of the field for error messages (e.g., "consultation request", "consultation response")
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export const validateDateComponents = (
  dateComponents: DateComponents,
  fieldName: string,
  options: { required?: boolean } = { required: true }
): DateValidationResult => {
  const { day, month, year } = dateComponents;
  const { required = true } = options;

  // Check if all fields are empty
  if (!day && !month && !year) {
    if (required) {
      return {
        isValid: false,
        error: `Enter the date the ${fieldName} was sent`
      };
    }
    return { isValid: true };
  }

  // Check if any field is missing
  if (!day || !month || !year) {
    const missing = [];
    if (!day) missing.push('day');
    if (!month) missing.push('month');
    if (!year) missing.push('year');
    return {
      isValid: false,
      error: `The date the ${fieldName} was sent must include a ${missing.join(', ')}`
    };
  }

  // Parse numeric values
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  // Check if values are numeric
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    return {
      isValid: false,
      error: `The date the ${fieldName} was sent must be a real date`
    };
  }

  // Validate the date is real
  const dateValue = new Date(yearNum, monthNum - 1, dayNum);
  if (
    isNaN(dateValue.getTime()) ||
    dateValue.getDate() !== dayNum ||
    dateValue.getMonth() !== monthNum - 1 ||
    dateValue.getFullYear() !== yearNum
  ) {
    return {
      isValid: false,
      error: `The date the ${fieldName} was sent must be a real date`
    };
  }

  return { isValid: true };
};
