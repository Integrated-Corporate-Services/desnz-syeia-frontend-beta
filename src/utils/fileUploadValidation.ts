/**
 * File Upload Validation Module
 * Exports all file validation utilities and constants
 */

// Constants
export * from './fileValidationConstants';

// Utilities
export * from './fileValidationUtils';

// Password Protection Detection
export * from './passwordProtectionDetector';

// Main Validator
export * from './fileValidator';

// Re-export commonly used functions for convenience
export { validateFiles, validateSingleFile, quickValidateFiles } from './fileValidator';
export { isPasswordProtected } from './passwordProtectionDetector';
export { formatFileSize, isValidFileType } from './fileValidationUtils';
export { 
  ALLOWED_FILE_TYPES, 
  ALLOWED_FILE_EXTENSIONS, 
  FILE_SIZE_LIMITS,
  SUPPORTED_FORMATS_DISPLAY 
} from './fileValidationConstants';