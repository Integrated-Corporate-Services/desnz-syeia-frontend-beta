import axios from "axios";
import { getApiUrl } from "../../../utils/apiConfig";
import type { CreatedDocumentExport, DocumentExportRecord, ReconciliationResult } from "../types";

export async function reconcileSubmission(applicationId: string): Promise<ReconciliationResult> {
  const response = await axios.post<ReconciliationResult>(
    getApiUrl(`/admin/reports/applications/${applicationId}/reconcile-submission`)
  );
  return response.data;
}

// Checks whether a completed download bundle already exists for the application,
// so the UI can offer a direct download instead of building a duplicate one.
// Returns null when none exists yet (backend responds 404).
export async function getDocumentExport(applicationId: string): Promise<DocumentExportRecord | null> {
  try {
    const response = await axios.get<DocumentExportRecord>(
      getApiUrl(`/admin/applications/${applicationId}/document-export`)
    );
    return response.data;
  } catch (requestError) {
    if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
      return null;
    }
    throw requestError;
  }
}

export async function buildDocumentExport(applicationId: string): Promise<CreatedDocumentExport> {
  const response = await axios.post<CreatedDocumentExport>(
    getApiUrl(`/admin/applications/${applicationId}/document-export`)
  );
  return response.data;
}
