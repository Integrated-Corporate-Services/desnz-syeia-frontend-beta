import { fetchCsrfToken, getCsrfHeaders, getCsrfToken } from '../../../utils/csrf';
import { getApiUrl } from '../../../utils/apiConfig';
import type {
  InAppNotificationsResponse,
  NotificationDecisionResult,
  UnreadNotificationCountResponse,
} from '../types/inAppNotifications';

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(getApiUrl(path), {
    credentials: 'include',
    ...init,
  });
  return response.ok ? response.json() : null;
}

export async function getUnreadNotificationCount(): Promise<number | null> {
  const response = await request<UnreadNotificationCountResponse>('/in-app-notifications/unread-count');
  return response?.count ?? null;
}

export async function getInAppNotifications(page: number, limit: number): Promise<InAppNotificationsResponse | null> {
  return request<InAppNotificationsResponse>(`/in-app-notifications?page=${page}&limit=${limit}`);
}

// The read-only summary of a decision notification. Not found (404) is told apart from a failure, so the
// page can say which.
export async function getNotificationDecision(notificationId: string): Promise<NotificationDecisionResult> {
  try {
    const response = await fetch(getApiUrl(`/in-app-notifications/${encodeURIComponent(notificationId)}/decision`), {
      credentials: 'include',
    });
    if (response.ok) return { status: 'found', summary: await response.json() };
    return { status: response.status === 404 ? 'not-found' : 'failed' };
  } catch {
    return { status: 'failed' };
  }
}

// The startup CSRF token request is not awaited, and a cached token can expire: fetch one when needed.
async function csrfHeaders(refresh: boolean) {
  if (refresh || !getCsrfToken()) await fetchCsrfToken();
  return getCsrfHeaders();
}

export async function markInAppNotificationRead(notificationId: string): Promise<boolean> {
  const send = async (refresh: boolean) => {
    const headers = await csrfHeaders(refresh);
    if (!headers['X-CSRF-Token']) return null;
    return fetch(getApiUrl(`/in-app-notifications/${notificationId}/read`), {
      method: 'PATCH',
      credentials: 'include',
      headers,
    });
  };
  let response = await send(false);
  // A rejected (expired) CSRF token: get a new one and try once more.
  if (response?.status === 403) response = await send(true);
  return response?.ok ?? false;
}
