import { buildBackendUrl } from '../../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { DocumentStep, OrderDocumentsResponse } from '../types/orderDocuments';

async function readResponse(response: Response): Promise<OrderDocumentsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to update this application.'
          : response.status === 404 ? 'Order documents not found.'
            : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
              : 'Unable to load or save order documents. Try again.';
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  const result: OrderDocumentsResponse = await response.json();
  return { orderDetails: result.orderDetails || {}, documents: result.documents || [] };
}

export const cpoOrderDocumentsService = {
  get: async (applicationId: string): Promise<OrderDocumentsResponse> =>
    readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-documents`), { credentials: 'include' })),
  save: async (applicationId: string, step: DocumentStep, saveForLater: boolean, confirmed: boolean | null = null): Promise<OrderDocumentsResponse> => {
    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      headers = getCsrfHeaders();
    }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');
    return readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-documents`), {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ step, saveForLater, ...(step === 'check' ? { confirmed: confirmed === true } : {}) }),
    }));
  },
};
