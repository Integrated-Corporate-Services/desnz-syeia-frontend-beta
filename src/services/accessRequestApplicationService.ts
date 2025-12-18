import axios from 'axios';
import { createLogger } from '../utils/logger';
import type {
  RequestAccessRequest,
  RequestAccessResponse,
  VerifyEmailResponse,
  RequestAccessStatusResponse
} from '../types/requestAccess';

const logger = createLogger('accessRequestApplicationService');

class RequestAccessService {

  /**
   * Submit a new request access
   */
  async submitRequestAccess(data: RequestAccessRequest): Promise<RequestAccessResponse> {
    try {
      const response = await axios.post(`/backend/api/access-requests`, {
        fullName: data.fullName,
        email: data.email,
        // TODO: Address fields are currently disabled. Uncomment when backend supports address data
        // line1: data.line1,
        // line2: data.line2,
        // town: data.town,
        // country: data.country,
        // postCode: data.postCode,
        organisations: data.organisations,
        applyingOnBehalf: data.applyingOnBehalf
      });

      return {
        success: true,
        referenceNumber: response.data.referenceNumber || response.data.id,
        message: response.data.message || 'Request access submitted successfully'
      };
    } catch (error) {
      logger.error('Request access error:', error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to submit request access. Please try again.'
      );
    }
  }

  /**
   * Get request access status by ID
   */
  async getRequestAccessStatus(requestId: string): Promise<RequestAccessStatusResponse> {
    try {
      const response = await axios.get(`/backend/api/access-requests/${requestId}`);
      return {
        status: response.data.status,
        message: response.data.rejectionReason || response.data.message
      };
    } catch (error) {
      logger.error('Get request access status error:', error);
      throw new Error('Failed to retrieve request access status');
    }
  }


  /**
   * Verify email with 6-digit code
   */
  async verifyEmailCode(code: string, userEmail: string): Promise<VerifyEmailResponse> {
    try {
      const response = await axios.post(`/backend/api/auth/verify-email`, {
        code: code,
        email: userEmail
      });

      return {
        success: true,
        message: response.data.message || 'Email verified successfully',
        redirectUrl: response.data.redirectUrl
      };
    } catch (error) {
      logger.error('Verification error:', error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to verify email code. Please try again.'
      );
    }
  }

  /**
   * Resend verification code to email
   */
  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`/backend/api/auth/resend-code`, {
        email: email
      });

      return {
        success: true,
        message: response.data.message || 'Verification code sent successfully'
      };
    } catch (error) {
      logger.error('Resend code error:', error);
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to resend verification code. Please try again.'
      );
    }
  }
}
export default new RequestAccessService();
