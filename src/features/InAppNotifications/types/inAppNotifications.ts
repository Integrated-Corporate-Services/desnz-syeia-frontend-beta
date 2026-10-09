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

// The read-only summary a decision notification (ACCESS_REQUEST_DECIDED) opens. decision is null when the
// applicant has sent the request again since, so the decision it reported is no longer on record.
export interface NotificationDecisionSummary {
  id: string;
  message: string;
  notifiedAt: string;
  organisationName: string;
  decision: {
    outcome: 'APPROVED' | 'REJECTED';
    applicantName: string | null;
    decidedBy: string | null;
    decidedAt: string | null;
    rejectionReason: string | null;
  } | null;
}

export type NotificationDecisionResult =
  | { status: 'found'; summary: NotificationDecisionSummary }
  | { status: 'not-found' }
  | { status: 'failed' };
