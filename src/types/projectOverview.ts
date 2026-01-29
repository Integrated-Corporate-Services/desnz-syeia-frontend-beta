// src/types/projectOverview.ts

import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";
export interface RelatedApplication {
  relatedApplicationId: string;
  projectId?: string;
  applicationRelationId?: string;
  project_name?: string;
  desnz_ref?: string;
  value?: string;
  relationType?: string;
  details?: string;
  createdAt?: string;
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
  applicationDocuments: ApplicationDocument[];
}
