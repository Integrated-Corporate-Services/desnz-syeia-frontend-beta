// Negotiation type for UI

import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";
export interface Negotiation {
  id?: string;
  applicationId: string;
  anyNegotiation?: boolean; // allow undefined for initial state
  startDate?: string; // ISO string or date
  comments?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
    uploadedFiles: UploadedFile[];
    applicationDocuments: ApplicationDocument[];
}
