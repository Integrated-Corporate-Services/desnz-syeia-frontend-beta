import axios from "axios";

export interface NWLSupportingInfoRequest {
  application_id: string;
  has_landowner_signed_wayleave?: boolean;
  has_inherited_necessary_wayleave?: boolean;
  has_prior_wayleave_payments?: boolean;
  has_payments_accepted_by_grantor?: boolean;
  is_new_contract_implied?: boolean;
  new_contract_implied_reason?: string;
  has_written_termination_notice?: boolean;
  written_termination_notice_issue_date?: string;
  has_written_removal_notice?: boolean;
  written_removal_notice_issue_date?: string;
  has_title_plan?: boolean;
  title_plan_missing_reason?: string;
}

export type NWLSupportingInfoResponse = NWLSupportingInfoRequest;


class NWLSupportingInfoService {
  static async getSupportingInfo(applicationId: string): Promise<NWLSupportingInfoResponse> {
    const response = await axios.get(`/backend/api/nwl/${applicationId}/supporting-information`);
    return response.data;
  }

  static async createSupportingInfo(applicationId: string, data: NWLSupportingInfoRequest): Promise<void> {
    await axios.post(`/backend/api/nwl/supporting-information`, data);
  }

  static async updateSupportingInfo(applicationId: string, data: NWLSupportingInfoRequest): Promise<void> {
    await axios.put(`/backend/api/nwl/${applicationId}/supporting-information`, data);
  }
}

export default NWLSupportingInfoService;
