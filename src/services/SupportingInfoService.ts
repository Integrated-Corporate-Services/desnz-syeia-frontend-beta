import axios from "axios";
import { SupportingInfoResponse, SupportingInfoRequest } from "../types/SupportingInfo";

class SupportingInfoService {
  static async getSupportingInfo(applicationId: string): Promise<SupportingInfoResponse> {
    const response = await axios.get(`/backend/api/applications/${applicationId}/supporting-info`);
    return response.data;
  }

  static async createSupportingInfo(data: SupportingInfoRequest): Promise<SupportingInfoResponse> {
    try {
      const response = await axios.post(`/backend/api/applications/supporting-info`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.error === 'VERSION_CONFLICT') {
        const conflictError: any = new Error(
          error.response?.data?.message || 
          'This page has been updated by another user. Please refresh the page to get the latest changes.'
        );
        conflictError.statusCode = 409;
        conflictError.isVersionConflict = true;
        throw conflictError;
      }
      throw error;
    }
  }

  static async updateSupportingInfo(data: SupportingInfoRequest): Promise<SupportingInfoResponse> {
    try {
      const response = await axios.put(`/backend/api/applications/supporting-info`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.error === 'VERSION_CONFLICT') {
        const conflictError: any = new Error(
          error.response?.data?.message || 
          'This page has been updated by another user. Please refresh the page to get the latest changes.'
        );
        conflictError.statusCode = 409;
        conflictError.isVersionConflict = true;
        throw conflictError;
      }
      throw error;
    }
  }
}

export default SupportingInfoService;