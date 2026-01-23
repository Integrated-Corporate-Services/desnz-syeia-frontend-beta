import axios from "axios";
import { createLogger } from "../utils/logger";
import type {
  RequestAccessRequest,
  RequestAccessResponse,
  VerifyEmailResponse,
  RequestAccessStatusResponse,
} from "../types/requestAccess";

const logger = createLogger("accessRequestApplicationService");

class RequestAccessService {
  /**
   * Submit a new request access
   */
  async submitRequestAccess(
    data: RequestAccessRequest
  ): Promise<RequestAccessResponse> {
    try {
      // Transform frontend field names to backend expected format
      const payload = {
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        line1: data.workAddressLine1,
        line2: data.workAddressLine2 || '',
        town: data.workTown,
        county: data.workCounty || '',
        postCode: data.workPostcode,
        phoneNumber: data.phoneNumber || '',
        company: data.company || '',
        organisations: data.organisations,
        applyingOnBehalf: data.applyingOnBehalf,
      };

      logger.debug('Submitting access request with payload:', payload);

      const response = await axios.post(`/backend/api/access-requests`, payload);

      return {
        success: response.data.success !== false,
        referenceNumber: response.data.referenceNumber || response.data.id,
        message:
          response.data.message || "Request access submitted successfully",
        alreadyExists: response.data.alreadyExists || false,
      };
    } catch (error) {
      // Handle 409 Conflict (duplicate request) gracefully
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return {
          success: false,
          alreadyExists: true,
          message:
            error.response.data.message ||
            "An access request for this email address has already been submitted.",
          existingRequests: error.response.data.existingRequests,
        };
      }

      logger.error("Request access error:", error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to submit request access. Please try again."
      );
    }
  }

  /**
   * Get request access status by ID
   */
  async getRequestAccessStatus(
    requestId: string
  ): Promise<RequestAccessStatusResponse> {
    try {
      const response = await axios.get(
        `/backend/api/access-requests/${requestId}`
      );
      return {
        status: response.data.status,
        message: response.data.rejectionReason || response.data.message,
      };
    } catch (error) {
      logger.error("Get request access status error:", error);
      throw new Error("Failed to retrieve request access status");
    }
  }

  /**
   * Verify email with 6-digit code
   */
  async verifyEmailCode(
    code: string,
    userEmail: string
  ): Promise<VerifyEmailResponse> {
    try {
      const response = await axios.post(`/backend/api/auth/verify-email`, {
        code: code,
        email: userEmail,
      });

      return {
        success: true,
        message: response.data.message || "Email verified successfully",
        redirectUrl: response.data.redirectUrl,
      };
    } catch (error) {
      logger.error("Verification error:", error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to verify email code. Please try again."
      );
    }
  }

  /**
   * Resend verification code to email
   */
  async resendVerificationCode(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`/backend/api/auth/resend-code`, {
        email: email,
      });

      return {
        success: true,
        message: response.data.message || "Verification code sent successfully",
      };
    } catch (error) {
      logger.error("Resend code error:", error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to resend verification code. Please try again."
      );
    }
  }

  /**
   * Check if user has an existing access request by email
   */
  async checkExistingRequestByEmail(
    email: string
  ): Promise<{ hasSubmittedRequest: boolean }> {
    try {
      const response = await axios.get(
        `/backend/api/access-requests/by-email`,
        {
          params: { email },
        }
      );

      return {
        hasSubmittedRequest: response.data?.hasSubmittedRequest || false,
      };
    } catch (error) {
      // 404 means no existing request - this is fine
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { hasSubmittedRequest: false };
      }

      logger.error("Check existing request error:", error);
      throw error;
    }
  }
}
export default new RequestAccessService();
