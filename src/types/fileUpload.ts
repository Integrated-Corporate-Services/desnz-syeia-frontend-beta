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
  documentId: string;
  applicationId: string;
  fileId: string;
  category: string;
  subCategory?: string;
  title?: string;
  virtualFolder?: string;
  addedBy: string;
  addedAt: string;
  description?: string;
}