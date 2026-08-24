import {
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  FILE_SIZE_LIMITS,
  MAX_FILES_PER_UPLOAD_BATCH,
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
  errorType: 'INVALID_TYPE' | 'SIZE_EXCEEDED' | 'TOTAL_SIZE_EXCEEDED' | 'PASSWORD_PROTECTED' | 'DUPLICATE' | 'EMPTY_FILE' | 'TOO_MANY_FILES' | 'UNKNOWN';
  message: string;
}

export interface FileValidationResult {
  validFiles: File[];
  errors: FileValidationError[];
  totalSize: number;
  remainingSpace: number;
}


const validateBatchFileCount = (filesToCheck: File[]): FileValidationError | null => {
  if (filesToCheck.length <= MAX_FILES_PER_UPLOAD_BATCH) {
    return null;
  }
  return {
    filename: `${filesToCheck.length} files selected`,
    errorType: 'TOO_MANY_FILES',
    message: VALIDATION_ERROR_MESSAGES.TOO_MANY_FILES_IN_BATCH
  };
};

const validateFileBasics = (file: File): FileValidationError | null => {
  logger.debug('[fileValidator.ts][validateFileBasics] STARTs');
  if (file.size === 0) {
    logger.debug('[fileValidator.ts][validateFileBasics] ENDs');
    return {
      filename: file.name,
      errorType: 'EMPTY_FILE',
      message: VALIDATION_ERROR_MESSAGES.EMPTY_FILE
    };
  }

  if (!isValidFileType(file, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS)) {
    logger.debug('[fileValidator.ts][validateFileBasics] ENDs');
    return {
      filename: file.name,
      errorType: 'INVALID_TYPE',
      message: VALIDATION_ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }

  if (file.size > FILE_SIZE_LIMITS.MAX_INDIVIDUAL_FILE_SIZE) {
    logger.debug('[fileValidator.ts][validateFileBasics] ENDs');
    return {
      filename: file.name,
      errorType: 'SIZE_EXCEEDED',
      message: VALIDATION_ERROR_MESSAGES.FILE_SIZE_EXCEEDED
    };
  }

  logger.debug('[fileValidator.ts][validateFileBasics] ENDs');
  return null;
};


const validateTotalSizeConstraints = (filesToCheck: File[], existingFiles: FileOrMetadata[] = []): FileValidationError[] => {
  logger.debug('[fileValidator.ts][validateTotalSizeConstraints] STARTs');
  const errors: FileValidationError[] = [];
  const existingFilesSize = calculateTotalSize(existingFiles);
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
      const currentTotal = formatFileSize(runningTotal);
      const fileSize = formatFileSize(file.size);
      const wouldBe = formatFileSize(runningTotal + file.size);
      const maxLimit = formatFileSize(FILE_SIZE_LIMITS.MAX_TOTAL_SIZE);
      
      logger.error('FILE REJECTED: Would exceed 500MB per-page limit', {
        filename: file.name,
        fileSize,
        currentTotalOnPage: currentTotal,
        wouldBeTotal: wouldBe,
        maxLimitPerPage: maxLimit
      });
      
      errors.push({
        filename: file.name,
        errorType: 'TOTAL_SIZE_EXCEEDED' as const,
        message: `${file.name}: ${VALIDATION_ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED}`
      });
    } else {
      runningTotal += file.size;
      logger.info('File accepted', {
        filename: file.name,
        newRunningTotal: formatFileSize(runningTotal)
      });
    }
  }

  logger.debug('[fileValidator.ts][validateTotalSizeConstraints] ENDs');
  return errors;
};

const validateForDuplicates = (filesToCheck: File[], existingFiles: FileOrMetadata[] = []): FileValidationError[] => {
  logger.debug('[fileValidator.ts][validateForDuplicates] STARTs');
  const errors: FileValidationError[] = [];
  
  for (const file of filesToCheck) {
    if (isDuplicateFile(file, existingFiles)) {
      errors.push({
        filename: file.name,
        errorType: 'DUPLICATE',
        message: `${file.name}: ${VALIDATION_ERROR_MESSAGES.DUPLICATE_FILE}`
      });
    }
  }
  
  
  const fileNames = new Map<string, number>();
  for (const file of filesToCheck) {
    const count = fileNames.get(file.name) || 0;
    if (count > 0) {
      errors.push({
        filename: file.name,
        errorType: 'DUPLICATE',
        message: `${file.name}: You are trying to upload this file multiple times. Please upload it only once.`
      });
    }
    fileNames.set(file.name, count + 1);
  }

  logger.debug('[fileValidator.ts][validateForDuplicates] ENDs');
  return errors;
};

const validatePasswordProtection = async (filesToCheck: File[]): Promise<FileValidationError[]> => {
  logger.debug('[fileValidator.ts][validatePasswordProtection] STARTs');
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
    }
  }
  
  logger.info('Password protection validation completed', {
    errorsFound: errors.length,
    errors: errors.map(e => ({ filename: e.filename, errorType: e.errorType }))
  });

  logger.debug('[fileValidator.ts][validatePasswordProtection] ENDs');
  return errors;
};

export const validateFiles = async (
  newFiles: File[],
  existingFiles: FileOrMetadata[] = []
): Promise<FileValidationResult> => {
  logger.debug('[fileValidator.ts][validateFiles] STARTs');
  logValidationEvent('validation started', 'batch', {
    newFilesCount: newFiles.length,
    existingFilesCount: existingFiles.length,
    newFilesSize: formatFileSize(calculateTotalSize(newFiles)),
    existingFilesSize: formatFileSize(calculateTotalSize(existingFiles))
  });

  const batchCountError = validateBatchFileCount(newFiles);
  if (batchCountError) {
    logger.warn('Selection rejected - exceeds max files per batch', {
      selectedCount: newFiles.length,
      maxAllowed: MAX_FILES_PER_UPLOAD_BATCH
    });
    logger.debug('[fileValidator.ts][validateFiles] ENDs');
    return {
      validFiles: [],
      errors: [batchCountError],
      totalSize: calculateTotalSize(existingFiles),
      remainingSpace: FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - calculateTotalSize(existingFiles)
    };
  }

  const allErrors: FileValidationError[] = [];
  let validFiles: File[] = [];

  for (const file of newFiles) {
    const basicError = validateFileBasics(file);
    if (basicError) {
      allErrors.push(basicError);
    } else {
      validFiles.push(file);
    }
  }
  
  const sizeErrors = validateTotalSizeConstraints(validFiles, existingFiles);
  allErrors.push(...sizeErrors);
  
  validFiles = validFiles.filter(file => 
    !sizeErrors.some(error => error.filename === file.name)
  );
  
  const duplicateErrors = validateForDuplicates(validFiles, existingFiles);
  allErrors.push(...duplicateErrors);
  
  validFiles = validFiles.filter(file => 
    !duplicateErrors.some(error => error.filename === file.name)
  );
  
  const passwordErrors = await validatePasswordProtection(validFiles);
  allErrors.push(...passwordErrors);
  
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

  logger.debug('[fileValidator.ts][validateFiles] ENDs');
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
  const batchCountError = validateBatchFileCount(newFiles);
  if (batchCountError) {
    const existingSize = calculateTotalSize(existingFiles);
    return {
      potentiallyValidFiles: [],
      errors: [batchCountError],
      totalSize: existingSize,
      remainingSpace: FILE_SIZE_LIMITS.MAX_TOTAL_SIZE - existingSize
    };
  }

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