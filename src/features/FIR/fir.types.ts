export type FirStatus = 'OPEN' | 'RESPONDED' | 'CLOSED' | 'WITHDRAWN' | 'EXPIRED';

export interface FirDocument {
  documentId: string;
  documentCategory: string;
  filename: string;
}

export interface FurtherInformationRequest {
  furtherInformationRequestId: string;
  applicationId: string;
  recipientType: 'APPLICANT' | 'OBJECTOR';
  requestText: string;
  createdAt: string;
  deadlineAt: string;
  status: FirStatus;
  requestedDocumentCategories: string[];
  response?: {
    furtherInformationResponseId: string;
    responseText: string | null;
    submittedAt: string;
    documentCategories: string[];
    documents: FirDocument[];
  } | null;
}