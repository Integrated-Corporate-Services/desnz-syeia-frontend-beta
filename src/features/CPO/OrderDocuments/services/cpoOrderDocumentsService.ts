import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { syncApplicantFromBackend } from '../../store/cpoApplicantSync';
import { useCpoStore } from '../../store/useCpoStore';
import type { DocumentStep, OrderDocumentsResponse } from '../types/orderDocuments';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to update this application.',
  404: 'Compulsory purchase order application not found.',
  409: 'Only draft compulsory purchase order applications can be updated.',
};
const DEFAULT_ERROR = 'Unable to load or save order documents. Try again.';

// The land answers still live in the local CPO store until Order details is backend-wired.
const landAnswers = (applicationId: string) => {
  const { includesSpecialLand, exchangeLand } = useCpoStore.getState().getOrderDetails(applicationId).details;
  return { includesSpecialLand, exchangeLand };
};

async function readResponse(response: Response, applicationId: string): Promise<OrderDocumentsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation messages are written for the applicant; other failures use fixed copy.
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message
      : ERROR_MESSAGES[response.status] || DEFAULT_ERROR;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result = await response.json();
  return { orderDetails: landAnswers(applicationId), documents: result.documents || [], canEdit: result.canEdit };
}

export const cpoOrderDocumentsService = {
  get: async (applicationId: string): Promise<OrderDocumentsResponse> =>
    readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-documents`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    }), applicationId),

  save: async (applicationId: string, step: DocumentStep, saveForLater: boolean, confirmed: boolean | null = null): Promise<OrderDocumentsResponse> => {
    const { includesSpecialLand, exchangeLand } = landAnswers(applicationId);
    if (!saveForLater && (step === 'order' || step === 'check') && includesSpecialLand === true && typeof exchangeLand !== 'boolean') {
      throw new Error('Complete the exchange land question before continuing');
    }

    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    const result = await readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-documents`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({ step, saveForLater, ...(step === 'check' ? { confirmed: confirmed === true } : {}) }),
    }), applicationId);
    // The task list reads the Order documents progress the backend just wrote.
    await syncApplicantFromBackend(applicationId, true);
    return result;
  },
};
