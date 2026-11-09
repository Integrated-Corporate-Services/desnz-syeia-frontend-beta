import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { DOCUMENT_CATEGORIES, DOCUMENT_GROUP_CATEGORIES } from '../constants/orderDocumentsConstants';
import type { CpoDocument, DocumentStep, OrderDocumentsResponse, UploadStep } from '../types/orderDocuments';

type DocumentResource = {
  document_id: string;
  category: string;
  filename: string;
  file_size_bytes: number;
  uploaded_at: string;
  file_id: string;
  s3_key: string;
  file_content_type: string;
  added_by: string;
  added_at: string;
};

type OrderDocumentsApiResponse = { application_id: string; content_version: number; documents: DocumentResource[]; can_edit?: boolean };

const MINIMUM_ORDER_FILES = 2;
const MESSAGES = {
  order: 'Upload the digitally certified order and at least one order map as separate files',
  reasons: 'Upload the statement of reasons',
} as const;

// The page PATCH ids the backend accepts; the maps step has no page of its own.
const PAGE_ID: Partial<Record<UploadStep, 'order' | 'reasons' | 'additional'>> = { order: 'order', reasons: 'reasons', additional: 'additional' };

// Latest content version seen per application in this tab; every GET and PATCH refreshes it.
const versions = new Map<string, number>();

const endpoint = (applicationId: string) => buildBackendUrl(`/api/cpo/${applicationId}/order-documents`);

async function readResponse(applicationId: string, response: Response): Promise<OrderDocumentsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (response.status === 400 || response.status === 409) && typeof body.message === 'string'
      ? body.message : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to update this application.'
          : response.status === 404 ? 'Order documents not found.'
            : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
              : 'Unable to load or save order documents. Try again.';
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result: OrderDocumentsApiResponse = await response.json();
  versions.set(applicationId, result.content_version);
  const documents: CpoDocument[] = (result.documents || []).map((document) => ({
    ...document, application_id: result.application_id, uploaded_at_timestamp: document.uploaded_at,
  }));
  return { orderDetails: {}, documents };
}

const uniqueFiles = (documents: CpoDocument[], step: UploadStep) =>
  new Set(documents.filter((document) => DOCUMENT_GROUP_CATEGORIES[step as 'order'].includes(document.category)).map((document) => document.file_id)).size;

// The backend derives completion from the stored files; these checks keep the existing "Continue" messages.
function requiredFilesProblem(documents: CpoDocument[], step: DocumentStep): string | null {
  const steps: UploadStep[] = step === 'check' ? ['order', 'reasons'] : step === 'order' || step === 'reasons' ? [step] : [];
  for (const item of steps) {
    if (item === 'order' && uniqueFiles(documents, 'order') < MINIMUM_ORDER_FILES) return MESSAGES.order;
    if (item === 'reasons' && uniqueFiles(documents, 'reasons') < 1) return MESSAGES.reasons;
  }
  return null;
}

export const cpoOrderDocumentsService = {
  get: async (applicationId: string): Promise<OrderDocumentsResponse> =>
    readResponse(applicationId, await fetch(endpoint(applicationId), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    })),

  save: async (applicationId: string, step: DocumentStep, saveForLater: boolean, confirmed: boolean | null = null): Promise<OrderDocumentsResponse> => {
    // Refresh first so the PATCH confirms exactly the files that exist now.
    const current = await cpoOrderDocumentsService.get(applicationId);
    if (!saveForLater) {
      if (step === 'check' && confirmed !== true) throw new Error('Select yes if everything in this section is correct');
      const problem = requiredFilesProblem(current.documents, step);
      if (problem) throw new Error(problem);
    }

    const pageId = step === 'check' ? undefined : PAGE_ID[step];
    if (!pageId) return current;

    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      headers = getCsrfHeaders();
    }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    const category = DOCUMENT_CATEGORIES[step as UploadStep];
    return readResponse(applicationId, await fetch(endpoint(applicationId), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...headers },
      body: JSON.stringify({
        expected_content_version: versions.get(applicationId),
        page_id: pageId,
        data: {
          documents: current.documents
            .filter((document) => document.category === category)
            .map((document) => ({ document_id: document.document_id, category })),
        },
      }),
    }));
  },
};
