/**
 * Validation utility functions
 */

/**
 * Validate email format using GDS-compliant validation
 * Based on HTML5 email validation pattern with additional checks
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') {
    return false;
  }
  
  // Remove leading/trailing whitespace
  const trimmedEmail = email.trim();
  
  // Basic format check: must contain @ and at least one dot after @
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailRegex.test(trimmedEmail)) {
    return false;
  }
  
  // Additional checks for GDS compliance
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }
  
  const [localPart, domain] = parts;
  
  // Local part validation (before @)
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Domain part validation (after @)
  if (domain.length === 0 || domain.length > 255) {
    return false;
  }
  
  // Domain must contain at least one dot and valid characters
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts.some(part => part.length === 0)) {
    return false;
  }
  
  // More comprehensive regex for final validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(trimmedEmail);
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

/**
 * Validate text format (letters, numbers, spaces, apostrophes, hyphens only)
 * @param text - Text to validate
 * @returns true if text contains only allowed characters
 */
export const isValidTextFormat = (text: string): boolean => {
  if (!text) return true; // Empty text is valid (use required validation separately)
  // Allow letters (uppercase and lowercase), numbers, spaces, apostrophes, and hyphens
  const textFormatRegex = /^[a-zA-Z0-9\s'\-]+$/;
  return textFormatRegex.test(text);
};

/**
 * Validate character limit (default 4000)
 * @param text - Text to validate
 * @param limit - Character limit (default 4000)
 * @returns true if within limit
 */
export const isWithinCharacterLimit = (text: string, limit: number = 4000): boolean => {
  return text.length <= limit;
};
