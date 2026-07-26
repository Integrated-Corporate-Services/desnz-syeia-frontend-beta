/**
 * Error Message Mapper
 * 
 * Security: Sanitizes error messages to prevent information disclosure
 * - Maps technical errors to user-friendly messages
 * - Prevents exposure of: stack traces, API endpoints, validation rules, DB details
 * - Logs full technical details for debugging (not shown to users)
 */

import { createLogger } from './logger';

const logger = createLogger('ErrorMapper');
import { isDevelopmentMode } from '../config/runtimeEnv';
/**
 * Error categories for mapping
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * User-friendly error messages
 */
const USER_FRIENDLY_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Unable to connect to the service. Please check your internet connection and try again.',
  [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
  [ErrorCategory.AUTHENTICATION]: 'Your session has expired. Please sign in again.',
  [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorCategory.NOT_FOUND]: 'The requested information could not be found.',
  [ErrorCategory.SERVER]: 'An error occurred while processing your request. Please try again later.',
  [ErrorCategory.UNKNOWN]: 'Something went wrong. Please try again or contact support if the problem persists.',
};

/**
 * Patterns that indicate technical details that should never be shown to users
 */
const SENSITIVE_PATTERNS = [
  /joi\s+validation/i,
  /schema\s+validation/i,
  /database/i,
  /sql/i,
  /query/i,
  /at\s+\w+\.\w+/i, // Stack trace patterns
  /\/api\//i, // API endpoints
  /localhost/i,
  /127\.0\.0\.1/i,
  /token/i,
  /session/i,
  /key/i,
  /secret/i,
  /password/i,
  /cookie/i,
  /bearer/i,
  /authorization/i,
  /must\s+be\s+a\s+valid/i, // Joi-style messages
  /fails\s+to\s+match/i,
  /required\s+pattern/i,
  /\.ts:\d+:\d+/i, // File paths with line numbers
  /\.tsx:\d+:\d+/i,
  /\.js:\d+:\d+/i,
  /Error:\s*at/i,
  /TypeError/i,
  /ReferenceError/i,
  /SyntaxError/i,
];

/**
 * Categorize an error based on its properties
 */
function categorizeError(error: any): ErrorCategory {
  // Check HTTP status codes first
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response?.status;
    
    if (status === 400 || status === 422) return ErrorCategory.VALIDATION;
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status === 404) return ErrorCategory.NOT_FOUND;
    if (status >= 500) return ErrorCategory.SERVER;
  }

  // Check error codes
  if (error?.code) {
    const code = error.code.toUpperCase();
    
    if (code.includes('VALIDATION')) return ErrorCategory.VALIDATION;
    if (code.includes('AUTH') || code.includes('UNAUTHORIZED')) return ErrorCategory.AUTHENTICATION;
    if (code.includes('FORBIDDEN') || code.includes('PERMISSION')) return ErrorCategory.AUTHORIZATION;
    if (code.includes('NOT_FOUND') || code.includes('NOTFOUND')) return ErrorCategory.NOT_FOUND;
    if (code.includes('NETWORK') || code.includes('TIMEOUT') || code.includes('ECONNREFUSED')) return ErrorCategory.NETWORK;
  }

  // Check error message for patterns
  const message = error?.message || String(error);
  
  if (/network|connection|timeout|fetch failed/i.test(message)) return ErrorCategory.NETWORK;
  if (/unauthorized|session|expired/i.test(message)) return ErrorCategory.AUTHENTICATION;
  if (/forbidden|permission|access denied/i.test(message)) return ErrorCategory.AUTHORIZATION;
  if (/not found|cannot find/i.test(message)) return ErrorCategory.NOT_FOUND;
  if (/validation|invalid|required/i.test(message)) return ErrorCategory.VALIDATION;
  if (/server error|internal error|500/i.test(message)) return ErrorCategory.SERVER;

  return ErrorCategory.UNKNOWN;
}

/**
 * Check if an error message contains sensitive information
 */
function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Sanitize and map error to user-friendly message
 * 
 * @param error - The error object or message
 * @param context - Optional context for logging (e.g., 'FileUpload', 'Login')
 * @returns User-friendly error message
 */
