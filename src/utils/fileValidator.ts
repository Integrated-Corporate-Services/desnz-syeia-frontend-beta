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
  logValidationEvent,
  FileOrMetadata
} from './fileValidationUtils';
import { isPasswordProtected } from './passwordProtectionDetector';
import { createLogger } from './logger';

const logger = createLogger('fileValidator');

export interface FileValidationError {
  filename: string;
  errorType: 'INVALID_TYPE' | 'SIZE_EXCEEDED' | 'TOTAL_SIZE_EXCEEDED' | 'PASSWORD_PROTECTED' | 'DUPLICATE' | 'EMPTY_FILE' | 'UNKNOWN';
  message: string;
}

export interface FileValidationResult {
  validFiles: File[];
  errors: FileValidationError[];
  totalSize: number;
  remainingSpace: number;
}


const validateFileBasics = (file: File): FileValidationError | null => {
  // Check if file is empty
  if (file.size === 0) {
    return {
      filename: file.name,
      errorType: 'EMPTY_FILE',
      message: VALIDATION_ERROR_MESSAGES.EMPTY_FILE
    };
  }
  
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


const validateTotalSizeConstraints = (filesToCheck: File[], existingFiles: FileOrMetadata[] = []): FileValidationError[] => {
  const errors: FileValidationError[] = [];
  
  // Calculate size of all existing files (pending + uploaded)
  const existingFilesSize = calculateTotalSize(existingFiles);
  
  // TOTAL SIZE FOR THIS PAGE = all existing files + new files
  const currentTotalSize = existingFilesSize;
  let runningTotal = currentTotalSize;
  
  logger.info('Total size validation started - Per Page Limit', {
    filesToCheckCount: filesToCheck.length,
    existingFilesCount: existingFiles.length,
    existingFilesSize: formatFileSize(existingFilesSize),
    currentTotalOnThisPage: formatFileSize(currentTotalSize),
    maxTotalPerPage: formatFileSize(FILE_SIZE_LIMITS.MAX_TOTAL_SIZE),
    remainingSpace: formatFileSize(FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - currentTotalSize)
  });
  
  for (const file of filesToCheck) {
    const wouldExceed = (runningTotal + file.size) > FILE_SIZE_LIMITS.MAX_TOTAL_SIZE;
    
    logger.info('Checking file against total size limit', {
      filename: file.name,
      fileSize: formatFileSize(file.size),
      currentRunningTotal: formatFileSize(runningTotal),
      wouldBeTotal: formatFileSize(runningTotal + file.size),
      maxAllowed: formatFileSize(FILE_SIZE_LIMITS.MAX_TOTAL_SIZE),
      wouldExceed
    });
    
    if (wouldExceed) {
      logger.error('FILE REJECTED: Would exceed 500MB per-page limit', {
        filename: file.name,
        fileSize: formatFileSize(file.size),
        currentTotalOnPage: formatFileSize(runningTotal),
        wouldBeTotal: formatFileSize(runningTotal + file.size),
        maxLimitPerPage: formatFileSize(FILE_SIZE_LIMITS.MAX_TOTAL_SIZE)
      });
      
      errors.push({
        filename: file.name,
        errorType: 'TOTAL_SIZE_EXCEEDED' as const,
        message: `${VALIDATION_ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED}`
      });
    } else {
      runningTotal += file.size;
      logger.info('File accepted', {
        filename: file.name,
        newRunningTotal: formatFileSize(runningTotal)
      });
    }
  }
  
  return errors;
};

/**
 * Checks for duplicate files based on name and size
 */
const validateForDuplicates = (filesToCheck: File[], existingFiles: FileOrMetadata[] = []): FileValidationError[] => {
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
  existingFiles: FileOrMetadata[] = []
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
  
  const existingSize = calculateTotalSize(existingFiles);
  const newValidSize = calculateTotalSize(finalValidFiles);
  const totalSize = existingSize + newValidSize;
  const remainingSpace = FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - totalSize;
  
  logger.info('Final size calculation', {
    existingFiles: formatFileSize(existingSize),
    newValidFiles: formatFileSize(newValidSize),
    totalSize: formatFileSize(totalSize),
    remainingSpace: formatFileSize(remainingSpace),
    maxLimit: formatFileSize(FILE_SIZE_LIMITS.MAX_TOTAL_SIZE)
  });
  
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
  existingFiles: FileOrMetadata[] = []
): Promise<FileValidationResult> => {
  return validateFiles([file], existingFiles);
};

/**
 * Quick validation without password protection check (for immediate UI feedback)
 */
export const quickValidateFiles = (
  newFiles: File[], 
  existingFiles: FileOrMetadata[] = []
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