import { createLogger } from './logger';
import { buildBackendUrl } from './apiConfig';

const logger = createLogger('csrf');

let cachedToken: string | null = null;

/**
 * Get CSRF token from /csrf-token endpoint
 * Uses fetch() to avoid circular dependency with axios interceptor
 * This is the industry standard approach
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(buildBackendUrl('/csrf-token'), {
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    cachedToken = data.csrfToken;
    logger.debug('Fetched new CSRF token from server');
    return cachedToken;
  } catch (error) {
    logger.error('Failed to fetch CSRF token', error);
    return null;
  }
}


export function getCsrfToken(): string | null {
  return cachedToken;
}


export function getCsrfHeaders(): { 'X-CSRF-Token'?: string } {
  const token = getCsrfToken();
  logger.debug('Getting CSRF headers', { hasToken: !!token });
  return token ? { 'X-CSRF-Token': token } : {};
}
