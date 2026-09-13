import axios from "axios";
import { getApiUrl } from "../../../utils/apiConfig";
import type { ApplicationSummaryPdfStatus, CreatedDocumentExport, DocumentExportRecord, ReconciliationResult } from "../types";

export async function reconcileSubmission(applicationId: string): Promise<ReconciliationResult> {
  const response = await axios.post<ReconciliationResult>(
    getApiUrl(`/admin/reports/applications/${applicationId}/reconcile-submission`)
  );
  return response.data;
}

export async function generateApplicationSummaryPdf(applicationId: string): Promise<ApplicationSummaryPdfStatus> {
  const response = await axios.post<ApplicationSummaryPdfStatus>(
    getApiUrl(`/admin/reports/applications/${applicationId}/generate-application-summary`)
  );
  return response.data;
}

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

export async function buildDocumentExport(applicationId: string, forceRebuild: boolean = false): Promise<CreatedDocumentExport> {
  const response = await axios.post<CreatedDocumentExport>(
    getApiUrl(`/admin/applications/${applicationId}/document-export${forceRebuild ? "?force=true" : ""}`)
  );
  return response.data;
}
