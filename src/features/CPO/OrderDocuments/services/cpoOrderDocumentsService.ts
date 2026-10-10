import { buildBackendUrl } from '../../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { DocumentStep, OrderDocumentsResponse } from '../types/orderDocuments';

async function readResponse(response: Response): Promise<OrderDocumentsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(response.status === 400 && typeof body.message === 'string'
      ? body.message : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to update this application.'
          : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
            : 'Unable to load or save order documents. Try again.');
  }
  const result = await response.json();
  return { orderDetails: result.orderDetails || {}, documents: result.documents || [], canEdit: result.canEdit };
}

export const cpoOrderDocumentsService = {
  get: async (applicationId: string) => readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-documents`), { credentials: 'include' })),
  save: async (applicationId: string, step: DocumentStep, saveForLater: boolean, confirmed: boolean | null = null) => {
    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      headers = getCsrfHeaders();
    }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');
    return readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-documents`), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ step, saveForLater, ...(step === 'check' ? { confirmed } : {}) }),
    }));
  },
};