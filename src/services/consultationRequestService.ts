import { UploadedFile, ApplicationDocument } from '../types/fileUpload';

import { buildBackendUrl } from '../utils/apiConfig';

const API_BASE = buildBackendUrl('/backend/api/applications');

export interface ConsultationRequest {
  applicationId: string;
  consultationId: string;
  sentDate?: string;
  secondDate?: string;
  uploadedFiles?: UploadedFile[];
  applicationDocuments?: ApplicationDocument[];
  createdBy?: string;
  lastUpdatedBy?: string;
  status?: string;
}

export interface ConsultationRequestResponse {
  consultationId: string;
  sentDate?: string;
  secondDate?: string;
  uploadedFiles: UploadedFile[];
  applicationDocuments: ApplicationDocument[];
  consultationDetails?: Record<string, unknown>;
}

/**
 * Save consultation request with sent date and documents
 */
export async function saveConsultationRequest(data: ConsultationRequest): Promise<{success: boolean; data?: Record<string, unknown>}> {
  const url = `${API_BASE}/${data.applicationId}/consultations/${data.consultationId}/request`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to save consultation request');
  }
  return await res.json();
}

/**
 * Get consultation request details including sent date and documents
 */
export async function getConsultationRequest(applicationId: string, consultationId: string): Promise<ConsultationRequestResponse> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/request`;
  const res = await fetch(url, { 
    method: 'GET', 
    credentials: 'include' 
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch consultation request');
  }
  return await res.json();
}
