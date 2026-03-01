import axios from 'axios';

export interface GenerateDocumentRequest {
  documentType: 'lpa-consultation-form' | 'letter' | 'declaration' | 'receipt' | 'report';
  applicationId: string;
  data: Record<string, unknown>;
}

export interface GenerateDocumentResponse {
  documentId: string;
  filename: string;
  mimeType: string;
  url: string;
  created: boolean;
}

export interface GeneratingResponse {
  documentId: string;
  status: 'GENERATING';
}

export type GenerateResult = GenerateDocumentResponse | GeneratingResponse;

/**
 * Generate a document via the backend API
 * @param request Document generation request containing documentType, applicationId, and data
 * @returns GenerateResult which is either a ready document or a GENERATING status
 */
export async function generateDocument(
  request: GenerateDocumentRequest
): Promise<GenerateResult> {
  const response = await axios.post<GenerateResult>(
    '/backend/api/documents/generate',
    request
  );
  return response.data;
}

/**
 * Download a generated document
 * @param documentId The ID of the document to download
 * @returns The full download URL (includes backend prefix)
 */
export function getDocumentDownloadUrl(documentId: string): string {
  return `/backend/api/documents/download/${documentId}`;
}

/**
 * Generate an LPA Consultation Form document
 * @param applicationId The application ID
 * @param consultationId Optional consultation ID
 * @returns GenerateResult
 */
export async function generateLpaConsultationForm(
  applicationId: string,
  consultationId?: string
): Promise<GenerateResult> {
  return generateDocument({
    documentType: 'lpa-consultation-form',
    applicationId,
    data: {
      consultationId,
      // Additional data can be added here as needed
      // In production, this would come from the application/consultation data
    },
  });
}
