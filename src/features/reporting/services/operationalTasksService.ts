import axios from "axios";
import { getApiUrl } from "../../../utils/apiConfig";
import type { ReconciliationResult } from "../types";

export async function reconcileSubmission(applicationId: string): Promise<ReconciliationResult> {
  const response = await axios.post<ReconciliationResult>(
    getApiUrl(`/admin/reports/applications/${applicationId}/reconcile-submission`)
  );
  return response.data;
}
