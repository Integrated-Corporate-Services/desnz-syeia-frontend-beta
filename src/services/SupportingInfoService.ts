import axios from "axios";
import { SupportingInfoResponse, SupportingInfoRequest } from "../types/SupportingInfo";

class SupportingInfoService {
  static async getSupportingInfo(applicationId: string): Promise<SupportingInfoResponse> {
    const response = await axios.get(`/api/applications/${applicationId}/supporting-info`);
    return response.data;
  }

  static async createSupportingInfo(data: SupportingInfoRequest): Promise<SupportingInfoResponse> {
  const response = await axios.post(`/api/applications/supporting-info`, data);
  return response.data;
}

static async updateSupportingInfo(data: SupportingInfoRequest): Promise<SupportingInfoResponse> {
  const response = await axios.put(`/api/applications/supporting-info`, data);
  return response.data;
}
}

export default SupportingInfoService;