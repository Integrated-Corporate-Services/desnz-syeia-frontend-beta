/**
 * Page IDs for Assets validation
 * These must match the backend PAGE_IDS in assetsPageValidators.ts
 * Using descriptive page names for better clarity and maintainability
 */
export const ASSETS_PAGE_IDS = {
  ADD_ASSET: 'add-asset',
  UPLOAD_PLAN: 'upload-plan',
  ASSETS_MATCH_PLAN: 'assets-match-plan',
} as const;

export type AssetsPageId = typeof ASSETS_PAGE_IDS[keyof typeof ASSETS_PAGE_IDS];
