// src/types/projectOverview.ts

import { SearchableDropdownOption } from "../components/SearchableDropdown";

export interface RelatedApplication {
  relatedApplicationId: string;
  projectId?: string;
  applicationRelationId?: string;
  project_name?: string;
  operator_ref?: string;
  value?: string;
  relationType?: string;
  details?: string;
  createdAt?: string;
}

export interface UploadedFile {
  id: string;
  storage_provider: string;
  s3_key: string;
  bucket_name: string;
  virtual_folder: string;
  filename: string;
  file_content_type: string;
  file_size_bytes: number;
  uploaded_at_timestamp: string
}

export interface ProjectDocument {
  documentId: string;
  applicationId: string;
  fileId: string;
  category: string;
  title?: string;
  virtual_folder?: string;
  addedBy: string;
  addedAt: string;
  description?: string;
}

export interface ProjectOverviewModel {
  applicationFormId?: string;
  projectId: string;
  applicationId: string;
  createdBy: string;
  projectName: string;
  projectDescription: string;
  tallestPoleHeight: string;
  planReference: string;
  areWorkStartDatesKnown: string;
  earliestWorkStartDateMonth: string;
  earliestWorkStartDateYear: string;
  latestWorkStartDateMonth: string;
  latestWorkStartDateYear: string;
  hasRelatedApplications: string;
  relatedApplications: RelatedApplication[];
  hasRelatedCpo: string;
  relatedCpoDetails: string | { field: string };
  eipDetails: string;
  uploadedFiles: UploadedFile[];
  documents: ProjectDocument[];
}
