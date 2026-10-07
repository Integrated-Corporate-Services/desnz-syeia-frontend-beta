export const NOTIFICATION_POLL_INTERVAL_MS = 60_000;

// Sent after a notification is marked read, so the navigation count updates straight away.
export const NOTIFICATIONS_CHANGED_EVENT = 'in-app-notifications:changed';

export const NOTIFICATIONS_PATH = '/notifications';

export const NOTIFICATIONS_PAGE_SIZE = 10;

export const NOTIFICATIONS_MESSAGES = {
  PAGE_TITLE: 'Notifications',
  BACK: 'Back',
  NONE: 'You have no notifications.',
  LOADING: 'Loading notifications',
  LOAD_FAILED: 'Your notifications could not be loaded. Try again shortly.',
  UNREAD: 'Unread',
  READ: 'Read',
  GO_TO_APPLICATIONS: 'Go to your applications',
  // Unread notifications are listed first, then read ones, newest first within each.
  summary: (total: number, unread: number) =>
    `${total} ${total === 1 ? 'notification' : 'notifications'}: ${unread} unread and ${total - unread} read.`,
} as const;
