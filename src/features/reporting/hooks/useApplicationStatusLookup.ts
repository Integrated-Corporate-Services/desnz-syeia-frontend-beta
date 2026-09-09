import { useState } from "react";
import axios from "axios";
import { getApplicationStatusByReference } from "../../../services/adminReportingService";
import { buildDocumentExport, getDocumentExport, reconcileSubmission } from "../services/operationalTasksService";
import { DOWNLOAD_RECOVERY_EXCLUDED_APPLICATION_STATUS, OPERATIONAL_TASKS_MESSAGES } from "../constants";
import type { ApplicationStatusLookup, DocumentExportRecord } from "../types";

export const useApplicationStatusLookup = () => {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<ApplicationStatusLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [documentExport, setDocumentExport] = useState<DocumentExportRecord | null>(null);
  const [checkingDocumentExport, setCheckingDocumentExport] = useState(false);
  const [buildingDocumentExport, setBuildingDocumentExport] = useState(false);
  const [documentExportError, setDocumentExportError] = useState<string | null>(null);

  const refreshDocumentExport = async (applicationId: string, applicationStatus: string) => {
    setDocumentExportError(null);
    if (applicationStatus === DOWNLOAD_RECOVERY_EXCLUDED_APPLICATION_STATUS) {
      setDocumentExport(null);
      return;
    }
    setCheckingDocumentExport(true);
    try {
      setDocumentExport(await getDocumentExport(applicationId));
    } catch {
      setDocumentExportError(OPERATIONAL_TASKS_MESSAGES.DOWNLOAD_CHECK_FAILED);
    } finally {
      setCheckingDocumentExport(false);
    }
  };

  const search = async () => {
    const trimmedReference = reference.trim();
    setVerifyMessage(null);
    setVerifyError(null);
    setDocumentExport(null);
    setDocumentExportError(null);

    if (!trimmedReference) {
      setResult(null);
      setError(OPERATIONAL_TASKS_MESSAGES.REFERENCE_REQUIRED);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const lookupResult = await getApplicationStatusByReference(trimmedReference);
      setResult(lookupResult);
      if (lookupResult) {
        await refreshDocumentExport(lookupResult.applicationId, lookupResult.applicationStatus);
      }
    } catch (requestError) {
      setResult(null);
      setError(
        axios.isAxiosError(requestError) && requestError.response?.status === 404
          ? OPERATIONAL_TASKS_MESSAGES.NOT_FOUND
          : OPERATIONAL_TASKS_MESSAGES.LOAD_FAILED
      );
    } finally {
      setLoading(false);
    }
  };

  const reconcileApplicationSubmission = async () => {
    if (!result?.applicationId) return;

    setVerifying(true);
    setVerifyMessage(null);
    setVerifyError(null);
    try {
      const reconciliation = await reconcileSubmission(result.applicationId);
      if (reconciliation.submitted) {
        setVerifyMessage(reconciliation.message);
      } else {
        setVerifyError(reconciliation.message);
      }
      const refreshedResult = await getApplicationStatusByReference(reference.trim());
      setResult(refreshedResult);
      if (refreshedResult) {
        await refreshDocumentExport(refreshedResult.applicationId, refreshedResult.applicationStatus);
      }
    } catch (requestError) {
      setVerifyError(
        axios.isAxiosError(requestError) && requestError.response?.data?.error
          ? requestError.response.data.error
          : OPERATIONAL_TASKS_MESSAGES.VERIFY_FAILED
      );
    } finally {
      setVerifying(false);
    }
  };

  const buildDownloadBundle = async (forceRebuild: boolean = false) => {
    if (!result?.applicationId) return;

    setBuildingDocumentExport(true);
    setDocumentExportError(null);
    try {
      await buildDocumentExport(result.applicationId, forceRebuild);
      setDocumentExport(await getDocumentExport(result.applicationId));
    } catch (requestError) {
      setDocumentExportError(
        axios.isAxiosError(requestError) && requestError.response?.data?.error
          ? requestError.response.data.error
          : OPERATIONAL_TASKS_MESSAGES.DOWNLOAD_BUILD_FAILED
      );
    } finally {
      setBuildingDocumentExport(false);
    }
  };

  return {
    reference,
    setReference,
    result,
    loading,
    error,
    verifying,
    verifyMessage,
    verifyError,
    documentExport,
    checkingDocumentExport,
    buildingDocumentExport,
    documentExportError,
    search,
    reconcileSubmission: reconcileApplicationSubmission,
    buildDownloadBundle,
  };
};
