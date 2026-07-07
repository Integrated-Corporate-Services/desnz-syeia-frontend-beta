/**
 * Status Display Constants and Utilities
*/

import { 
  APPLICATION_STATUS,
  APPLICATION_STATUS_CONFIG,
  getApplicationStatusConfig,
  getApplicationStatusLabel,
  normalizeStatus as normalizeStatusFromConfig
} from "../../../constants/status";
import { 
  ConsultationStatus,
  CONSULTATION_STATUS_CONFIG,
  getConsultationStatusConfig,
  getConsultationStatusLabel
} from "../../../constants/consultationStatus";

/**
 * Combined status display labels (backward compatibility)
 */
export const STATUS_DISPLAY_LABELS: Record<string, string> = {
  // Build from application status config
  ...Object.entries(APPLICATION_STATUS_CONFIG).reduce((acc, [key, config]) => {
    acc[key] = config.label;
    return acc;
  }, {} as Record<string, string>),
  
  // Build from consultation status config
  ...Object.entries(CONSULTATION_STATUS_CONFIG).reduce((acc, [key, config]) => {
    acc[key] = config.label;
    return acc;
  }, {} as Record<string, string>),
};

/**
 * Combined status tag classes (backward compatibility)
 */
export const STATUS_TAG_CLASSES: Record<string, string> = {
  // Build from application status config
  ...Object.entries(APPLICATION_STATUS_CONFIG).reduce((acc, [key, config]) => {
    acc[key] = `govuk-tag govuk-tag--${config.color}`;
    return acc;
  }, {} as Record<string, string>),
  
  // Build from consultation status config
  ...Object.entries(CONSULTATION_STATUS_CONFIG).reduce((acc, [key, config]) => {
    acc[key] = `govuk-tag govuk-tag--${config.color}`;
    return acc;
  }, {} as Record<string, string>),
};

/**
 * Statuses that allow editing in application dashboard
 */
export const EDITABLE_STATUSES: readonly string[] = [
  APPLICATION_STATUS.ON_HOLD,
  APPLICATION_STATUS.NEGOTIATED,
  APPLICATION_STATUS.PAYMENT_PENDING,
  APPLICATION_STATUS.HEARING_PENDING,
];

/**
 * Format status text (fallback formatting)
 */
export const formatStatusText = (status: string): string => {
  // Try application status first
  const appLabel = getApplicationStatusLabel(status);
  if (appLabel && appLabel !== status) return appLabel;
  
  // Try consultation status
  const consultLabel = getConsultationStatusLabel(status);
  if (consultLabel && consultLabel !== status) return consultLabel;
  
  // Fallback formatting
  return status
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get status display (label and className)
 * Tries both application and consultation status configs
 */
export const getStatusDisplay = (status: string): { label: string; className: string } => {
  // Try application status first
  const appConfig = getApplicationStatusConfig(status);
  if (appConfig) {
    return {
      label: appConfig.label,
      className: `govuk-tag govuk-tag--${appConfig.color}`,
    };
  }
  
  // Try consultation status
  const consultConfig = getConsultationStatusConfig(status);
  if (consultConfig) {
    return {
      label: consultConfig.label,
      className: `govuk-tag govuk-tag--${consultConfig.color}`,
    };
  }
  
  // Fallback
  return {
    label: formatStatusText(status),
    className: 'govuk-tag',
  };
};

/**
 * Check if status allows editing
 */
export const isEditableStatus = (status: string): boolean => {
  const normalized = normalizeStatusFromConfig(status);
  return EDITABLE_STATUSES.some(s => normalizeStatusFromConfig(s) === normalized);
};

/**
 * Re-export for convenience
 */
export { normalizeStatusFromConfig as normalizeStatus };
export { APPLICATION_STATUS, ConsultationStatus };

// Get status tag CSS class for application dashboard display (legacy function)
export const getStatusTagClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  return STATUS_TAG_CLASSES[normalizedStatus] || "govuk-tag";
};

// Determine if Edit action should be shown for a given status
export const shouldShowEdit = (status: string): boolean => {
  const normalized = normalizeStatusFromConfig(status);
  return EDITABLE_STATUSES.some(s => normalizeStatusFromConfig(s) === normalized);
};
