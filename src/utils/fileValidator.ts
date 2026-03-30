/**
 * File Upload Validator
 * Main validation logic for file uploads with comprehensive error handling
 */

import { 
  ALLOWED_FILE_TYPES, 
  ALLOWED_FILE_EXTENSIONS, 
  FILE_SIZE_LIMITS,
  VALIDATION_ERROR_MESSAGES
} from './fileValidationConstants';
import { 
  formatFileSize,
  calculateTotalSize,
  isDuplicateFile,
  isValidFileType,
  logValidationEvent
} from './fileValidationUtils';
import { isPasswordProtected } from './passwordProtectionDetector';
import { createLogger } from './logger';

const logger = createLogger('fileValidator');

export interface FileValidationError {
  filename: string;
  errorType: 'INVALID_TYPE' | 'SIZE_EXCEEDED' | 'TOTAL_SIZE_EXCEEDED' | 'PASSWORD_PROTECTED' | 'DUPLICATE' | 'UNKNOWN';
  message: string;
}

export interface FileValidationResult {
  validFiles: File[];
  errors: FileValidationError[];
  totalSize: number;
  remainingSpace: number;
}

/**
 * Validates file type and individual size constraints
 */
const validateFileBasics = (file: File): FileValidationError | null => {
  // Check file type
  if (!isValidFileType(file, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS)) {
    return {
      filename: file.name,
      errorType: 'INVALID_TYPE',
      message: VALIDATION_ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }
  
  // Check individual file size
  if (file.size > FILE_SIZE_LIMITS.MAX_INDIVIDUAL_FILE_SIZE) {
    return {
      filename: file.name,
      errorType: 'SIZE_EXCEEDED',
      message: VALIDATION_ERROR_MESSAGES.FILE_SIZE_EXCEEDED
    };
  }
  
  return null;
};

/**
 * Validates total upload size constraints
 */
const validateTotalSizeConstraints = (filesToCheck: File[], existingFiles: File[]): FileValidationError[] => {
  const errors: FileValidationError[] = [];
  const currentTotalSize = calculateTotalSize(existingFiles);
  let runningTotal = currentTotalSize;
  
  for (const file of filesToCheck) {
    if (runningTotal + file.size > FILE_SIZE_LIMITS.MAX_TOTAL_SIZE) {
      const remainingSpace = FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - runningTotal;
      errors.push({
        filename: file.name,
        errorType: 'TOTAL_SIZE_EXCEEDED',
        message: `${VALIDATION_ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED}. Remaining space: ${formatFileSize(remainingSpace)}`
      });
    } else {
      runningTotal += file.size;
    }
  }
  
  return errors;
};

/**
 * Checks for duplicate files based on name and size
 */
const validateForDuplicates = (filesToCheck: File[], existingFiles: File[]): FileValidationError[] => {
  const errors: FileValidationError[] = [];
  
  for (const file of filesToCheck) {
    if (isDuplicateFile(file, existingFiles)) {
      errors.push({
        filename: file.name,
        errorType: 'DUPLICATE',
        message: VALIDATION_ERROR_MESSAGES.DUPLICATE_FILE
      });
    }
  }
  
  return errors;
};

/**
 * Checks files for password protection
 */
const validatePasswordProtection = async (filesToCheck: File[]): Promise<FileValidationError[]> => {
  const errors: FileValidationError[] = [];
  
  logger.info('Starting password protection validation', {
    filesCount: filesToCheck.length,
    files: filesToCheck.map(f => ({ name: f.name, size: f.size, type: f.type }))
  });
  
  for (const file of filesToCheck) {
    try {
      logger.info('Checking file for password protection', { filename: file.name });
      const isProtected = await isPasswordProtected(file);
      logger.info('Password protection check result', { filename: file.name, isProtected });
      
      if (isProtected) {
        errors.push({
          filename: file.name,
          errorType: 'PASSWORD_PROTECTED',
          message: VALIDATION_ERROR_MESSAGES.PASSWORD_PROTECTED
        });
        logger.warn('File rejected - password protected', { filename: file.name });
      }
    } catch (error) {
      logger.warn('Password protection check failed - allowing upload', {
        filename: file.name,
        error: error instanceof Error ? error.message : String(error)
      });
      // Don't block upload if password check fails
    }
  }
  
  logger.info('Password protection validation completed', {
    errorsFound: errors.length,
    errors: errors.map(e => ({ filename: e.filename, errorType: e.errorType }))
  });
  
  return errors;
};

/**
 * Comprehensive file validation with step-by-step filtering
 */
export const validateFiles = async (
  newFiles: File[], 
  existingFiles: File[] = []
): Promise<FileValidationResult> => {
  logValidationEvent('validation started', 'batch', {
    newFilesCount: newFiles.length,
    existingFilesCount: existingFiles.length,
    newFilesSize: formatFileSize(calculateTotalSize(newFiles)),
    existingFilesSize: formatFileSize(calculateTotalSize(existingFiles))
  });
  
  const allErrors: FileValidationError[] = [];
  let validFiles: File[] = [];
  
  // Step 1: Basic validation (file type and individual size)
  for (const file of newFiles) {
    const basicError = validateFileBasics(file);
    if (basicError) {
      allErrors.push(basicError);
    } else {
      validFiles.push(file);
    }
  }
  
  // Step 2: Total size validation
  const sizeErrors = validateTotalSizeConstraints(validFiles, existingFiles);
  allErrors.push(...sizeErrors);
  
  // Remove files that exceed total size limit
  validFiles = validFiles.filter(file => 
    !sizeErrors.some(error => error.filename === file.name)
  );
  
  // Step 3: Duplicate validation
  const duplicateErrors = validateForDuplicates(validFiles, existingFiles);
  allErrors.push(...duplicateErrors);
  
  // Remove duplicate files
  validFiles = validFiles.filter(file => 
    !duplicateErrors.some(error => error.filename === file.name)
  );
  
  // Step 4: Password protection validation
  const passwordErrors = await validatePasswordProtection(validFiles);
  allErrors.push(...passwordErrors);
  
  // Remove password protected files
  const finalValidFiles = validFiles.filter(file => 
    !passwordErrors.some(error => error.filename === file.name)
  );
  
  // Calculate final totals
  const totalSize = calculateTotalSize([...existingFiles, ...finalValidFiles]);
  const remainingSpace = FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - totalSize;
  
  const result = {
    validFiles: finalValidFiles,
    errors: allErrors,
    totalSize,
    remainingSpace
  };
  
  logValidationEvent('validation completed', 'batch', {
    validFilesCount: finalValidFiles.length,
    errorCount: allErrors.length,
    totalSize: formatFileSize(totalSize),
    remainingSpace: formatFileSize(remainingSpace),
    errorTypes: allErrors.map(e => e.errorType)
  });
  
  return result;
};

/**
 * Validates a single file (useful for real-time validation)
 */
export const validateSingleFile = async (
  file: File,
  existingFiles: File[] = []
): Promise<FileValidationResult> => {
  return validateFiles([file], existingFiles);
};

/**
 * Quick validation without password protection check (for immediate UI feedback)
 */
export const quickValidateFiles = (
  newFiles: File[],
  existingFiles: File[] = []
): Omit<FileValidationResult, 'validFiles'> & { potentiallyValidFiles: File[] } => {
  const errors: FileValidationError[] = [];
  let potentiallyValidFiles: File[] = [];
  
  // Step 1: Basic validation
  for (const file of newFiles) {
    const basicError = validateFileBasics(file);
    if (basicError) {
      errors.push(basicError);
    } else {
      potentiallyValidFiles.push(file);
    }
  }
  
  // Step 2: Total size validation
  const sizeErrors = validateTotalSizeConstraints(potentiallyValidFiles, existingFiles);
  errors.push(...sizeErrors);
  
  potentiallyValidFiles = potentiallyValidFiles.filter(file => 
    !sizeErrors.some(error => error.filename === file.name)
  );
  
  // Step 3: Duplicate validation
  const duplicateErrors = validateForDuplicates(potentiallyValidFiles, existingFiles);
  errors.push(...duplicateErrors);
  
  const finalPotentiallyValidFiles = potentiallyValidFiles.filter(file => 
    !duplicateErrors.some(error => error.filename === file.name)
  );
  
  const totalSize = calculateTotalSize([...existingFiles, ...finalPotentiallyValidFiles]);
  const remainingSpace = FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - totalSize;
  
  return {
    potentiallyValidFiles: finalPotentiallyValidFiles,
    errors,
    totalSize,
    remainingSpace
  };
};