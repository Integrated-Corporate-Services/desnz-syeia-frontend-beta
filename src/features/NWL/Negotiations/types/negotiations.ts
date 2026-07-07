import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

export type NegotiationsData = {
  negotiations_id?: string;
  application_id?: string;
  has_negotiations?: boolean;
  negotiations_start_date?: string;
  negotiations_start_date_day?: string;
  negotiations_start_date_month?: string;
  negotiations_start_date_year?: string;
  negotiations_comments?: string | null;
  negotiations_evidence_comments?: string | null;
  no_negotiations_reason?: string | null;
  evidence_documents?: any[];
  uploaded_files?: UploadedFile[];
  application_documents?: ApplicationDocument[];
  created_at?: string;
  updated_at?: string;
};

export type DateFormData = {
  day: string;
  month: string;
  year: string;
};

export type FormErrors = {
  [key: string]: string;
};
