import { UploadedFile,ApplicationDocument  } from './fileUpload';
export interface SensitiveAreaReview {
  id?: string;
  application_id: string;
  route_id?: string;
  settings_id?: string;
  asset_presence_option_id?: number;
  other_sensitive_areas_note?: string;
  add_other_areas_choice?: string | null;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  application_documents?: ApplicationDocument[];
  uploaded_files?: UploadedFile[];
  is_review_complete?: boolean;
}
