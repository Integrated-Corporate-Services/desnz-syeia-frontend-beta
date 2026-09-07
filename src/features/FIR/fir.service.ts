import { buildBackendUrl } from '../../utils/apiConfig';
import { getCsrfHeaders } from '../../utils/csrf';
import type { FurtherInformationRequest } from './fir.types';

const endpoint = (applicationId: string) => `/api/applications/${applicationId}/further-information-requests`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(buildBackendUrl(path), { credentials: 'include', ...options });
  if (!response.ok) throw new Error((await response.json().catch(() => ({ error: 'Request failed' }))).error || 'Request failed');
  return response.status === 204 ? undefined as T : response.json();
}

export async function getFurtherInformationRequests(applicationId: string): Promise<FurtherInformationRequest[]> {
  return (await request<{ requests: FurtherInformationRequest[] }>(endpoint(applicationId))).requests;
}

export const getFurtherInformationRequest = (applicationId: string, requestId: string) => request<FurtherInformationRequest>(`${endpoint(applicationId)}/${requestId}`);

export const submitFurtherInformationResponse = (applicationId: string, requestId: string, body: { responseText?: string; documentCategories: string[]; documentLinks: Array<{ documentId: string; documentCategory: string }> }) => request<{ furtherInformationResponseId: string }>(`${endpoint(applicationId)}/${requestId}/responses`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() }, body: JSON.stringify(body) });

export const firUploadEndpoints = (applicationId: string, requestId: string) => ({
  presignedUrl: `${endpoint(applicationId)}/${requestId}/documents/presigned-url`,
  confirm: `${endpoint(applicationId)}/${requestId}/documents/confirm`,
});