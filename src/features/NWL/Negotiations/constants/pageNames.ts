/**
 * Page IDs for Negotiations validation
 * These must match the backend PAGE_IDS in negotiationsPageValidators.ts
 * Using descriptive page names for better clarity and maintainability
 */
export const NEGOTIATIONS_PAGE_IDS = {
  TELL_US_NEGOTIATIONS: 'tell-us-negotiations',
  EVIDENCE_OF_NEGOTIATIONS: 'evidence-of-negotiations',
  WHY_NO_NEGOTIATIONS: 'why-no-negotiations',
} as const;

export type NegotiationsPageId = typeof NEGOTIATIONS_PAGE_IDS[keyof typeof NEGOTIATIONS_PAGE_IDS];
