import { buildBackendUrl } from '../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../utils/csrf';
import type { ScanResult, ScanStatus } from '../../types/fileUpload';

export const EXECUTIVE_SUMMARY_CATEGORY = 'CPO_EXECUTIVE_SUMMARY';
export const ORDER_STEPS = ['name', 'purpose', 'special-land', 'exchange-land', 'executive-summary', 'related-applications', 'add-related-application', 'related-applications-list', 'check'] as const;
export type OrderStep = typeof ORDER_STEPS[number];
export type RelatedType = 'DCO' | 'S37' | 'CPO' | 'OTHER' | '';
export interface RelatedApplication {
  id: string;
  type: RelatedType;
  otherType: string;
  reference: string;
  siteAddress: string;
  relationship: string;
}
export interface OrderDetails {
  orderName: string;
  purpose: string;
  includesSpecialLand: boolean | null;
  exchangeLand: boolean | null;
  hasRelatedApplications: boolean | null;
  relatedApplications: RelatedApplication[];
  completedAt?: string | null;
}
export interface OrderDocument {
  id: string;
  document_id: string;
  application_id: string;
  file_id: string;
  filename: string;
  s3_key: string;
  bucket_name: string;
  virtual_folder: string;
  storage_provider: string;
  file_content_type: string;
  file_size_bytes: number;
  uploaded_at_timestamp: string;
  added_by: string;
  added_at: string;
  scan_status: ScanStatus | null;
  scan_result: ScanResult | null;
}
export interface OrderDetailsResponse {
  details: OrderDetails;
  documents: OrderDocument[];
  canEdit?: boolean;
}
export const EMPTY_ORDER_DETAILS: OrderDetails = {
  orderName: '', purpose: '', includesSpecialLand: null, exchangeLand: null,
  hasRelatedApplications: null, relatedApplications: [],
};
export const RELATED_TYPE_LABELS: Record<RelatedType, string> = {
  DCO: 'Development consent order (DCO)', S37: 'Overhead line consent (Section 37)',
  CPO: 'Another compulsory purchase order for this project', OTHER: 'Other', '': 'Not answered',
};

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
  templateUrl: (applicationId: string) => buildBackendUrl(`/api/applications/${applicationId}/order-details/executive-summary-template`),
};

export function nextOrderStep(step: OrderStep, details: OrderDetails, addAnother: boolean | null): OrderStep | null {
  switch (step) {
    case 'name': return 'purpose';
    case 'purpose': return 'special-land';
    case 'special-land': return details.includesSpecialLand ? 'exchange-land' : 'executive-summary';
    case 'exchange-land': return 'executive-summary';
    case 'executive-summary': return 'related-applications';
    case 'related-applications': return details.hasRelatedApplications ? (details.relatedApplications.length ? 'related-applications-list' : 'add-related-application') : 'check';
    case 'add-related-application': return 'related-applications-list';
    case 'related-applications-list': return addAnother ? 'add-related-application' : 'check';
    case 'check': return null;
  }
}