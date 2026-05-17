import axios from 'axios';
import { AdditionalInformationData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend/api';

/**
 * Get additional information data for an application
 */
export const getAdditionalInformationData = async (
  applicationId: string
): Promise<AdditionalInformationData | null> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/nwl/${applicationId}/additional-information`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create or update additional information data for an application
 * Uses POST to create/upsert in the backend
 */
export const createOrUpdateAdditionalInformationData = async (
  applicationId: string,
  data: {
    has_related_applications: boolean;
    related_applications_details?: string;
    has_other_information: boolean;
    other_information_details?: string;
    additional_document_ids?: string[];
  }
): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/nwl/additional-information`,
    {
      application_id: applicationId,
      ...data,
    }
  );
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
  const backendData: any = {
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

  await axios.post(`${API_BASE_URL}/nwl/additional-information`, backendData);
};
