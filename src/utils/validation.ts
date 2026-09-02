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
 * @param dateDescription - Full phrase describing the date for error messages, e.g. "the consultation request was sent"
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export const validateDateComponents = (
  dateComponents: DateComponents,
  dateDescription: string,
  options: { required?: boolean; allowFutureDate?: boolean } = { required: true }
): DateValidationResult => {
  const day = dateComponents.day.trim();
  const month = dateComponents.month.trim();
  const year = dateComponents.year.trim();
  const { required = true, allowFutureDate = false } = options;

  // Check if all fields are empty
  if (!day && !month && !year) {
    if (required) {
      return {
        isValid: false,
        error: `Enter the date ${dateDescription}`
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
      error: `The date ${dateDescription} must include a ${missing.join(', ')}`
    };
  }

  // Reject non-numeric input (e.g. "12a") that parseInt would otherwise silently accept
  const isDigitsOnly = (value: string) => /^\d+$/.test(value);
  if (!isDigitsOnly(day) || !isDigitsOnly(month) || !isDigitsOnly(year)) {
    return {
      isValid: false,
      error: `The date ${dateDescription} must be a real date`
    };
  }

  // Require a full 4-digit year so e.g. "26" isn't silently read as year 26
  if (year.length !== 4) {
    return {
      isValid: false,
      error: `The date ${dateDescription} must include a year made of 4 numbers`
    };
  }

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Validate the date is real (catches e.g. 31 February, month 13, day 0)
  const dateValue = new Date(yearNum, monthNum - 1, dayNum);
  if (
    isNaN(dateValue.getTime()) ||
    dateValue.getDate() !== dayNum ||
    dateValue.getMonth() !== monthNum - 1 ||
    dateValue.getFullYear() !== yearNum
  ) {
    return {
      isValid: false,
      error: `The date ${dateDescription} must be a real date`
    };
  }

  if (!allowFutureDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateValue.getTime() > today.getTime()) {
      return {
        isValid: false,
        error: `The date ${dateDescription} must be today or in the past`
      };
    }
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
