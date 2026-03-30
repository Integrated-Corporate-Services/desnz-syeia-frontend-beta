/**
 * File Upload Validation Utilities
 * Helper functions for file validation operations
 */

import { FILE_SIZE_UNITS } from './fileValidationConstants';
import { createLogger } from './logger';

const logger = createLogger('fileValidationUtils');

/**
 * Formats file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${size} ${FILE_SIZE_UNITS[i]}`;
};

/**
 * Gets file extension from filename
 * @param filename - Name of the file
 * @returns File extension in lowercase with dot prefix
 */
export const getFileExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? `.${extension}` : '';
};

/**
 * Calculates total size of multiple files
 * @param files - Array of files
 * @returns Total size in bytes
 */
export const calculateTotalSize = (files: File[]): number => {
  return files.reduce((total, file) => total + file.size, 0);
};

/**
 * Checks if files have duplicate names and sizes
 * @param newFile - New file to check
 * @param existingFiles - Array of existing files
 * @returns True if duplicate found
 */
export const isDuplicateFile = (newFile: File, existingFiles: File[]): boolean => {
  return existingFiles.some(existingFile => 
    existingFile.name === newFile.name && existingFile.size === newFile.size
  );
};

/**
 * Validates file type against allowed types and extensions
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param allowedExtensions - Array of allowed file extensions
 * @returns True if file type is valid
 */
export const isValidFileType = (
  file: File, 
  allowedTypes: string[], 
  allowedExtensions: string[]
): boolean => {
  const fileExtension = getFileExtension(file.name);
  return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
};

/**
 * Reads file header for analysis
 * @param file - File to read
 * @param bytesToRead - Number of bytes to read from start
 * @returns Promise resolving to Uint8Array of file header
 */
export const readFileHeader = (file: File, bytesToRead: number = 1024): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        reject(new Error('Failed to read file header'));
        return;
      }
      resolve(new Uint8Array(arrayBuffer));
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file.slice(0, bytesToRead));
  });
};

/**
 * Converts Uint8Array to hex string
 * @param uint8Array - Array to convert
 * @returns Hex string representation
 */
export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Creates validation error message for file
 * @param filename - Name of the file with error
 * @param errorType - Type of validation error
 * @param details - Additional error details
 * @returns Formatted error message
 */
export const createFileValidationError = (
  filename: string, 
  errorType: string, 
  details?: string
): string => {
  const baseMessage = `${filename}: ${errorType}`;
  return details ? `${baseMessage}. ${details}` : baseMessage;
};

/**
 * Logs file validation event
 * @param event - Type of validation event
 * @param filename - File being validated
 * @param details - Additional details to log
 */
export const logValidationEvent = (
  event: string, 
  filename: string, 
  details?: any
): void => {
  logger.debug(`File validation ${event}`, {
    filename,
    ...details
  });
};