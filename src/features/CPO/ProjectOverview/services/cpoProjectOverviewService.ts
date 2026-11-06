import { buildBackendUrl } from '../../../../utils/apiConfig';
import { fetchCsrfToken, getCsrfHeaders } from '../../../../utils/csrf';
import { EMPTY_PROJECT_OVERVIEW, PROJECT_OVERVIEW_PAGE_ID } from '../constants/projectOverviewConstants';
import type { ProjectOverview, ProjectOverviewResponse } from '../types/projectOverview';

type ProjectOverviewApiResponse = {
  application_id: string;
  content_version: number;
  details: { projectName?: string; projectSummary?: string };
};

const contentVersions = new Map<string, number>();

async function readResponse(response: Response): Promise<ProjectOverviewResponse> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (response.status === 400 || response.status === 409) && typeof body.message === 'string'
      ? body.message
      : response.status === 401 ? 'Your session has expired. Sign in again.'
        : response.status === 403 ? 'You do not have permission to update this application.'
          : response.status === 409 ? 'Only draft compulsory purchase order applications can be updated.'
            : 'Unable to load or save the project overview. Try again.';
    throw Object.assign(new Error(message), { status: response.status });
  }
  const result: ProjectOverviewApiResponse = await response.json();
  contentVersions.set(result.application_id, result.content_version);
  return { details: { ...EMPTY_PROJECT_OVERVIEW, ...result.details } };
}

export const cpoProjectOverviewService = {
  get: async (applicationId: string): Promise<ProjectOverviewResponse> =>
    readResponse(await fetch(buildBackendUrl(`/api/cpo/${applicationId}/project-overview`), { credentials: 'include' })),
  save: async (applicationId: string, details: ProjectOverview): Promise<ProjectOverviewResponse> => {
    if (!contentVersions.has(applicationId)) await cpoProjectOverviewService.get(applicationId);
    let headers = getCsrfHeaders();
    if (!headers['X-CSRF-Token']) {
      await fetchCsrfToken();
      headers = getCsrfHeaders();
    }
    if (!headers['X-CSRF-Token']) throw new Error('Unable to obtain CSRF token. Refresh the page.');
    return readResponse(await fetch(buildBackendUrl(`/api/cpo/${applicationId}/project-overview`), {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        expected_content_version: contentVersions.get(applicationId),
        page_id: PROJECT_OVERVIEW_PAGE_ID,
        data: { project_name: details.projectName, project_summary: details.projectSummary },
      }),
    }));
  },
};
