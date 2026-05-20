/**
 * Page IDs for Application Details validation
 * These must match the backend PAGE_IDS in nwlConstants.ts
 * Using descriptive page names for better clarity and maintainability
 */
export const APPLICATION_DETAILS_PAGE_IDS = {
  TYPE_OF_USE: 'type-of-use',
  WAYLEAVE_OFFER: 'wayleave-offer',
  GROUNDS_FOR_APPLICATION: 'grounds-for-application',
  WAYLEAVE_TYPE: 'wayleave-type',
  WAYLEAVE_EXPIRY_DATE: 'wayleave-expiry-date',
  UPLOAD_IMPLIED_WAYLEAVE: 'upload-implied-wayleave',
  UPLOAD_WRITTEN_WAYLEAVE: 'upload-written-wayleave',
  NOTICE_TO_TERMINATE: 'notice-to-terminate',
  TERMINATION_PERIOD_EXPIRED: 'termination-period-expired',
  NOTICE_TO_REMOVE: 'notice-to-remove',
  NOTICE_TO_REMOVE_CLEAR: 'notice-to-remove-clear',
  NOTICE_TO_REMOVE_UNCLEAR: 'notice-to-remove-unclear',
  APPLICATION_WITHIN_THREE_MONTHS: 'application-within-three-months',
  APPLICATION_OUTSIDE_TIMEFRAME: 'application-outside-timeframe',
  STANDARD_TERM: 'standard-term',
} as const;

export type ApplicationDetailsPageId = typeof APPLICATION_DETAILS_PAGE_IDS[keyof typeof APPLICATION_DETAILS_PAGE_IDS];