export function mapErrorToUserMessage(error: any, context?: string): string {
  try {
    // Extract error message
    const originalMessage = error?.message || error?.error || String(error);
    
    // Log the full technical error for debugging (not shown to user)
    logger.error('Error occurred', {
      context,
      originalMessage,
      status: error?.status,
      code: error?.code,
      stack: error?.stack,
      // Only log stack in development
      ...(import.meta.env.MODE === 'development' && { fullError: error }),
    });

    // Categorize the error
    const category = categorizeError(error);
    
    // Check if the original message is safe to display
    const isSafeMessage = !containsSensitiveInfo(originalMessage) && 
                         originalMessage.length < 150 && // Reasonable length
                         !/[{}[\]<>]/g.test(originalMessage); // No code-like syntax

    // For validation errors, if the message is safe and user-friendly, use it
    if (category === ErrorCategory.VALIDATION && isSafeMessage) {
      // Check if it's a simple, user-friendly validation message
      const simpleValidationPatterns = [
        /please select/i,
        /please enter/i,
        /please provide/i,
        /is required/i,
        /cannot be empty/i,
        /must be/i,
      ];
      
      if (simpleValidationPatterns.some(pattern => pattern.test(originalMessage))) {
        return originalMessage;
      }
    }

    // Return user-friendly message based on category
    return USER_FRIENDLY_MESSAGES[category];
    
  } catch (mappingError) {
    // If error mapping itself fails, return generic message
    logger.error('Error mapping failed', { mappingError });
    return USER_FRIENDLY_MESSAGES[ErrorCategory.UNKNOWN];
  }
}

/**
 * Sanitize error for display (removes sensitive patterns)
 * Use this for logging or displaying errors in development mode
 */
export function sanitizeErrorForDisplay(error: any): string {
  const message = error?.message || String(error);
  
  // Remove file paths and line numbers
  let sanitized = message.replace(/\s*at\s+.*\(.*:\d+:\d+\)/g, '');
  sanitized = sanitized.replace(/\s*at\s+.*\.tsx?:\d+:\d+/g, '');
  
  // Remove API endpoints
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');
  sanitized = sanitized.replace(/\/api\/[^\s]+/g, '[API_ENDPOINT]');
  
  // Remove tokens and sensitive values
  sanitized = sanitized.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]');
  sanitized = sanitized.replace(/token[=:]\s*[^\s]+/gi, 'token=[REDACTED]');
  
  return sanitized.trim();
}

/**
 * Create a safe error object for logging
 * Strips out sensitive information but keeps structure
 */
export function createSafeErrorLog(error: any): Record<string, any> {
  return {
    message: sanitizeErrorForDisplay(error),
    category: categorizeError(error),
    status: error?.status,
    code: error?.code,
    // Never include: stack traces, full error objects, tokens, etc.
  };
}

/**
 * Helper for React components to display error messages safely
 */
export function useErrorMessage(error: any, context?: string): string | null {
  if (!error) return null;
  return mapErrorToUserMessage(error, context);
}

/**
 * Specific handlers for common error scenarios
 */
export const ErrorMessages = {
  // File upload errors
  FILE_TOO_LARGE: 'The selected file is too large. Please choose a smaller file.',
  FILE_TYPE_INVALID: 'The file type is not supported. Please upload a valid file.',
  FILE_UPLOAD_FAILED: 'Failed to upload the file. Please try again.',
  
  // Form submission errors
  FORM_SUBMISSION_FAILED: 'Unable to submit the form. Please check your input and try again.',
  FORM_VALIDATION_FAILED: 'Please check the highlighted fields and try again.',
  
  // Authentication errors
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  LOGIN_FAILED: 'Unable to sign in. Please check your credentials and try again.',
  
  // Data retrieval errors
  DATA_LOAD_FAILED: 'Unable to load the requested information. Please try again later.',
  DATA_SAVE_FAILED: 'Unable to save your changes. Please try again later.',
  
  // Generic errors
  GENERIC_ERROR: 'Something went wrong. Please try again or contact support if the problem persists.',
  NETWORK_ERROR: 'Unable to connect to the service. Please check your internet connection.',
};

/**
 * Type guard to check if error is an API error with status
 */
export function isApiError(error: any): error is { status: number; message: string } {
  return error && typeof error === 'object' && 'status' in error;
}

/**
 * Type guard to check if error has validation errors
 */
export function hasValidationErrors(error: any): error is { validationErrors: Record<string, string> } {
  return error && typeof error === 'object' && 'validationErrors' in error;
}
