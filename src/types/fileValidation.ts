/**
 * File Upload Validation Types
 * TypeScript interfaces and types for file validation
 */

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

export interface QuickFileValidationResult extends Omit<FileValidationResult, 'validFiles'> {
  potentiallyValidFiles: File[];
}

export interface PasswordProtectionCheckResult {
  filename: string;
  isProtected: boolean;
  error?: string;
}

export interface FileValidationConfig {
  allowedTypes: string[];
  allowedExtensions: string[];
  maxIndividualSize: number;
  maxTotalSize: number;
  checkPasswordProtection: boolean;
  allowDuplicates: boolean;
}

export interface FileSizeLimits {
  readonly MAX_INDIVIDUAL_FILE_SIZE: number;
  readonly MAX_TOTAL_SIZE: number;
}

export interface PasswordProtectionSignatures {
  readonly PDF: {
    readonly ENCRYPT_MARKER: string;
    readonly HEX_MARKER: string;
  };
  readonly OFFICE_XML: {
    readonly ENCRYPTED_KEY: string;
    readonly ENCRYPTED_PACKAGE: string;
    readonly MS_CONTAINER: string;
  };
  readonly OFFICE_LEGACY: {
    readonly OLE_HEADER: string;
    readonly ENCRYPTED_OBJECT: string;
    readonly MS_OFFICE_WRITE: string;
  };
}

export type FileValidationErrorType = FileValidationError['errorType'];
export type FileSizeUnit = 'Bytes' | 'KB' | 'MB' | 'GB';