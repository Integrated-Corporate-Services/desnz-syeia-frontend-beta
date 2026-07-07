
import { 
  GDSTagColor, 
  StatusConfig, 
  StatusConfigMap,
  createStatusHelpers,
} from '../utils/statusUtils';

// Re-export shared types for convenience
export type { GDSTagColor, StatusConfig };

/**
 * Consultation Status Constants
 */
export const ConsultationStatus = {
  NOT_STARTED: 'Not started yet',
  REQUEST_INCOMPLETE: 'Request Incomplete',
  REQUEST_SENT: 'Request sent',
  COMPLETED: 'Completed',
  WITHDRAWN: 'Withdrawn',
  CLOSED: 'Closed',
  SENT: 'Sent',
  UPLOAD_RESPONSE: 'Upload response',
  NOT_REQUIRED: 'Not required',
  DRAFT: 'Draft',
  PUBLIC_NOTICES_PUBLISHED: 'Public notices published',
} as const;

/**
 * Consultation Status Configuration with GDS Colors
 * Maps consultation statuses to their display labels and colors
 */
export const CONSULTATION_STATUS_CONFIG: StatusConfigMap = {
  // Initial states
  'not started yet': { value: 'not started yet', label: 'Not started yet', color: 'grey' },
  'draft': { value: 'draft', label: 'Draft', color: 'grey' },
  
  // In progress states
  'request incomplete': { value: 'request incomplete', label: 'Request incomplete', color: 'yellow' },
  'request sent': { value: 'request sent', label: 'Request sent', color: 'blue' },
  'sent': { value: 'sent', label: 'Sent', color: 'blue' },
  'upload response': { value: 'upload response', label: 'Upload response', color: 'blue' },
  'public notices published': { value: 'public notices published', label: 'Public notices published', color: 'blue' },
  
  // Completed states
  'completed': { value: 'completed', label: 'Completed', color: 'green' },
  'closed': { value: 'closed', label: 'Closed', color: 'green' },
  'not required': { value: 'not required', label: 'Not required', color: 'green' },
  
  // Terminal states
  'withdrawn': { value: 'withdrawn', label: 'Withdrawn', color: 'grey' },
};

/**
 * Create specialized helper functions for consultation statuses
 * Uses Factory Pattern from statusUtils
 */
const consultationStatusHelpers = createStatusHelpers(CONSULTATION_STATUS_CONFIG);

/**
 * Get consultation status configuration by status value
 * @param status - Status value to lookup
 * @returns Status configuration or null if not found
 */
export const getConsultationStatusConfig = consultationStatusHelpers.getConfig;

/**
 * Get GDS tag CSS class for consultation status
 * @param status - Status value
 * @returns GDS tag CSS class string (e.g., 'govuk-tag govuk-tag--blue')
 */
export const getConsultationStatusTagClass = consultationStatusHelpers.getTagClass;

/**
 * Get display label for consultation status
 * @param status - Status value
 * @returns User-friendly display label
 */
export const getConsultationStatusLabel = consultationStatusHelpers.getLabel;

/**
 * Get consultation status display information (label + className)
 * @param status - Status value
 * @returns Object with label and className
 */
export const getConsultationStatusDisplay = consultationStatusHelpers.getDisplay;

/**
 * TypeScript type for consultation status values
 */
export type ConsultationStatusType = typeof ConsultationStatus[keyof typeof ConsultationStatus];
