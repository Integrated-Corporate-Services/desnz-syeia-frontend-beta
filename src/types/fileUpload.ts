export type ScanStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type ScanResult = 'CLEAN' | 'INFECTED';

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
  scanStatus?: ScanStatus | null;
  scanResult?: ScanResult | null;
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