/**
 * Global API Error Handler
 * Handles common HTTP errors, especially session timeout (401)
 */

import { createLogger } from './logger';

const logger = createLogger('ApiErrorHandler');

export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: Response;
}

interface ErrorResponseData {
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Handle API errors globally
 * - 401: Session expired -> redirect to login
 * - 403: Forbidden -> show unauthorized page
 * - 500: Server error -> log and throw
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorData: ErrorResponseData = {
    error: response.statusText || 'Unknown error',
    message: `HTTP ${response.status}`,
  };
  
  try {
    const data = await response.json();
    errorData = { ...errorData, ...data };
  } catch {
    // Response body is not JSON or empty - use default errorData
  }

  const error: ApiError = new Error(
    errorData.message || errorData.error || `HTTP ${response.status}`
  );
  error.status = response.status;
  error.code = errorData.code;
  error.response = response;

  // Handle 401 Unauthorized (session expired)
  if (response.status === 401) {
    logger.warn('Session expired or unauthorized', {
      status: response.status,
      code: errorData.code,
      url: response.url,
    });

    // Check if it's a session timeout
    if (errorData.code === 'SESSION_TIMEOUT') {
      logger.info('Session timeout detected, redirecting to landing page');
      // Redirect to landing page (homepage)
      window.location.href = '/frontend/landingPage';
    } else {
      // Generic unauthorized - could be invalid credentials
      logger.info('Unauthorized access, redirecting to landing page');
      window.location.href = '/frontend/landingPage';
    }
    
    // This will never be reached due to redirect, but TypeScript needs it
    throw error;
  }

  // Handle 403 Forbidden (insufficient permissions)
  if (response.status === 403) {
    logger.warn('Access forbidden', {
      status: response.status,
      url: response.url,
    });
    // Could redirect to an "Access Denied" page
    // For now, just throw the error
  }

  // Log other errors
  logger.error('API request failed', {
    status: response.status,
    code: errorData.code,
    message: error.message,
    url: response.url,
  });

  throw error;
}

/**
 * Enhanced fetch wrapper that handles errors automatically
 * Use this instead of raw fetch() for API calls
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: options?.credentials || 'include', // Always include credentials for session cookies
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // For non-JSON responses, return the response object
    return response as unknown as T;
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if ((error as ApiError).response) {
      throw error;
    }

    // Network error or other fetch error
    logger.error('Network or fetch error', {
      message: (error as Error).message,
      url,
    });
    throw error;
  }
}

/**
 * Check if current user session is still valid
 * Call this periodically or before important operations
 */
export async function checkSessionValidity(): Promise<boolean> {
  try {
    const response = await fetch('/backend/auth/user', {
      credentials: 'include',
      method: 'GET',
    });

    return response.ok;
  } catch {
    return false;
  }
}
