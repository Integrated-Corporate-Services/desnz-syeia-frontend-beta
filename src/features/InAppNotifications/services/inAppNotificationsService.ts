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

export async function getInAppNotifications(): Promise<InAppNotificationsResponse['notifications'] | null> {
  const response = await request<InAppNotificationsResponse>('/in-app-notifications');
  return response?.notifications ?? null;
}

export async function markInAppNotificationRead(notificationId: string): Promise<boolean> {
  const response = await fetch(getApiUrl(`/in-app-notifications/${notificationId}/read`), {
    method: 'PATCH',
    credentials: 'include',
    headers: getCsrfHeaders(),
  });
  return response.ok;
}