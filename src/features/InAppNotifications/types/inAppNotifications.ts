export type InAppNotificationStatus = 'unread' | 'read';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  status: InAppNotificationStatus;
}

export interface InAppNotificationsResponse {
  notifications: InAppNotification[];
}

export interface UnreadNotificationCountResponse {
  count: number;
}