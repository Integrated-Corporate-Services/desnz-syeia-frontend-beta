export interface UploadedFile {
  id: string;
  storage_provider: string;
  s3_key: string;
  bucket_name: string;
  virtual_folder: string;
  filename: string;
  file_content_type: string;
  file_size_bytes: number;
  uploaded_at_timestamp: string;
}

export interface ProjectDocument {
  document_id: string;
  application_id: string;
  file_id: string;
  category: string;
  subCategory?: string;
  title?: string;
  virtual_folder?: string;
  added_by: string;
  added_at: string;
  description?: string;
}