/**
 * Centralized API client for all backend calls
 * Ensures credentials are always included and errors are handled consistently
 * 
 * Usage:
 *   import { apiGet, apiPost } from './apiClient';
 *   const data = await apiGet<MyType>('/applications/123');
 *   await apiPost('/applications', { name: 'test' });
 */

import { apiFetch } from './apiErrorHandler';
import { buildBackendUrl } from './apiConfig';
import { getCsrfHeaders } from './csrf';

export const API_BASE = buildBackendUrl('/api');

const resolveApiUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE}${path}`;
};

/**
 * GET request
 * @param path API path (e.g., '/applications/123')
 * @returns Promise with response data
 */
export async function apiGet<T = any>(path: string): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, { method: 'GET' });
}

/**
 * POST request
 * @param path API path
 * @param data Request body (will be JSON stringified)
 * @returns Promise with response data
 */
export async function apiPost<T = any>(path: string, data?: any): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 * @param path API path
 * @param data Request body (will be JSON stringified)
 * @returns Promise with response data
 */
export async function apiPut<T = any>(path: string, data?: any): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request
 * @param path API path
 * @param data Request body (will be JSON stringified)
 * @returns Promise with response data
 */
export async function apiPatch<T = any>(path: string, data?: any): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 * @param path API path
 * @returns Promise with response data
 */
export async function apiDelete<T = any>(path: string): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, { 
    method: 'DELETE',
    headers: {
      ...getCsrfHeaders(),
    },
  });
}

/**
 * Upload file using multipart/form-data
 * @param path API path
 * @param formData FormData object with files
 * @returns Promise with response data
 */
export async function apiUpload<T = any>(path: string, formData: FormData): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, {
    method: 'POST',
    headers: {
      // Don't set Content-Type - browser will set it with boundary
      ...getCsrfHeaders(),
    },
    body: formData,
  });
}

/**
 * Custom request with full control
 * @param path API path
 * @param options Fetch options
 * @returns Promise with response data
 */
export async function apiRequest<T = any>(path: string, options: RequestInit): Promise<T> {
  const url = resolveApiUrl(path);
  return apiFetch<T>(url, options);
}

// Export for backward compatibility
export { apiFetch } from './apiErrorHandler';
