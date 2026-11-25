/**
 * Types for the Tech Admin migration UI.
 *
 * These mirror the API contract in PLAN.md section 2.1 (all routes under /api/admin/migration).
 * Field names are camelCase; where the contract does not name a field the assumption is
 * documented next to it so the backend agent's response can be matched quickly.
 */

/** Response body of business errors (400, 404, 409). */
export interface MigrationErrorBody {
  error?: string;
  message?: string;
}

/** POST /batches/check-id */
export interface CheckBatchIdResponse {
  available: boolean;
}

/** PUT /batches/:batchId/cases-file */
export interface CasesFileUploadResult {
  uploadId: string;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  caseCount: number;
  caseIds: string[];
  /** Assumed to be plain strings; objects with a `message` are also accepted. */
  warnings: Array<string | { message: string }>;
}

/** POST /batches/:batchId/start */
export interface StartBatchResponse {
  batchId: string;
  manifestKey: string;
}

/** One row of GET /batches (migration_batch plus per-batch counts from migration_record). */
export interface MigrationBatchSummary {
  batchId: string;
  status: string | null;
  preflightStatus: string | null;
  expectedCaseCount: number | null;
  /** Assumed: count of migration_record rows with aws_load_status = LOADED. */
  loadedCaseCount: number | null;
  /** Assumed: count of migration_record rows with any failure. */
  failedCaseCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** GET /batches?page=&pageSize= (assumed envelope). */
export interface MigrationBatchListResponse {
  batches: MigrationBatchSummary[];
  page: number;
  pageSize: number;
  total: number;
}

/** A migration_record row joined with application.desnz_ref. */
export interface MigrationCase {
  legacyCaseId: string;
  desnzRef: string | null;
  applicationId: string | null;
  validationStatus: string | null;
  awsLoadStatus: string | null;
  salesforceLoadStatus: string | null;
  reconciliationStatus?: string | null;
  documentRecordStatus: string | null;
  failureCode?: string | null;
  failureReason: string | null;
}

/** GET /batches/:batchId */
export interface MigrationBatchDetails extends MigrationBatchSummary {
  validatedCaseCount?: number | null;
  failureCode: string | null;
  failureReason: string | null;
  completedAt?: string | null;
  cases: MigrationCase[];
}

export interface MigrationRecordStatuses {
  validation?: string | null;
  awsLoad?: string | null;
  salesforceLoad?: string | null;
  reconciliation?: string | null;
  documentRecord?: string | null;
}

export interface MigrationFailure {
  code?: string | null;
  reason?: string | null;
}

export interface MigrationInfo {
  batchId: string;
  legacyCaseId: string;
  /** Not in the contract's sketch; read when present, otherwise taken from `application`. */
  applicationId?: string | null;
  desnzRef?: string | null;
  statuses: MigrationRecordStatuses;
  failure: MigrationFailure | null;
}

export interface MigratedDocument {
  documentId: string;
  fileId: string;
  fileName: string;
  category: string;
  subCategory?: string | null;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
  scanStatus?: string | null;
  scanResult?: string | null;
  /** True only for documents a Tech Admin added through these pages (decision Q6). */
  removable?: boolean;
}

export interface MigrationDocumentType {
  label: string;
  category: string;
  subCategory?: string | null;
}

/** The shape returned by getNWLApplicationFullData on the backend. */
export interface NwlApplicationFullData {
  application?: Record<string, unknown> | null;
  [section: string]: unknown;
}

/** GET /applications/:reference */
export interface MigratedApplicationResponse {
  migration: MigrationInfo;
  application: NwlApplicationFullData | null;
  documents: MigratedDocument[];
  documentTypes: MigrationDocumentType[];
}

/** State kept in sessionStorage while the admin moves through the "start a batch" pages. */
export interface NewBatchWizardState {
  batchId?: string;
  upload?: CasesFileUploadResult;
}

export type FieldErrors = Array<{ fieldId: string; message: string }>;

/** Router state used to show a success notification banner on the migrated application page. */
export interface MigratedApplicationLocationState {
  success?: string;
}
