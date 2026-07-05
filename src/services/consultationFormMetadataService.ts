import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';
const API_BASE = buildBackendUrl('/backend/api/applications');

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
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/form-metadata`;
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to get form metadata');
  }
  
  return await res.json();
}

/**
 * Update form metadata
 */
export async function updateFormMetadata(
  applicationId: string,
  consultationId: string,
  data: FormMetadata
): Promise<{ success: boolean; data?: FormMetadata }> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/form-metadata`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update form metadata');
  }
  
  return await res.json();
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