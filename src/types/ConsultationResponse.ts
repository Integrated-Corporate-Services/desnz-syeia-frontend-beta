import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";

export interface ConsultationResponse {
  response_id: string; // UUID
  consultation_id: string; // UUID
  application_id?: string; // UUID - Application ID for authorization
  received_at: string; // ISO date string (TIMESTAMPTZ)
  response_full_name?: string; // TEXT
  response_email_address?: string; // TEXT
  response_comments?: string; // TEXT
  has_objection?: boolean; // BOOLEAN
  is_out_of_date?: boolean; // BOOLEAN
  has_all_documents_uploaded?: boolean; // BOOLEAN
  created_at: string; // ISO date string (TIMESTAMPTZ)
  created_by?: string; // UUID
  last_updated_at?: string; // ISO date string (TIMESTAMPTZ)
  last_updated_by?: string; // UUID
  uploaded_files?: UploadedFile[]; // Array of uploaded files
  application_documents?: ApplicationDocument[]; // Array of application documents
  isSave ?: boolean; // Indicates if the response is a draft (saved but not submitted)
  status ?: string; // Status of the consultation response (e.g., 'draft', 'submitted', 'reviewed')
}
