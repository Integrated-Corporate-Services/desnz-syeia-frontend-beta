// import { buildBackendUrl } from '../../../../utils/apiConfig';
import { cpoOrderDetailsService } from '../../OrderDetails/services/cpoOrderDetailsService';
import type { ExecutiveSummaryData } from '../types/executiveSummary';

// The executive summary is persisted through the order-details service.
const toExecutiveSummary = (result: { documents: ExecutiveSummaryData['documents']; canEdit?: boolean }): ExecutiveSummaryData => ({
  documents: result.documents,
  canEdit: result.canEdit !== false,
});

const TEMPLATE_TEXT = [
  'Executive summary template',
  '',
  '1. The project this order supports',
  '2. The land or rights you want to acquire',
  '3. Why the land or rights are needed',
].join('\n');

export const cpoExecutiveSummaryService = {
  get: async (applicationId: string) => toExecutiveSummary(await cpoOrderDetailsService.get(applicationId)),
  save: async (applicationId: string, saveForLater: boolean) =>
    toExecutiveSummary(await cpoOrderDetailsService.save(applicationId, 'executive-summary', {}, saveForLater)),
  // LOCAL MODE: the template is a plain-text data URL instead of the backend-generated DOCX.
  templateUrl: (_applicationId: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(TEMPLATE_TEXT)}`,
  // templateUrl: (applicationId: string) => buildBackendUrl(`/api/applications/${applicationId}/order-details/executive-summary-template`),
};
