
import { 
  GDSTagColor, 
  StatusConfig, 
  StatusConfigMap,
  createStatusHelpers,
} from '../utils/statusUtils';

// Re-export shared types and utilities
export type { GDSTagColor, StatusConfig };
export { normalizeStatus } from '../utils/statusUtils';

/**
 * Application Status Constants
 */
export const APPLICATION_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  INCOMPLETE: 'Incomplete',
  CANNOT_START_YET: 'Cannot start yet',
  NOT_COMPLETED: 'Not completed',
  ON_HOLD: 'On hold',
  DECLINED: 'Declined',
  NEGOTIATED: 'Negotiated',
  PAYMENT_PENDING: 'Payment pending',
  GRANTED: 'Granted',
  HEARING_PENDING: 'Hearing pending',
} as const;


export const APPLICATION_STATUS_CONFIG: StatusConfigMap = {
  // Draft and initial states
  'draft': { value: 'draft', label: 'Draft', color: 'grey' },
  
  // Submitted and review states
  'submitted': { value: 'submitted', label: 'Application submitted', color: 'light-blue' },
  'in review': { value: 'in review', label: 'Under review', color: 'blue' },
  'under review': { value: 'under review', label: 'Under review', color: 'blue' },
  'in progress': { value: 'in progress', label: 'In progress', color: 'blue' },
  'processing payment': { value: 'processing payment', label: 'Processing payment', color: 'yellow' },
  
  // Action required states
  'further information requested': { value: 'further information requested', label: 'Further information requested', color: 'red' },
  'representation stage': { value: 'representation stage', label: 'Representation stage', color: 'blue' },
  'in abeyance': { value: 'in abeyance', label: 'In abeyance', color: 'yellow' },
  
  // Decision states
  'decision issued': { value: 'decision issued', label: 'Decision issued', color: 'blue' },
  'granted': { value: 'granted', label: 'Granted', color: 'green' },
  'declined': { value: 'declined', label: 'Declined', color: 'orange' },
  'approved': { value: 'approved', label: 'Approved', color: 'green' },
  'rejected': { value: 'rejected', label: 'Rejected', color: 'red' },
  
  // Terminal states
  'completed': { value: 'completed', label: 'Completed', color: 'green' },
  'archived': { value: 'archived', label: 'Archived', color: 'grey' },
  'withdrawn': { value: 'withdrawn', label: 'Withdrawn', color: 'grey' },
  'invalid': { value: 'invalid', label: 'Invalid', color: 'grey' },
  
  // Legacy statuses
  'on hold': { value: 'on hold', label: 'On hold', color: 'yellow' },
  'negotiated': { value: 'negotiated', label: 'Negotiated', color: 'blue' },
  'payment pending': { value: 'payment pending', label: 'Payment pending', color: 'yellow' },
  'hearing pending': { value: 'hearing pending', label: 'Hearing pending', color: 'yellow' },
  
  // Other states
  'incomplete': { value: 'incomplete', label: 'Incomplete', color: 'yellow' },
  'cannot start yet': { value: 'cannot start yet', label: 'Cannot start yet', color: 'grey' },
  'not completed': { value: 'not completed', label: 'Not completed', color: 'grey' },
};

/**
 * Create specialized helper functions for application statuses
 * Uses Factory Pattern from statusUtils
 */
const applicationStatusHelpers = createStatusHelpers(APPLICATION_STATUS_CONFIG);

/**
 * Get application status configuration by status value
 * @param status - Status value to lookup
 * @returns Status configuration or null if not found
 */
export const getApplicationStatusConfig = applicationStatusHelpers.getConfig;

/**
 * Get GDS tag CSS class for application status
 * @param status - Status value
 * @returns GDS tag CSS class string (e.g., 'govuk-tag govuk-tag--blue')
 */
export const getApplicationStatusTagClass = applicationStatusHelpers.getTagClass;

/**
 * Get display label for application status
 * @param status - Status value
 * @returns User-friendly display label
 */
export const getApplicationStatusLabel = applicationStatusHelpers.getLabel;

/**
 * Get application status display information (label + className)
 * @param status - Status value
 * @returns Object with label and className
 */
export const getApplicationStatusDisplay = applicationStatusHelpers.getDisplay;

/**
 * TypeScript type for application status values
 */
export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];