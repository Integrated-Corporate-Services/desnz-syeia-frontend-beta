/**
 * Page IDs for Application Details validation
 * These must match the backend PAGE_IDS in nwlConstants.ts
 * Using numeric IDs instead of string names for better control and consistency
 */
export const APPLICATION_DETAILS_PAGE_IDS = {
  TYPE_OF_USE: 1,
  WAYLEAVE_OFFER: 2,
  GROUNDS_FOR_APPLICATION: 3,
  WAYLEAVE_TYPE: 4,
  WAYLEAVE_EXPIRY_DATE: 5,
  UPLOAD_IMPLIED_WAYLEAVE: 6,
  UPLOAD_WRITTEN_WAYLEAVE: 7,
  NOTICE_TO_TERMINATE: 8,
  TERMINATION_PERIOD_EXPIRED: 9,
  NOTICE_TO_REMOVE: 10,
  NOTICE_TO_REMOVE_CLEAR: 11,
  NOTICE_TO_REMOVE_UNCLEAR: 12,
  APPLICATION_WITHIN_THREE_MONTHS: 13,
  APPLICATION_OUTSIDE_TIMEFRAME: 14,
  STANDARD_TERM: 15,
} as const;

export type ApplicationDetailsPageId = typeof APPLICATION_DETAILS_PAGE_IDS[keyof typeof APPLICATION_DETAILS_PAGE_IDS];
