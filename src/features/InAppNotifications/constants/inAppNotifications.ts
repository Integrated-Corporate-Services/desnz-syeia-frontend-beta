export const NOTIFICATION_POLL_INTERVAL_MS = 60_000;

// Sent after a notification is marked read, so the navigation count updates straight away.
export const NOTIFICATIONS_CHANGED_EVENT = 'in-app-notifications:changed';

export const NOTIFICATIONS_PATH = '/notifications';

// The backend's notification types (SYEIA-2400). Only one with something to do is a link: a new
// registration opens the request for the Team Coordinator to approve or reject. A decision (sent to every
// Team Coordinator of the organisation, the one who decided included) is shown as text.
export const NOTIFICATION_TYPES = {
  ACCESS_REQUEST_SUBMITTED: 'ACCESS_REQUEST_SUBMITTED',
  ACCESS_REQUEST_DECIDED: 'ACCESS_REQUEST_DECIDED',
} as const;

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
  MARK_READ: 'Mark as read',
  UPDATE_FAILED: 'The notification could not be marked as read. Try again.',
  // Unread notifications are listed first, then read ones, newest first within each.
  summary: (total: number, unread: number) =>
    `${total} ${total === 1 ? 'notification' : 'notifications'}: ${unread} unread and ${total - unread} read.`,
} as const;
