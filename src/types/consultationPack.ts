// Types for Consultation Pack UI structure
import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";
export interface ConsultationInfo {
  id: string;
  applicationId: string;
}

export interface PackInfo {
  packId: string;
  consultationId: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

export interface PackSection {
  packSectionId: string;
  packId: string;
  sectionKey: string;
  include: boolean;
  mandatory: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

export interface PackDocument {
  packDocumentId: string;
  packId: string;
  documentId: string;
  include: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  documentTitle: string;
  documentCategory: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  uploadedFile: UploadedFile | null;
  applicationDocument: ApplicationDocument | null;
}

export interface ConsultationPack {
  consultation: ConsultationInfo;
  pack: PackInfo;
  packSections: PackSection[];
  packDocuments: PackDocument[];
  uploadedFiles: UploadedFile[];
  applicationDocuments: ApplicationDocument[];
  appDocs: { documentId: string; category: string; title: string }[];
}
