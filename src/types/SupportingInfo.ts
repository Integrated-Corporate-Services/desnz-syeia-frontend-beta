import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";

export interface SupportingInfo {
  application_id: string;
  wayleaves_obtained: boolean;
  wayleaves_not_obtained_reason?: string;
  esqcr_2002_compliance_confirmed: boolean;
  applicant_supporting_comments?: string;
  has_additional_supporting_documents: boolean;
  has_saved_supporting_info?: boolean;
  uploaded_files?: UploadedFile[] | null;
  application_documents?: ApplicationDocument[];
  created_at?: string;
  updated_at?: string;
}

export interface SupportingInfoResponse {
  supportingInfo: SupportingInfo[];
  applicationId: string;
  hasSavedSupportingInfo?: boolean;
}

export interface SupportingInfoRequest {
  application_id: string;
  wayleaves_obtained: boolean;
  wayleaves_not_obtained_reason?: string;
  esqcr_2002_compliance_confirmed: boolean;
  has_additional_supporting_documents: boolean;
  applicant_supporting_comments?: string;
  }