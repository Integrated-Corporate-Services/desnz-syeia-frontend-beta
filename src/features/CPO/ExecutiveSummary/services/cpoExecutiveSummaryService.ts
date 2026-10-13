import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { syncApplicantFromBackend } from '../../store/cpoApplicantSync';
import type { ExecutiveSummaryData } from '../types/executiveSummary';

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to update this application.',
  404: 'Compulsory purchase order application not found.',
  409: 'Only draft compulsory purchase order applications can be updated.',
};
const DEFAULT_ERROR = 'Unable to load or save the executive summary. Try again.';

async function readResponse(response: Response): Promise<ExecutiveSummaryData> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation messages are written for the applicant; other failures use fixed copy.
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message
      : ERROR_MESSAGES[response.status] || DEFAULT_ERROR;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result = await response.json();
  return { documents: result.documents || [], canEdit: result.canEdit !== false };
}

export const cpoExecutiveSummaryService = {
  get: async (applicationId: string): Promise<ExecutiveSummaryData> =>
    readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/executive-summary`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    })),

  save: async (applicationId: string, saveForLater: boolean): Promise<ExecutiveSummaryData> => {
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    const result = await readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/executive-summary`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({ saveForLater }),
    }));
    // The task list reads the Executive summary progress the backend just wrote.
    await syncApplicantFromBackend(applicationId, true);
    return result;
  },

  templateUrl: (applicationId: string) => buildBackendUrl(`/api/applications/${applicationId}/executive-summary/template`),
};
