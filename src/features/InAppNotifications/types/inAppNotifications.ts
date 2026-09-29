export type InAppNotificationType = 'APPLICATION_REASSIGNED';

export interface InAppNotification {
  id: string;
  type: InAppNotificationType;
  applicationId: string | null;
  applicationType: string | null;
  desnzRef: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

// One page of notifications, with the totals across all pages.
export interface InAppNotificationsResponse {
  notifications: InAppNotification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
}

export interface UnreadNotificationCountResponse {
  count: number;
}
