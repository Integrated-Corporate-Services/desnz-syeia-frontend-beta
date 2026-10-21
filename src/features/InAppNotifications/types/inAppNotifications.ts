export interface InAppNotification {
  id: string;
  // The backend's notification type, e.g. 'ACCESS_REQUEST_SUBMITTED'.
  type: string;
  applicationId: string | null;
  applicationType: string | null;
  desnzRef: string | null;
  // What the notification is about, e.g. the access request a Team Coordinator should review.
  referenceId: string | null;
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
