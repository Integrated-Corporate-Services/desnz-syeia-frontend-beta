// src/types/projectOverview.ts

export interface UploadedFile {
  id: string;
  storage_provider: string;
  s3_key?: string;
  bucket_name?: string;
  virtual_folder?: string;
  filename: string;
  file_content_type: string;
  file_size_bytes: number;
  uploaded_at_timestamp: string;
  description?: string;
}

export interface Document {
  document_id: string;
  application_id: string;
  file_id: string;
  category: string;
  title?: string;
  virtual_folder?: string;
  added_by: string;
  added_at: string;
}

export interface ProjectOverviewModel {
  application_id: string;
  project_id: string;
  project_name: string;
  project_desc: string;
  created_by: string;
  plan_reference: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  max_height: number;
  form_data: Record<string, any>;
  uploaded_files: UploadedFile[];
  documents: Document[];
}
