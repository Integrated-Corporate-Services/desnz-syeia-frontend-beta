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
  return import.meta.env.API_URL || '';
};

const useLegacyBackendPrefix = (): boolean => {
  return import.meta.env.VITE_USE_LEGACY_BACKEND_PREFIX === 'true';
};

const normalizeBackendPath = (path: string): string => {
  if (!path) {
    return path;
  }

  if (useLegacyBackendPrefix()) {
    return path;
  }

  if (path === '/backend') {
    return '/';
  }

  if (path.startsWith('/backend/')) {
    return path.replace('/backend', '');
  }

  return path;
};

/**
 * Build a full backend URL
 * @param path - The backend path (e.g., '/backend/api/users')
 * @returns Full URL with base if needed
 */
export const buildBackendUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = normalizeBackendPath(path);
  return `${baseUrl}${normalizedPath}`;
};
