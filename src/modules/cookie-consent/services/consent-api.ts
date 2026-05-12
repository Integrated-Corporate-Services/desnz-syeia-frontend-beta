import { getCsrfToken } from '../utils/cookie-utils';
import { consentFallback } from './consent-fallback';
import type {
  CatalogEntry,
  ConsentPreferencesResponse,
  UpdateConsentBody,
  WithdrawResponse,
} from '../types';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Flag to track if API is available
 * Set to false after first 404 to avoid repeated failed requests
 */
let apiAvailable = true;

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getCsrfToken();
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-CSRF-Token': token } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>(path, { method: 'GET' });
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

/**
 * Wrapper function that automatically falls back to localStorage when API is unavailable
 * This provides graceful degradation following GDS best practices
 */
async function withFallback<T>(
  apiCall: () => Promise<T>,
  fallbackCall: () => Promise<T>
): Promise<T> {
  // If we already know API is unavailable, use fallback immediately
  if (!apiAvailable) {
    return fallbackCall();
  }

  try {
    const result = await apiCall();
    // API call succeeded, ensure flag is set correctly
    apiAvailable = true;
    return result;
  } catch (error) {
    // If API returns 404, it's not implemented yet - use fallback
    if (error instanceof ApiError && error.status === 404) {
      apiAvailable = false;
      return fallbackCall();
    }
    // For other errors, re-throw to handle them normally
    throw error;
  }
}

export const consentApi = {
  getPreferences: () => withFallback(
    () => get<ConsentPreferencesResponse>('/backend/cookies/preferences'),
    () => consentFallback.getPreferences()
  ),
  
  setPreferences: (body: UpdateConsentBody) => withFallback(
    () => post<ConsentPreferencesResponse>('/backend/cookies/preferences', body),
    () => consentFallback.setPreferences(body)
  ),
  
  withdraw: () => withFallback(
    () => post<WithdrawResponse>('/backend/cookies/withdraw', {}),
    () => consentFallback.withdraw()
  ),
  
  getCatalog: () => withFallback(
    () => get<{ cookies: CatalogEntry[] }>('/backend/cookies/catalog'),
    () => consentFallback.getCatalog()
  ),
};
