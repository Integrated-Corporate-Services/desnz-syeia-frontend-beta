import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

export type AdditionalPaymentStatus = 'NOT_PAID' | 'PROCESSING' | 'PAID' | 'WITHDRAWN';
export interface AdditionalPaymentInvoice {
  invoice_id: string;
  invoice_number: string;
  download_url: string;
}
export interface AdditionalPaymentRequest {
  request_id: string;
  application_id: string;
  salesforce_request_id?: string;
  description: string;
  requested_at: string;
  due_date?: string | null;
  amount_pence: number;
  status: AdditionalPaymentStatus;
  items: { description: string; amount_pence: number }[];
  invoice?: AdditionalPaymentInvoice;
  payment_method?: 'CARD' | 'BACS' | null;
  payment_reference?: string | null;
  transaction_reference?: string | null;
}

export class AdditionalPaymentError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function request<T>(applicationId: string, suffix = '', body?: object): Promise<T> {
  const response = await fetch(buildBackendUrl(`/api/applications/${encodeURIComponent(applicationId)}/additional-payments${suffix}`), {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(body ? getCsrfHeaders() : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new AdditionalPaymentError(data.message || data.error || 'We could not load or update this additional payment. Please try again.', response.status);
  }
  return response.json();
}

const requestPath = (requestId: string) => `/${encodeURIComponent(requestId)}`;
export const additionalEvidenceEndpoints = (applicationId: string, requestId: string) => {
  const base = `/api/applications/${encodeURIComponent(applicationId)}/additional-payments${requestPath(requestId)}/evidence`;
  return { presignedUrl: `${base}/presigned-url`, confirm: `${base}/confirm` };
};
export const listAdditionalPayments = (applicationId: string) => request<{ requests: AdditionalPaymentRequest[] }>(applicationId);
export const getAdditionalPayment = (applicationId: string, requestId: string) => request<AdditionalPaymentRequest>(applicationId, requestPath(requestId));
export const generateAdditionalInvoice = (applicationId: string, requestId: string) => request<AdditionalPaymentInvoice>(applicationId, `${requestPath(requestId)}/invoice`, {});
export const createAdditionalCardPayment = (applicationId: string, requestId: string) => request<{ payment_id: string; next_url: string }>(applicationId, `${requestPath(requestId)}/card-payment`, {});
export const verifyAdditionalPayment = (applicationId: string, requestId: string, paymentId?: string) => request<{ status: AdditionalPaymentStatus; payment_reference?: string; card_outcome?: 'PENDING' | 'FAILED' | 'SUCCEEDED' }>(applicationId, `${requestPath(requestId)}/payment-status${paymentId ? `?payment_id=${encodeURIComponent(paymentId)}` : ''}`);
export const confirmAdditionalBankTransfer = (applicationId: string, requestId: string, body: { transaction_reference?: string; evidence_file_ids?: string[] }) => request<AdditionalPaymentRequest>(applicationId, `${requestPath(requestId)}/bank-transfer`, body);

export async function downloadAdditionalInvoice(applicationId: string, requestId: string): Promise<Blob> {
  const response = await fetch(buildBackendUrl(`/api/applications/${encodeURIComponent(applicationId)}/additional-payments${requestPath(requestId)}/invoice/download`), { credentials: 'include' });
  if (!response.ok) throw new Error('We could not download your invoice. Please try again.');
  return response.blob();
}

export const validAdditionalAmount = (amount: number) => Number.isSafeInteger(amount) && amount > 0;
export const additionalPaymentAmount = (amount: number) => validAdditionalAmount(amount) ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount / 100) : 'Amount unavailable';
export function trustedCardUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !(url.hostname === 'payments.service.gov.uk' || url.hostname.endsWith('.payments.service.gov.uk')) || url.username || url.password) {
    throw new Error('The payment service returned an invalid redirect address. Please try again.');
  }
  return url.href;
}