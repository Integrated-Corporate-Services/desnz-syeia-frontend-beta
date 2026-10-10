import { buildBackendUrl } from '../../../../utils/apiConfig';
import { cpoOrderDetailsService } from '../../OrderDetails/services/cpoOrderDetailsService';
import type { ExecutiveSummaryData } from '../types/executiveSummary';

// The executive summary is persisted through the order-details endpoint.
const toExecutiveSummary = (result: { documents: ExecutiveSummaryData['documents']; canEdit?: boolean }): ExecutiveSummaryData => ({
  documents: result.documents,
  canEdit: result.canEdit !== false,
});

export const cpoExecutiveSummaryService = {
  get: async (applicationId: string) => toExecutiveSummary(await cpoOrderDetailsService.get(applicationId)),
  save: async (applicationId: string, saveForLater: boolean) =>
    toExecutiveSummary(await cpoOrderDetailsService.save(applicationId, 'executive-summary', {}, saveForLater)),
  templateUrl: (applicationId: string) => buildBackendUrl(`/api/applications/${applicationId}/order-details/executive-summary-template`),
};
