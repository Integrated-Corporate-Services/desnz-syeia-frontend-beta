import axios from 'axios';
import { AdditionalInformationData } from '../types';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { parseBackendValidationErrors } from '../../../../utils/apiErrorHandler';

import { buildBackendUrl } from '../../../../utils/apiConfig';

const API_BASE_URL = buildBackendUrl('/api/nwl');

// Re-export Page IDs for convenience
export { ADDITIONAL_INFO_PAGE_IDS } from '../constants/pageNames';

/**
 * Get additional information data for an application
 */
export const getAdditionalInformationData = async (
  applicationId: string
): Promise<AdditionalInformationData | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/${applicationId}/additional-information`
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    // Parse validation errors if present
    if (axios.isAxiosError(error) && error.response?.data) {
      const err: any = new Error(error.message);
      err.status = error.response.status;
      err.validationErrors = parseBackendValidationErrors(error.response.data);
      throw err;
    }
    throw error;
  }
};

/**
 * Create or update additional information data for an application
 * Uses POST to create/upsert in the backend
 * @param applicationId - Application ID
 * @param data - Additional information data
 * @param pageId - Optional Page ID for page-specific validation (e.g., 'related-applications', 'other-important-info', 'important-info-details')
 */
export const createOrUpdateAdditionalInformationData = async (
  applicationId: string,
  data: {
    has_related_applications: boolean;
    related_applications_details?: string;
    has_other_information?: boolean;
    other_information_details?: string;
    additional_document_ids?: string[];
    uploaded_files?: UploadedFile[];
    application_documents?: ApplicationDocument[];
  },
  pageId?: string
): Promise<void> => {
  // Clean the data object to remove undefined/null fields
  const cleanData: Record<string, unknown> = {
    application_id: applicationId,
    has_related_applications: data.has_related_applications,
    has_other_information: data.has_other_information,
  };

  // Only include related_applications_details if it exists and has_related_applications is true
  if (data.has_related_applications && data.related_applications_details) {
    cleanData.related_applications_details = data.related_applications_details;
  }

  // Only include other_information_details if it exists and has_other_information is true
  if (data.has_other_information && data.other_information_details) {
    cleanData.other_information_details = data.other_information_details;
  }

  // Include uploaded files and documents for database persistence
  if (data.uploaded_files && data.uploaded_files.length > 0) {
    cleanData.uploaded_files = data.uploaded_files;
  }

  if (data.application_documents && data.application_documents.length > 0) {
    cleanData.application_documents = data.application_documents;
  }

  // Only include additional_document_ids if it exists and has items
  if (data.additional_document_ids && data.additional_document_ids.length > 0) {
    cleanData.additional_document_ids = data.additional_document_ids;
  }

  const headers: Record<string, string> = {};
  // Add X-Page-ID header if pageId is provided for page-specific validation
  if (pageId) {
    headers['X-Page-ID'] = pageId;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/additional-information`,
      cleanData,
      { headers }
    );
  } catch (error: unknown) {
    // Parse validation errors if present
    if (axios.isAxiosError(error) && error.response?.data) {
      const err: any = new Error(error.message);
      err.status = error.response.status;
      err.validationErrors = parseBackendValidationErrors(error.response.data);
      throw err;
    }
    throw error;
  }
};

/**
 * Update additional information data for an application
 * @deprecated Use createOrUpdateAdditionalInformationData instead
 */
export const updateAdditionalInformationData = async (
  applicationId: string,
  data: Partial<AdditionalInformationData>
): Promise<void> => {
  // Map to backend format and use POST endpoint
  const backendData: Record<string, unknown> = {
    application_id: applicationId,
  };

  if (data.has_related_applications !== undefined) {
    backendData.has_related_applications = data.has_related_applications;
  }
  if (data.related_applications_details !== undefined) {
    backendData.related_applications_details = data.related_applications_details;
  }
  if (data.has_other_information !== undefined) {
    backendData.has_other_information = data.has_other_information;
  }
  if (data.other_information_details !== undefined) {
    backendData.other_information_details = data.other_information_details;
  }

  try {
    await axios.post(`${API_BASE_URL}/additional-information`, backendData);
  } catch (error: unknown) {
    // Parse validation errors if present
    if (axios.isAxiosError(error) && error.response?.data) {
      const err: any = new Error(error.message);
      err.status = error.response.status;
      err.validationErrors = parseBackendValidationErrors(error.response.data);
      throw err;
    }
    throw error;
  }
};
