import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

export type NegotiationsData = {
  has_negotiations?: boolean;
  negotiations_start_date_day?: string;
  negotiations_start_date_month?: string;
  negotiations_start_date_year?: string;
  negotiations_comments?: string;
  no_negotiations_reason?: string;
  uploaded_files?: UploadedFile[];
  application_documents?: ApplicationDocument[];
};

export type DateFormData = {
  day: string;
  month: string;
  year: string;
};

export type FormErrors = {
  [key: string]: string;
};
