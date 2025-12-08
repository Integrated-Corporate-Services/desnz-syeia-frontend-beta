// nwl Supporting Info type for UI

import { UploadedFile } from "./fileUpload";
import { ApplicationDocument } from "./fileUpload";
export interface nwlSupportingInfo {
  id?: string;
  applicationId: string;
  hasLandownerSignedWayleave?: boolean;
  hasInheritedNecessaryWayleave?: boolean;
  hasPriorWayleavePayments?: boolean;
  hasPaymentsAcceptedByGrantor?: boolean;
  isNewContractImplied?: boolean;
  newContractImpliedReason?: string;
  hasWrittenTerminationNotice?: boolean;
  writtenTerminationNoticeIssueDate?: string; // ISO string or date
  hasWrittenRemovalNotice?: boolean;
  writtenRemovalNoticeIssueDate?: string; // ISO string or date
  hasTitlePlan?: boolean;
  titlePlanMissingReason?: string;
  titlePlanDetail?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
	uploadedFiles: UploadedFile[];
	applicationDocuments: ApplicationDocument[];
}
