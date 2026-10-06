import { getCsrfHeaders } from '../../../utils/csrf';
import { getApiUrl } from '../../../utils/apiConfig';
import type {
  InAppNotificationsResponse,
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

export async function markInAppNotificationRead(notificationId: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/in-app-notifications/${notificationId}/read`), {
    method: 'PATCH',
    credentials: 'include',
    headers: getCsrfHeaders(),
  });
  return response.ok;
}