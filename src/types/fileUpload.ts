export interface UploadedFile {
  id: string;
  storageProvider: string;
  s3Key: string;
  bucketName: string;
  virtualFolder: string;
  filename: string;
  fileContentType: string;
  fileSizeBytes: number;
  uploadedAtTimestamp: string;
  scanStatus?: string | null;
  scanResult?: string | null;
  virusName?: string | null;
  scannedAt?: string | null;
}

export interface ApplicationDocument {
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
  consultationId?: string;
}

export interface FileScanStatus {
  fileId: string;
  s3Key: string;
  bucketName: string;
  scanStatus: string;
  scanResult: string | null;
  virusName: string | null;
  scannedAt: string | null;
  userMessage: string;
}