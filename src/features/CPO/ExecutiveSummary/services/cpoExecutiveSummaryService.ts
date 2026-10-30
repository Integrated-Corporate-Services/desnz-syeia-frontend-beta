import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { ExecutiveSummaryData } from '../types/executiveSummary';

import { EXECUTIVE_SUMMARY_ERROR_MESSAGES, EXECUTIVE_SUMMARY_DEFAULT_ERROR } from '../constants/executiveSummaryConstants';

async function readResponse(response: Response): Promise<ExecutiveSummaryData> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation messages are written for the applicant; other failures use fixed copy.
    const message = response.status === 400 && typeof body.message === 'string'
      ? body.message
      : EXECUTIVE_SUMMARY_ERROR_MESSAGES[response.status] || EXECUTIVE_SUMMARY_DEFAULT_ERROR;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result = await response.json();
  return { documents: result.documents || [] };
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

    return readResponse(await fetch(buildBackendUrl(`/api/applications/${applicationId}/executive-summary`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({ saveForLater }),
    }));
  },

  downloadTemplate: async (applicationId: string): Promise<Blob> => {
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/executive-summary/template`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    });
    if (!response.ok) throw Object.assign(new Error('The executive summary template could not be downloaded. Try again.'), { status: response.status });
    return response.blob();
  },
};
