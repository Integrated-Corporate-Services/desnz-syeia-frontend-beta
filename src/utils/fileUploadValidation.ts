/**
 * File Upload Validation Module
 * Exports all file validation utilities and constants
 */

export * from './fileValidationConstants';
export * from './fileValidationUtils';
export * from './passwordProtectionDetector';
export * from './fileValidator';

// Re-export commonly used functions for convenience
export { validateFiles, validateSingleFile, quickValidateFiles } from './fileValidator';
export { isPasswordProtected } from './passwordProtectionDetector';
export {
  formatFileSize,
  isValidFileType,
  isExcelFile,
  isLegacyOfficeFile,
  isModernOfficeFile,
  isWordFile,
  isPdfFile,
  isImageFile,
  categorizeFileType,
  hasAllowedExtension,
  findFilePassRecord,
  findWordEncryptionFlag,
  getOptimalReadSize
} from './fileValidationUtils';
export { 
  ALLOWED_FILE_TYPES, 
  ALLOWED_FILE_EXTENSIONS, 
  FILE_SIZE_LIMITS,
  FILE_TYPE_CATEGORIES,
  BIFF_RECORD_CONSTANTS,
  PASSWORD_DETECTION_READ_SIZES,
  SUPPORTED_FORMATS_DISPLAY 
} from './fileValidationConstants';