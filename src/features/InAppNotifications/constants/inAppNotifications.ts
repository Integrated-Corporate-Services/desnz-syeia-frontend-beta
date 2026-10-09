export const NOTIFICATION_POLL_INTERVAL_MS = 60_000;

// Sent after a notification is marked read, so the navigation count updates straight away.
export const NOTIFICATIONS_CHANGED_EVENT = 'in-app-notifications:changed';

export const NOTIFICATIONS_PATH = '/notifications';

// The backend's notification types this page links (SYEIA-2400).
export const NOTIFICATION_TYPES = {
  ACCESS_REQUEST_SUBMITTED: 'ACCESS_REQUEST_SUBMITTED',
  ACCESS_REQUEST_DECIDED: 'ACCESS_REQUEST_DECIDED',
} as const;

// The read-only summary a decision notification opens.
export const NOTIFICATION_DECISION_ROUTE = `${NOTIFICATIONS_PATH}/:notificationId/decision`;
export const notificationDecisionPath = (notificationId: string) =>
  `${NOTIFICATIONS_PATH}/${encodeURIComponent(notificationId)}/decision`;

// PLACEHOLDER wording for the decision summary, to be confirmed by the business analyst.
export const DECISION_MESSAGES = {
  PAGE_TITLE: 'Registration request decision',
  BACK: 'Back',
  LOADING: 'Loading the decision',
  LOAD_FAILED: 'The decision could not be loaded. Try again shortly.',
  NOT_FOUND: 'This notification could not be found.',
  NO_LONGER_SHOWN:
    'The applicant has sent this registration request again since this decision, so its details are no longer shown.',
  APPLICANT: 'Applicant',
  ORGANISATION: 'Organisation',
  DECISION: 'Decision',
  DECIDED_BY: 'Decided by',
  DECIDED_ON: 'Date decided',
  REASON: 'Reason for rejection',
  OUTCOME: { APPROVED: 'Approved', REJECTED: 'Rejected' },
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
  // Unread notifications are listed first, then read ones, newest first within each.
  summary: (total: number, unread: number) =>
    `${total} ${total === 1 ? 'notification' : 'notifications'}: ${unread} unread and ${total - unread} read.`,
} as const;
