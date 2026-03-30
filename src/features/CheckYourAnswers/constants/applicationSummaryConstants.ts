// src/features/CheckYourAnswers/constants/applicationSummaryConstants.ts

/**
 * Application Summary Constants
 * Centralized constants for ApplicationSummary component
 */

export const CASE_TYPE_MAP: Record<string, string> = {
  'S37': 'Overhead lines (S37)',
  's37': 'Overhead lines (S37)',
  'NWL': 'Necessary wayleaves',
  'nwl': 'Necessary wayleaves',
  'TLP': 'Tree lopping',
  'tlp': 'Tree lopping'
} as const;

export const DEFAULT_CASE_TYPE = 'Overhead lines (S37)';

export const STATUS_MAP: Record<string, string> = {
  'processing payment': 'Processing payment',
  'processing-payment': 'Processing payment',
  'PROCESSING_PAYMENT': 'Processing payment',
  'payment pending': 'Payment pending',
  'PAYMENT_PENDING': 'Payment pending',
  'payment_pending': 'Payment pending',
  'draft': 'Draft',
  'DRAFT': 'Draft',
  'submitted': 'Submitted',
  'SUBMITTED': 'Submitted',
  'under review': 'Under review',
  'UNDER_REVIEW': 'Under review',
  'approved': 'Approved',
  'APPROVED': 'Approved',
  'rejected': 'Rejected',
  'REJECTED': 'Rejected'
} as const;

export const DEFAULT_STATUS = 'Processing payment';

export const ASSET_PRESENCE_OPTIONS: Record<number, string> = {
  1: 'There are poles within the sensitive areas',
  2: 'All poles are outside of the sensitive areas with only the overhead lines passing above them',
  3: 'No poles are within a sensitive area and no overhead lines pass above them'
} as const;

export const DEFAULT_ASSET_PRESENCE_TEXT = '-';

export const INVOICE_PREFIX = 'INV01';

// Required sections for validation
export const REQUIRED_SECTIONS = [
  { key: "networkOperator", path: ["sections", "networkOperator", "details"] },
  { key: "projectDetails", path: ["sections", "projectDetails", "overview"] },
  { key: "assetInformation", path: ["sections", "projectDetails", "assetInformation"] },
  { key: "location", path: ["sections", "location", "route"] },
  { key: "worksOverview", path: ["sections", "worksOverview"] },
  { key: "sensitiveAreaChecks", path: ["sections", "sensitiveAreaChecks"] },
  { key: "sensitiveAreaReview", path: ["sections", "sensitiveAreaReview"] },
  { key: "parishes", path: ["sections", "parishes"] },
  { key: "supportingQuestions", path: ["sections", "supportingInformation", "supportingQuestions"] },
  { key: "eiaFees", path: ["sections", "supportingInformation", "eiaFees"] },
  { key: "postConsultationOutcome", path: ["sections", "postConsultationOutcome"] },
] as const;