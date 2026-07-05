/**
 * CSRF Token Management (Cookie-based)
 * Backend sends token in cookie, frontend reads and includes in requests
 */

/**
 * Get CSRF token from cookie
 * Backend automatically sets this cookie when session is created
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(/(?:^|; )_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}


export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
}
