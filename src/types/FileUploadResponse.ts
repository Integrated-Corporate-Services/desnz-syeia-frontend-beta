export interface FileUploadResponse {
  filename: string;
  status: string;
  description?: string;
  contentType: string;
  fileSize: number | null;
  bucketName: string;
  url: string;
}
