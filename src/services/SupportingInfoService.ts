import axios from "axios";
import { SupportingInfoResponse, SupportingInfoRequest } from "../types/SupportingInfo";
import { ERROR_MESSAGES } from "../constants/error";

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
          ERROR_MESSAGES.VERSION_CONFLICT
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
          ERROR_MESSAGES.VERSION_CONFLICT
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