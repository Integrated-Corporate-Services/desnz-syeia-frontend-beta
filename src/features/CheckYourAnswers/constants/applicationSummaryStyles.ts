// src/features/CheckYourAnswers/constants/applicationSummaryStyles.ts

/**
 * Application Summary Style Classes
 * CSS class mappings for status tags and UI elements
 */

export const STATUS_TAG_CLASSES: Record<string, string> = {
  'processing': 'govuk-tag--yellow',
  'payment': 'govuk-tag--yellow',
  'draft': 'govuk-tag--grey',
  'submitted': 'govuk-tag--green',
  'approved': 'govuk-tag--green',
  'under review': 'govuk-tag--blue',
  'rejected': 'govuk-tag--red',
  'default': ''
} as const;

export const UI_CLASSES = {
  CONTAINER: 'govuk-width-container',
  MAIN_WRAPPER: 'govuk-main-wrapper',
  BACK_LINK: 'govuk-back-link',
  BREADCRUMBS: 'govuk-breadcrumbs',
  ERROR_SUMMARY: 'govuk-error-summary',
  ERROR_TITLE: 'govuk-error-summary__title',
  SUMMARY_CARD: 'govuk-summary-card',
  SUMMARY_LIST: 'govuk-summary-list',
  BUTTON_GROUP: 'govuk-button-group',
  BUTTON_SECONDARY: 'govuk-button govuk-button--secondary',
  SECTION_BREAK: 'govuk-section-break govuk-section-break--l govuk-section-break--visible'
} as const;