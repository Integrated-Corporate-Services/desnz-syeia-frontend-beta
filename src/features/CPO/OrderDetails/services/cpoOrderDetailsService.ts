import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { EMPTY_ORDER_DETAILS } from '../constants/orderDetailsConstants';
import type { OrderDetails, OrderDetailsResponse, OrderStep } from '../types/orderDetails';

type Versions = { content_version: number; row_version: number };

type OrderDetailsApiResponse = Versions & {
  application_id: string;
  order_name: string;
  purpose: string;
  can_edit: boolean;
};

type Snapshot = { versions: Versions; response: OrderDetailsResponse };

// Only these steps are saved by the backend; the other steps are answered on screen only.
const PAGES: Partial<Record<OrderStep, { pageId: string; field: 'order_name' | 'purpose'; key: 'orderName' | 'purpose' }>> = {
  name: { pageId: 'order-name', field: 'order_name', key: 'orderName' },
  purpose: { pageId: 'purpose', field: 'purpose', key: 'purpose' },
};

// Latest versions seen per application in this tab; every GET and PATCH refreshes them.
const snapshots = new Map<string, Snapshot>();

const endpoint = (applicationId: string) => buildBackendUrl(`/api/cpo/${applicationId}/order-details`);

async function readResponse(applicationId: string, response: Response): Promise<OrderDetailsResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation and stale-version messages are written for the applicant; other failures use fixed copy.
    const message = (response.status === 400 || response.status === 409) && typeof body.message === 'string'
      ? body.message
      : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to update this application.'
          : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
            : 'Unable to load or save order details. Try again.';
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result: OrderDetailsApiResponse = await response.json();
  const mapped: OrderDetailsResponse = {
    details: { ...EMPTY_ORDER_DETAILS, orderName: result.order_name ?? '', purpose: result.purpose ?? '' },
    documents: [],
    canEdit: result.can_edit,
  };
  snapshots.set(applicationId, {
    versions: { content_version: result.content_version, row_version: result.row_version },
    response: mapped,
  });
  return mapped;
}

export const cpoOrderDetailsService = {
  get: async (applicationId: string): Promise<OrderDetailsResponse> =>
    readResponse(applicationId, await fetch(endpoint(applicationId), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    })),

  save: async (applicationId: string, step: string, changes: Partial<OrderDetails>, _saveForLater: boolean): Promise<OrderDetailsResponse> => {
    const page = PAGES[step as OrderStep];
    if (!page) {
      const current = snapshots.get(applicationId)?.response ?? { details: EMPTY_ORDER_DETAILS, documents: [] };
      return { ...current, details: { ...current.details, ...changes } };
    }

    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      headers = getCsrfHeaders();
    }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    if (!snapshots.has(applicationId)) await cpoOrderDetailsService.get(applicationId);
    const { versions } = snapshots.get(applicationId)!;
    return readResponse(applicationId, await fetch(endpoint(applicationId), {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...headers },
      body: JSON.stringify({
        expected_content_version: versions.content_version,
        expected_row_version: versions.row_version,
        page_id: page.pageId,
        data: { [page.field]: changes[page.key] ?? '' },
      }),
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
