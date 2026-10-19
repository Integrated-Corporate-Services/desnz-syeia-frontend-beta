import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { syncApplicantFromBackend } from '../../store/cpoApplicantSync';
import { useCpoStore } from '../../store/useCpoStore';
import { EMPTY_ORDER_DETAILS } from '../constants/orderDetailsConstants';
import type { OrderDetails, OrderDetailsResponse, OrderStep } from '../types/orderDetails';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to update this application.',
  404: 'Compulsory purchase order application not found.',
  409: 'Only draft compulsory purchase order applications can be updated.',
};
const DEFAULT_ERROR = 'Unable to load or save order details. Try again.';

async function readResponse(response: Response): Promise<OrderDetailsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation messages are written for the applicant; other failures use fixed copy.
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message
      : ERROR_MESSAGES[response.status] || DEFAULT_ERROR;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result = await response.json();
  return { details: { ...EMPTY_ORDER_DETAILS, ...result.details }, documents: result.documents || [], canEdit: result.canEdit };
}

export const cpoOrderDetailsService = {
  get: async (applicationId: string): Promise<OrderDetailsResponse> => {
    const result = await readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-details`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    }));
    // Order documents still read the land answers from the local CPO store.
    useCpoStore.getState().syncOrderDetails(applicationId, result.details);
    return result;
  },

  save: async (applicationId: string, step: string, changes: Partial<OrderDetails>, saveForLater: boolean): Promise<OrderDetailsResponse> => {
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    const result = await readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-details`), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({ step, changes, saveForLater }),
    }));
    useCpoStore.getState().syncOrderDetails(applicationId, result.details, step);
    // The task list reads the Order details progress the backend just wrote.
    await syncApplicantFromBackend(applicationId, true);
    return result;
  },
};

export function nextOrderStep(step: OrderStep, details: OrderDetails, addAnother: boolean | null): OrderStep | null {
  switch (step) {
    case 'name': return 'purpose';
    case 'purpose': return 'check';
    case 'special-land': return details.includesSpecialLand ? 'exchange-land' : 'related-applications';
    case 'exchange-land': return 'related-applications';
    case 'related-applications': return details.hasRelatedApplications ? (details.relatedApplications.length ? 'related-applications-list' : 'add-related-application') : 'check';
    case 'add-related-application': return 'related-applications-list';
    case 'related-applications-list': return addAnother ? 'add-related-application' : 'check';
    case 'check': return null;
  }
}
