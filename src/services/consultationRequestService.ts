import { UploadedFile, ApplicationDocument } from '../types/fileUpload';

const API_BASE = '/backend/api/consultations';

export interface ConsultationRequest {
  consultationId: string;
  sentDate?: string;
  uploadedFiles?: UploadedFile[];
  applicationDocuments?: ApplicationDocument[];
  createdBy?: string;
  lastUpdatedBy?: string;
  status?: string;
}

export interface ConsultationRequestResponse {
  consultationId: string;
  sentDate?: string;
  uploadedFiles: UploadedFile[];
  applicationDocuments: ApplicationDocument[];
  consultationDetails?: Record<string, unknown>;
}

/**
 * Save consultation request with sent date and documents
 */
export async function saveConsultationRequest(data: ConsultationRequest): Promise<{success: boolean; data?: Record<string, unknown>}> {
  const url = `${API_BASE}/${data.consultationId}/save-consultation-request`;
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
export async function getConsultationRequest(consultationId: string): Promise<ConsultationRequestResponse> {
  const url = `${API_BASE}/${consultationId}/get-consultation-request`;
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
