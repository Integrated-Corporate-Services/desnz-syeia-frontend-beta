// import { buildBackendUrl } from '../../../../utils/apiConfig';
import { useCpoStore } from '../../store/useCpoStore';

const TEMPLATE_TEXT = [
  'Executive summary template',
  '',
  '1. The project this order supports',
  '2. The land or rights you want to acquire',
  '3. Why the land or rights are needed',
].join('\n');

export const cpoExecutiveSummaryService = {
  // LOCAL MODE: the executive summary is kept in the CPO store until its backend section is integrated.
  get: async (applicationId: string) => useCpoStore.getState().getExecutiveSummary(applicationId),
  save: async (applicationId: string, saveForLater: boolean) => useCpoStore.getState().saveExecutiveSummary(applicationId, saveForLater),
  // LOCAL MODE: the template is a plain-text data URL instead of the backend-generated DOCX.
  templateUrl: (_applicationId: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(TEMPLATE_TEXT)}`,
  // templateUrl: (applicationId: string) => buildBackendUrl(`/api/applications/${applicationId}/order-details/executive-summary-template`),
};
