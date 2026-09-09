import axios from "axios";
import { getApiUrl } from "../../../utils/apiConfig";

// Triggers reconciliation of a stalled payment for the operational-tasks "Submission
// recovery" action - verifies the payment with GOV.UK Pay and, if successful, ensures
// the application is submitted.
export async function verifyApplicationPayment(applicationId: string, paymentId: string): Promise<unknown> {
  const response = await axios.get(
    getApiUrl(`/gov-pay/applications/${applicationId}/payments/${paymentId}/verify`)
  );
  return response.data;
}
