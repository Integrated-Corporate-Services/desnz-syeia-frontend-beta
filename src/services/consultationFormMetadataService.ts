import axios from 'axios';
import { buildBackendUrl } from '../utils/apiConfig';

const API_BASE = buildBackendUrl('/api/applications');

export interface FormMetadata {
  applicantOrganisationName?: string;
  applicantContactName?: string;
  applicantReference?: string;
  // Document metadata (added by backend service layer)
  document?: {
    documentId?: string;
    filename?: string;
    fileSize?: number;
    contentType?: string;
    exists: boolean;
    createdAt?: string;
  };
}

/**
 * Get form metadata
 */
export async function getFormMetadata(
  applicationId: string,
  consultationId: string
): Promise<FormMetadata | null> {
  try {
    const response = await axios.get(
      `${API_BASE}/${applicationId}/consultations/${consultationId}/form-metadata`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw new Error('Failed to get form metadata');
  }
}

/**
 * Update form metadata
 */
export async function updateFormMetadata(
  applicationId: string,
  consultationId: string,
  data: FormMetadata
): Promise<{ success: boolean; data?: FormMetadata }> {
  try {
    const response = await axios.post(
      `${API_BASE}/${applicationId}/consultations/${consultationId}/form-metadata`,
      data
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to update form metadata';
    throw new Error(message);
  }
}

/**
 * Download LPA consultation form as DOCX
 */
export async function downloadConsultationForm(
  applicationId: string,
  consultationId: string
): Promise<Blob> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/download-form`;
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error('Failed to download consultation form');
  }
  
  return await res.blob();
}