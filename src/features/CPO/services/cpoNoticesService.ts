import { buildBackendUrl } from '../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../utils/csrf';
import type { NoticeAnswer, NoticeStep, NoticesResponse } from '../types/notices';
async function readResponse(response: Response): Promise<NoticesResponse> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 400 && typeof body.message === 'string' ? body.message
    : response.status === 401 ? 'Your session has expired. Sign in again.'
      : response.status === 403 ? 'You do not have permission to update this application.'
        : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
          : 'Unable to load or save your publicity record. Try again.');
  return body;
}
export const cpoNoticesService = {
  get: async (applicationId: string) => readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/notices`), { credentials: 'include' })),
  save: async (applicationId: string, step: NoticeStep, answers: NoticeAnswer, saveForLater: boolean) => {
    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) { await fetchCsrfToken(); headers = getCsrfHeaders(); }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');
    return readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/notices`), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ step, answers, saveForLater }),
    }));
  },
};