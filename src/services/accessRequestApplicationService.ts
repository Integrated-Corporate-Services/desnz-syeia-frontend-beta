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
      const response = await axios.post(`/backend/api/access-requests`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        workAddressLine1: data.workAddressLine1,
        workAddressLine2: data.workAddressLine2,
        workTown: data.workTown,
        workCounty: data.workCounty,
        workPostcode: data.workPostcode,
        company: data.company,
        organisations: data.organisations,
        applyingOnBehalf: data.applyingOnBehalf,
      });

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
}
export default new RequestAccessService();
