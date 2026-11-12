import type { ApplicationDocument, UploadedFile } from './fileUpload';

export interface EiaFees {
  eiaFeeId?: string;
  eiaId?: string;
  applicationId: string;
  isEiaDevelopment: boolean;
  screeningOnly: boolean;
  createdAt?: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy: string;
  uploadedFiles?: UploadedFile[];
  applicationDocuments?: ApplicationDocument[];
}