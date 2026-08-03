/**
 * Service for Application Details API calls
 * Following the pattern from objectorDetailsService.ts
 */

import { createLogger } from '../../../../utils/logger';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { buildBackendUrl } from '../../../../utils/apiConfig';
import { getCsrfHeaders } from '../../../../utils/csrf';
import { parseBackendValidationErrors } from '../../../../utils/apiErrorHandler';

const logger = createLogger('ApplicationDetailsService');

export interface DocumentInfo {
  document_id: string;
  file_id: string;
  filename: string;
  uploaded_at: string;
  file_size: number;
  category: string;
  s3_key: string;
  file_content_type: string;
}

export interface ApplicationDetailsData {
  application_details_id?: string;
  application_id?: string;
  type_of_use?: string;
  wayleave_offer_date?: string;
  wayleave_offer_documents?: DocumentInfo[];
  grounds_for_application?: string;
  wayleave_type?: string;
  wayleave_expiry_date?: string;
  implied_wayleave_documents?: DocumentInfo[];
  notice_to_terminate_date?: string;
  notice_to_terminate_documents?: DocumentInfo[];
  termination_period_expired?: boolean;
  notice_to_remove_date?: string;
  notice_to_remove_documents?: DocumentInfo[];
  is_notice_to_remove_clear?: boolean;
  notice_to_remove_unclear_explanation?: string;
  is_within_three_months?: boolean;
  application_outside_timeframe_explanation?: string;
  is_standard_term?: boolean;
  standard_term_explanation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateApplicationDetailsPayload {
  application_id: string;
  type_of_use: string;
  wayleave_offer_date?: string | null;
  wayleave_offer_document_ids?: string[];
  wayleave_offer_uploaded_files?: UploadedFile[];
  wayleave_offer_application_documents?: ApplicationDocument[];
  grounds_for_application?: string | null;
  wayleave_type?: string | null;
  wayleave_expiry_date?: string | null;
  implied_wayleave_document_ids?: string[];
  implied_wayleave_uploaded_files?: UploadedFile[];
  implied_wayleave_application_documents?: ApplicationDocument[];
  notice_to_terminate_date?: string | null;
  notice_to_terminate_document_ids?: string[];
  notice_to_terminate_uploaded_files?: UploadedFile[];
  notice_to_terminate_application_documents?: ApplicationDocument[];
  termination_period_expired?: boolean | null;
  notice_to_remove_date?: string | null;
  notice_to_remove_document_ids?: string[];
  notice_to_remove_uploaded_files?: UploadedFile[];
  notice_to_remove_application_documents?: ApplicationDocument[];
  is_notice_to_remove_clear?: boolean | null;
  notice_to_remove_unclear_explanation?: string | null;
  is_within_three_months?: boolean | null;
  application_outside_timeframe_explanation?: string | null;
  is_standard_term?: boolean | null;
  standard_term_explanation?: string | null;
}

/**
 * Create or update application details data
 * First page should create, subsequent pages update
 * @param applicationId - The application ID
 * @param data - Application details data to save
 * @param pageId - Page ID for page-specific validation (required, must be string)
 */
export const createOrUpdateApplicationDetails = async (
  applicationId: string,
  data: CreateApplicationDetailsPayload,
  pageId: string
): Promise<ApplicationDetailsData> => {
  if (!pageId) {
    throw new Error('Page ID is required for application details updates');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Correlation-ID': generateCorrelationId(),
    'X-Page-ID': pageId,
    ...getCsrfHeaders(),
  };

  // URL without page parameter - page ID is sent in header
  const url = buildBackendUrl(`/api/nwl/${applicationId}/application-details`);

  logger.info('Saving application details', { applicationId, pageId });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.error('Failed to save application details', { errorData });
    const error: any = new Error(errorData.message || errorData.error || 'Failed to save application details');
    error.status = response.status;
    error.validationErrors = parseBackendValidationErrors(errorData);
    throw error;
  }

  const result = await response.json();
  logger.info('Application details saved successfully', { application_details_id: result.application_details_id });
  return result;
};

/**
 * Update specific fields in application details
 * @param applicationId - The application ID
 * @param data - Partial data to update
 * @param pageId - Page ID for page-specific validation (required, must be string)
 */
export const updateApplicationDetailsFields = async (
  applicationId: string,
  data: Partial<CreateApplicationDetailsPayload>,
  pageId: string
): Promise<ApplicationDetailsData> => {
  // Ensure application_id is included
  const payload = { ...data, application_id: applicationId };
  
  return createOrUpdateApplicationDetails(applicationId, payload as CreateApplicationDetailsPayload, pageId);
};

/**
 * Fetch application details data
 * @param applicationId - The application ID
 */
export const fetchApplicationDetails = async (
  applicationId: string
): Promise<ApplicationDetailsData | null> => {
  const headers: HeadersInit = {
    'X-Correlation-ID': generateCorrelationId(),
  };

  const response = await fetch(buildBackendUrl(`/api/nwl/${applicationId}/application-details`), {
    credentials: 'include',
    headers,
  });

  if (response.status === 404) {
    // No application details exist yet
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.error('Failed to fetch application details', { errorData });
    const error: any = new Error(errorData.message || errorData.error || 'Failed to fetch application details');
    error.status = response.status;
    error.validationErrors = parseBackendValidationErrors(errorData);
    throw error;
  }

  const result = await response.json();
  logger.info('Application details fetched successfully');
  return result;
};

/**
 * Validate date input
 */
export const validateDate = (day: string, month: string, year: string): boolean => {
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (
    isNaN(dayNum) ||
    isNaN(monthNum) ||
    isNaN(yearNum) ||
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 1900 ||
    yearNum > 2100
  ) {
    return false;
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);
  return (
    date.getFullYear() === yearNum &&
    date.getMonth() === monthNum - 1 &&
    date.getDate() === dayNum
  );
};

/**
 * Validate that date is not in the future
 */
export const validateDateNotInFuture = (day: string, month: string, year: string): boolean => {
  if (!validateDate(day, month, year)) return false;
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const inputDate = new Date(yearNum, monthNum - 1, dayNum);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate <= today;
};

/**
 * Validate that date is at least 21 days in the past
 */
export const validateDateAtLeast21DaysAgo = (day: string, month: string, year: string): boolean => {
  if (!validateDate(day, month, year)) return false;
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const inputDate = new Date(yearNum, monthNum - 1, dayNum);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate date 21 days ago
  const twentyOneDaysAgo = new Date(today);
  twentyOneDaysAgo.setDate(today.getDate() - 21);
  
  return inputDate <= twentyOneDaysAgo;
};

/**
 * Format date for API
 */
export const formatDateForAPI = (day: string, month: string, year: string): string => {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Parse date from API format
 */
export const parseDateFromAPI = (
  dateString: string
): { day: string; month: string; year: string } | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return {
    day: date.getDate().toString(),
    month: (date.getMonth() + 1).toString(),
    year: date.getFullYear().toString(),
  };
};

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  DATE_REQUIRED: 'Enter a date',
  DATE_INVALID: 'Enter a valid date',
  DATE_FUTURE: 'Date must not be in the future',
  DATE_NOT_21_DAYS_AGO: 'The notice must have been served to the objector more than 21 days ago. You cannot continue your application at this time.',
  RADIO_REQUIRED: 'Select an option',
  TEXT_REQUIRED: 'Enter your explanation',
  TEXT_MAX_LENGTH: (max: number) => `Enter no more than ${max} characters`,
};
