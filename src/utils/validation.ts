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
