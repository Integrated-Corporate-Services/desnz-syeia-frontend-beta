// Service for access request operations
import axios from 'axios';
import { createLogger } from '../utils/logger';
import type { AccessRequest } from '../types/accessRequest';
import type { ServiceResponse } from '../types/common';

const logger = createLogger('accessRequestAdminService');

class RequestService {
  /**
   * Get pending access requests
   */
  async getPendingRequests(): Promise<ServiceResponse<AccessRequest[]>> {
    try {
      const response = await axios.get('/api/access-requests');
      logger.debug('Fetched pending requests:', response.data?.length);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to fetch pending requests:', error);
      throw new Error('Failed to fetch pending requests');
    }
  }

  /**
   * Get request details by ID
   */
  async getRequestById(requestId: string): Promise<ServiceResponse<AccessRequest>> {
    try {
      logger.debug('Fetching request by ID:', requestId);
      const url = `/api/access-requests/${requestId}`;
      const response = await axios.get(url);
      logger.debug('Request fetched successfully:', response.data?.access_request_id);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Failed to fetch request:', {
          requestId,
          status: error.response?.status,
          message: error.response?.data?.error || error.message
        });
      } else {
        logger.error('Failed to fetch request details:', error);
      }
      throw new Error('Failed to fetch request details');
    }
  }

  /**
   * Approve access request
   */
  async approveRequest(requestId: string): Promise<ServiceResponse<null>> {
    try {
      const response = await axios.post(`/api/access-requests/${requestId}/approve`);
      logger.info('Request approved:', requestId);
      return {
        success: true,
        message: response.data.message || 'Request approved successfully'
      };
    } catch (error) {
      logger.error('Failed to approve request:', { requestId, error });
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to approve request'
      );
    }
  }

  /**
   * Reject access request
   */
  async rejectRequest(requestId: string, reason: string): Promise<ServiceResponse<null>> {
    try {
      const response = await axios.post(`/api/access-requests/${requestId}/reject`, {
        reason
      });
      logger.info('Request rejected:', requestId);
      return {
        success: true,
        message: response.data.message || 'Request rejected successfully'
      };
    } catch (error) {
      logger.error('Failed to reject request:', { requestId, error });
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to reject request'
      );
    }
  }
}

export default new RequestService();
