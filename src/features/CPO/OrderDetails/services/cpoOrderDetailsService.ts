import { buildBackendUrl } from '../../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { EMPTY_ORDER_DETAILS } from '../constants/orderDetailsConstants';
import type { OrderDetails, OrderDetailsResponse, OrderStep } from '../types/orderDetails';

async function readResponse(response: Response): Promise<OrderDetailsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message
      : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to update this application.'
          : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
            : 'Unable to load or save order details. Try again.';
    throw new Error(message);
  }
  const result = await response.json();
  return { details: { ...EMPTY_ORDER_DETAILS, ...result.details }, documents: result.documents || [], canEdit: result.canEdit };
}

export const cpoOrderDetailsService = {
  get: async (applicationId: string) => readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-details`), { credentials: 'include' })),
  save: async (applicationId: string, step: string, changes: Partial<OrderDetails>, saveForLater: boolean) => {
    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      headers = getCsrfHeaders();
    }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');
    return readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/order-details`), {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ step, changes, saveForLater }),
    }));
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