import { useCallback } from "react";

/**
 * Custom hook providing utility functions for formatting application-related data
 * including case types, statuses, and status tag CSS classes.
 */
export const useApplicationFormatters = () => {
  /**
   * Formats case type string into human-readable form
   * @param formType - The form type identifier ('S37' or 'NWL')
   * @returns Formatted case type string
   */
  const formatCaseType = useCallback((formType?: string): string => {
    const typeMap: Record<string, string> = {
      'S37': 'Overhead lines (S37)',
      's37': 'Overhead lines (S37)',
      's-37': 'Overhead lines (S37)',
      'NWL': 'Necessary wayleaves',
      'nwl': 'Necessary wayleaves'
    };
    return typeMap[formType || 'S37'] || 'Overhead lines (S37)';
  }, []);

  /**
   * Formats application status string into standardized display format
   * @param status - The status identifier
   * @returns Formatted status string
   */
  const formatStatus = useCallback((status?: string): string => {
    const statusMap: Record<string, string> = {
      'processing payment': 'Processing payment',
      'processing-payment': 'Processing payment',
      'PROCESSING_PAYMENT': 'Processing payment',
      'payment pending': 'Payment pending',
      'PAYMENT_PENDING': 'Payment pending',
      'draft': 'Draft',
      'DRAFT': 'Draft',
      'submitted': 'Submitted',
      'SUBMITTED': 'Submitted'
    };
    return statusMap[status?.toLowerCase() || ''] || status || 'Processing payment';
  }, []);

  /**
   * Returns the appropriate GOV.UK tag CSS class based on status
   * @param status - The status identifier
   * @returns CSS class name for the status tag
   */
  const getStatusTagClass = useCallback((status?: string): string => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('processing') || statusLower.includes('payment')) {
      return 'govuk-tag--yellow';
    }
    if (statusLower === 'draft') {
      return 'govuk-tag--grey';
    }
    if (statusLower === 'submitted') {
      return 'govuk-tag--green';
    }
    return '';
  }, []);

  return {
    formatCaseType,
    formatStatus,
    getStatusTagClass
  };
};
