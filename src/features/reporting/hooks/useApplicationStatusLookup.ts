import { useState } from "react";
import axios from "axios";
import { getApplicationStatusByReference } from "../../../services/adminReportingService";
import { verifyApplicationPayment } from "../services/operationalTasksService";
import { OPERATIONAL_TASKS_MESSAGES } from "../constants";
import type { ApplicationStatusLookup } from "../types";

export const useApplicationStatusLookup = () => {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<ApplicationStatusLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const search = async () => {
    const trimmedReference = reference.trim();
    setVerifyMessage(null);
    setVerifyError(null);

    if (!trimmedReference) {
      setResult(null);
      setError(OPERATIONAL_TASKS_MESSAGES.REFERENCE_REQUIRED);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setResult(await getApplicationStatusByReference(trimmedReference));
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

  const verifyApplicationPaymentAction = async () => {
    if (!result?.payment?.paymentId) return;

    setVerifying(true);
    setVerifyMessage(null);
    setVerifyError(null);
    try {
      await verifyApplicationPayment(result.applicationId, result.payment.paymentId);
      setVerifyMessage(OPERATIONAL_TASKS_MESSAGES.VERIFY_SUCCESS);
      setResult(await getApplicationStatusByReference(reference.trim()));
    } catch {
      setVerifyError(OPERATIONAL_TASKS_MESSAGES.VERIFY_FAILED);
    } finally {
      setVerifying(false);
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
    search,
    verifyApplicationPayment: verifyApplicationPaymentAction,
  };
};
