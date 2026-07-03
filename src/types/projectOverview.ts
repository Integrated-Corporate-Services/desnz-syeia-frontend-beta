// src/types/projectOverview.ts

import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";

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
  relatedApplicationsDetails: string;
  hasRelatedCpo: string;
  relatedCpoDetails: string | { field: string };
  eipDetails: string;
  uploadedFiles: UploadedFile[];
  applicationDocuments: ApplicationDocument[];
  // Version fields for optimistic locking
  projectVersion?: number;
  overviewVersion?: number;
}
