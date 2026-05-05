import { getCsrfToken } from './cookie-utils';
import type {
  CatalogEntry,
  ConsentPreferencesResponse,
  UpdateConsentBody,
  WithdrawResponse,
} from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = getCsrfToken();
  const res = await fetch(`${BASE}${path}`, {
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

export const consentApi = {
  getPreferences: () => get<ConsentPreferencesResponse>('/cookies/preferences'),
  setPreferences: (body: UpdateConsentBody) =>
    post<ConsentPreferencesResponse>('/cookies/preferences', body),
  withdraw: () => post<WithdrawResponse>('/cookies/withdraw', {}),
  getCatalog: () => get<{ cookies: CatalogEntry[] }>('/cookies/catalog'),
};
