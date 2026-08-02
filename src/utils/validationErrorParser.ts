/**
 * Safely check if a value is a non-null object
 * Prevents TypeError when checking `typeof null === 'object'` (which is true in JavaScript)
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Safely parse backend validation errors
 * Handles cases where errorData.details might be null
 */
export function parseBackendValidationErrors(errorData: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Check that details exists and is a non-null object
  if (errorData?.details && isNonNullObject(errorData.details)) {
    Object.assign(errors, errorData.details);
  }
  
  return errors;
}
