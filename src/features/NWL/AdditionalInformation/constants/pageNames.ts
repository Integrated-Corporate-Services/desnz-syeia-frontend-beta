/**
 * Page IDs for Additional Information validation
 * These must match the backend PAGE_IDS in additionalInfoPageValidators.ts
 * Using descriptive page names for better clarity and maintainability
 */
export const ADDITIONAL_INFO_PAGE_IDS = {
  RELATED_APPLICATIONS: 'related-applications',
  OTHER_IMPORTANT_INFO: 'other-important-info',
  IMPORTANT_INFO_DETAILS: 'important-info-details',
} as const;

export type AdditionalInfoPageId = typeof ADDITIONAL_INFO_PAGE_IDS[keyof typeof ADDITIONAL_INFO_PAGE_IDS];
