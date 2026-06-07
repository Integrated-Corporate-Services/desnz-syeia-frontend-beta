/**
 * API Configuration
 * Provides the base URL for backend API calls
 * Works in both dev (with Vite proxy) and production (with full URL)
 */

/**
 * Get the API base URL from environment variable
 * In dev mode: Returns empty string (uses Vite proxy)
 * In production: Returns full backend URL (e.g., http://localhost:3000)
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || '';
};

/**
 * Build a full backend URL
 * @param path - The backend path (e.g., '/backend/api/users')
 * @returns Full URL with base if needed
 */
export const buildBackendUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};
