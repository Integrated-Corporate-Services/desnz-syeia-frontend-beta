// src/features/CheckYourAnswers/utils/applicationSummaryUtils.ts
import React from 'react';
import {
  CASE_TYPE_MAP,
  DEFAULT_CASE_TYPE,
  STATUS_MAP,
  DEFAULT_STATUS,
  ASSET_PRESENCE_OPTIONS,
  DEFAULT_ASSET_PRESENCE_TEXT,
  INVOICE_PREFIX
} from '../constants/applicationSummaryConstants';
import { EMPTY_VALUE } from '../constants/applicationSummaryLabels';
import { STATUS_TAG_CLASSES } from '../constants/applicationSummaryStyles';

/**
 * Format case type for display
 * @param formType - Raw form type from API
 * @returns Formatted case type string
 */
export const formatCaseType = (formType?: string): string => {
  if (!formType) return DEFAULT_CASE_TYPE;
  return CASE_TYPE_MAP[formType] || CASE_TYPE_MAP[formType.toUpperCase()] || DEFAULT_CASE_TYPE;
};

/**
 * Format application status for display
 * @param status - Raw status from API
 * @returns Formatted status string
 */
export const formatStatus = (status?: string): string => {
  if (!status) return DEFAULT_STATUS;
  const statusLower = status.toLowerCase();
  return STATUS_MAP[statusLower] || STATUS_MAP[status] || status || DEFAULT_STATUS;
};

/**
 * Get appropriate GOV.UK tag class for status
 * @param status - Application status
 * @returns CSS class for status tag
 */
export const getStatusTagClass = (status?: string): string => {
  if (!status) return STATUS_TAG_CLASSES.default;
  
  const statusLower = status.toLowerCase();
  
  // Check for specific keywords
  if (statusLower.includes('processing') || statusLower.includes('payment')) {
    return STATUS_TAG_CLASSES.processing;
  }
  if (statusLower.includes('draft')) {
    return STATUS_TAG_CLASSES.draft;
  }
  if (statusLower.includes('submitted')) {
    return STATUS_TAG_CLASSES.submitted;
  }
  if (statusLower.includes('approved')) {
    return STATUS_TAG_CLASSES.approved;
  }
  if (statusLower.includes('rejected')) {
    return STATUS_TAG_CLASSES.rejected;
  }
  
  return STATUS_TAG_CLASSES[statusLower] || STATUS_TAG_CLASSES.default;
};

/**
 * Render address fields with line breaks
 * @param fields - Array of address field values
 * @returns React fragment with formatted address
 */
export const renderAddress = (fields: (string | null | undefined)[]): React.ReactNode => {
  const filteredFields = fields.filter((field) => field);
  
  if (filteredFields.length === 0) return EMPTY_VALUE;
  
  return filteredFields.map((field, index) => (
    <React.Fragment key={index}>
      {field}
      {index < filteredFields.length - 1 && <br />}
    </React.Fragment>
  ));
};

/**
 * Map asset presence option ID to descriptive text
 * @param optionId - Asset presence option ID
 * @returns Descriptive text for the option
 */
export const getAssetPresenceText = (optionId?: number): string => {
  if (optionId === undefined || optionId === null) {
    return DEFAULT_ASSET_PRESENCE_TEXT;
  }
  return ASSET_PRESENCE_OPTIONS[optionId] || DEFAULT_ASSET_PRESENCE_TEXT;
};

/**
 * Generate invoice number from DESNZ reference
 * @param desnzRef - DESNZ reference number
 * @returns Invoice filename
 */
export const generateInvoiceNumber = (desnzRef?: string): string | null => {
  if (!desnzRef) return null;
  return `${INVOICE_PREFIX}/${desnzRef}.pdf`;
};

/**
 * Check if all address fields are empty
 * @param fields - Array of address field values
 * @returns True if all fields are empty
 */
export const isAddressEmpty = (fields: (string | null | undefined)[]): boolean => {
  return fields.filter((field) => field).length === 0;
};