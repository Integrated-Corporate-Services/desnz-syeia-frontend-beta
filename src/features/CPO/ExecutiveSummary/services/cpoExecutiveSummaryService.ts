import { buildBackendUrl } from '../../../../utils/apiConfig';
import { generateCorrelationId } from '../../../../utils/correlationId';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import type { ExecutiveSummaryData } from '../types/executiveSummary';
import {
  EXECUTIVE_SUMMARY_CATEGORY,
  EXECUTIVE_SUMMARY_DEFAULT_ERROR,
  EXECUTIVE_SUMMARY_ERROR_MESSAGES,
  EXECUTIVE_SUMMARY_PAGE_ID,
} from '../constants/executiveSummaryConstants';

type ExecutiveSummaryApiResponse = {
  application_id: string;
  content_version: number;
  documents: ExecutiveSummaryData['documents'];
};

const contentVersions = new Map<string, number>();

async function readResponse(applicationId: string, response: Response): Promise<ExecutiveSummaryData> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    // Validation messages are written for the applicant; other failures use fixed copy.
    const message = (response.status === 400 || response.status === 409) && typeof body.message === 'string'
      ? body.message
      : EXECUTIVE_SUMMARY_ERROR_MESSAGES[response.status] || EXECUTIVE_SUMMARY_DEFAULT_ERROR;
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result: ExecutiveSummaryApiResponse = await response.json();
  contentVersions.set(applicationId, result.content_version);
  return { documents: result.documents || [] };
}

export const cpoExecutiveSummaryService = {
  get: async (applicationId: string): Promise<ExecutiveSummaryData> =>
    readResponse(applicationId, await fetch(buildBackendUrl(`/api/cpo/${applicationId}/executive-summary`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    })),

  save: async (applicationId: string, saveForLater: boolean): Promise<ExecutiveSummaryData> => {
    const current = await cpoExecutiveSummaryService.get(applicationId);
    let csrfHeaders = getCsrfHeaders();
    if (!csrfHeaders['X-CSRF-Token']) {
      await fetchCsrfToken();
      csrfHeaders = getCsrfHeaders();
    }
    if (!csrfHeaders['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');

    return readResponse(applicationId, await fetch(buildBackendUrl(`/api/cpo/${applicationId}/executive-summary`), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': generateCorrelationId(), ...csrfHeaders },
      body: JSON.stringify({
        expected_content_version: contentVersions.get(applicationId),
        page_id: EXECUTIVE_SUMMARY_PAGE_ID,
        saveForLater,
        data: {
          documents: current.documents.map((document) => ({
            document_id: document.document_id,
            category: EXECUTIVE_SUMMARY_CATEGORY,
          })),
        },
      }),
    }));
  },

  downloadTemplate: async (applicationId: string): Promise<Blob> => {
    const response = await fetch(buildBackendUrl(`/api/cpo/${applicationId}/executive-summary/template`), {
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    });
    if (!response.ok) throw Object.assign(new Error('The executive summary template could not be downloaded. Try again.'), { status: response.status });
    return response.blob();
  },
};
