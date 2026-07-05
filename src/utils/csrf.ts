/**
 * CSRF Token Management (Cookie-based)
 * Backend generates secret in cookie, frontend must fetch token from endpoint
 */

let cachedToken: string | null = null;

/**
 * Get CSRF token from /csrf-token endpoint
 * Uses fetch() to avoid circular dependency with axios interceptor
 * This is the industry standard approach
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/backend/csrf-token', {
      credentials: 'include',
    });
    if (!response.ok) return null;
    const data = await response.json();
    cachedToken = data.csrfToken;
    console.log('[CSRF] Fetched new token from server:', cachedToken);
    return cachedToken;
  } catch (error) {
    console.error('[CSRF] Failed to fetch token:', error);
    return null;
  }
}


export function getCsrfToken(): string | null {
  return cachedToken;
}


export function getCsrfHeaders(): { 'X-CSRF-Token'?: string } {
  const token = getCsrfToken();
  console.log('[CSRF] getCsrfHeaders called');
  console.log('[CSRF] Token from cache:', token);
  const headers = token ? { 'X-CSRF-Token': token } : {};
  console.log('[CSRF] Returning headers:', headers);
  return headers;
}
