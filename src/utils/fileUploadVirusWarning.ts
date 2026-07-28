/**
 * Pure helpers for virus-scan upload warnings (SYEIA-46).
 * Kept separate from FileUpload so behaviour can be unit-tested without mounting React.
 */

export const INFECTED_USER_MESSAGE =
  'Your document upload was blocked because our virus scan detected a potential security risk. ' +
  'Please check the file on your device, run a virus scan and try uploading a clean version.';

export const INFECTED_MULTI_USER_MESSAGE = (count: number): string =>
  `${count} of your document uploads were blocked because our virus scan detected a potential ` +
  'security risk. Please check the files on your device, run a virus scan and try uploading clean versions.';

/** True for SYEIA-46 virus / scan failure copy shown in page error slots. */
export function isVirusScanWarningMessage(message: string | undefined | null): boolean {
  if (!message) {
    return false;
  }
  return (
    message.includes('security risk') ||
    message.includes('virus scan') ||
    message.includes('could not be scanned') ||
    message.includes('document upload was blocked') ||
    message.includes('document uploads were blocked')
  );
}

/** Keep virus warnings when a page clears generic file-validation errors. */
export function retainVirusScanWarnings(errors: string[]): string[] {
  return errors.filter((error) => isVirusScanWarningMessage(error));
}

/**
 * Whether Save and continue must stay disabled for infection.
 * Uses listed INFECTED files + pending blocked files only — never stale block
 * keys for files already removed from both the list and the pending queue.
 */
export function shouldBlockContinueForInfection(params: {
  listedInfectedCount: number;
  blockedPendingCount: number;
}): boolean {
  return params.listedInfectedCount > 0 || params.blockedPendingCount > 0;
}

export type ScanMeta = {
  scanResult?: string | null;
};

export type ListedUpload = {
  id: string;
  filename?: string;
  scanResult?: string | null;
};

export function getFileBaseName(filename: string | undefined | null): string {
  if (!filename) {
    return '';
  }
  return filename.split('/').pop() || filename;
}

export function countInfectedListedFiles(
  files: ListedUpload[],
  metaById: Record<string, ScanMeta>,
  excludeFileId?: string
): number {
  return files.filter((file) => {
    if (excludeFileId && file.id === excludeFileId) {
      return false;
    }
    const result = file.scanResult ?? metaById[file.id]?.scanResult ?? null;
    return result === 'INFECTED';
  }).length;
}

export function countCleanListedFiles(
  files: ListedUpload[],
  metaById: Record<string, ScanMeta>,
  excludeFileId?: string
): number {
  return files.filter((file) => {
    if (excludeFileId && file.id === excludeFileId) {
      return false;
    }
    const result = file.scanResult ?? metaById[file.id]?.scanResult ?? null;
    return result === 'CLEAN';
  }).length;
}

export function buildInfectedWarningMessage(infectedCount: number): string | null {
  if (infectedCount <= 0) {
    return null;
  }
  return infectedCount === 1
    ? INFECTED_USER_MESSAGE
    : INFECTED_MULTI_USER_MESSAGE(infectedCount);
}

export function formatCleanUploadSummary(_cleanCount: number): string | null {
  // Clean uploads are confirmed by appearing in the documents list — do not show
  // an "N files uploaded successfully" banner.
  return null;
}

export type VirusWarningAfterDelete = {
  /** Infected files still present after this delete (listed + blocked pending). */
  remainingInfected: number;
  /** When true, keep/update the page virus warning — do not clear it. */
  keepVirusWarning: boolean;
  virusMessage: string | null;
  /** Success inset only when the virus warning is being cleared. */
  successMessage: string | null;
};

/**
 * Decide what the upload warning should show after a file is deleted/removed.
 *
 * Rules:
 * - If any infected file remains → keep the virus warning (update count).
 * - If none remain → clear the virus warning; optionally show clean success summary.
 */
export function reconcileVirusWarningAfterDelete(params: {
  files: ListedUpload[];
  metaById: Record<string, ScanMeta>;
  excludeFileId?: string;
  /** Pending queue files still flagged infected (name::size block set). */
  blockedPendingCount: number;
}): VirusWarningAfterDelete {
  const listedInfected = countInfectedListedFiles(
    params.files,
    params.metaById,
    params.excludeFileId
  );
  const remainingInfected = listedInfected + params.blockedPendingCount;

  if (remainingInfected > 0) {
    return {
      remainingInfected,
      keepVirusWarning: true,
      virusMessage: buildInfectedWarningMessage(remainingInfected),
      successMessage: null,
    };
  }

  const cleanCount = countCleanListedFiles(
    params.files,
    params.metaById,
    params.excludeFileId
  );

  return {
    remainingInfected: 0,
    keepVirusWarning: false,
    virusMessage: null,
    successMessage: formatCleanUploadSummary(cleanCount),
  };
}

/**
 * End-of-batch scan banner.
 *
 * Progressive per-file handlers set the virus warning as each infected file
 * completes. End-of-batch must not wipe that warning when blocked/listed counts
 * briefly look empty (parent state not flushed yet).
 *
 * Clear only when the applicant already removed every infected file (warning
 * was explicitly cleared — virusWarningWasActive is false).
 */
export function reconcileVirusWarningAfterScanBatch(params: {
  batchInfectedCount: number;
  blockedRemainingCount: number;
  listedInfectedCount: number;
  failedCount: number;
  cleanCount: number;
  /** True if progressive handlers already raised a virus warning this batch. */
  virusWarningWasActive: boolean;
}): {
  virusMessage: string | null;
  failedMessage: string | null;
  successMessage: string | null;
  clearParentVirusErrors: boolean;
} {
  const FAILED_USER_MESSAGE =
    'Sorry, there is a problem with the service. Your file could not be scanned. Please try again later.';

  const activeInfected = Math.max(
    params.blockedRemainingCount,
    params.listedInfectedCount
  );

  if (activeInfected > 0) {
    return {
      virusMessage: buildInfectedWarningMessage(activeInfected),
      failedMessage: params.failedCount > 0 ? FAILED_USER_MESSAGE : null,
      successMessage: null,
      clearParentVirusErrors: false,
    };
  }

  // Nothing listed/blocked, but this batch found infections.
  if (params.batchInfectedCount > 0) {
    if (params.virusWarningWasActive) {
      // Progressive handlers already showed the warning; listed/blocked may be
      // empty due to a timing race. Keep the warning visible.
      return {
        virusMessage: buildInfectedWarningMessage(params.batchInfectedCount),
        failedMessage: params.failedCount > 0 ? FAILED_USER_MESSAGE : null,
        successMessage: null,
        clearParentVirusErrors: false,
      };
    }
    // Applicant removed every infected file during the scan (warning cleared).
    return {
      virusMessage: null,
      failedMessage: params.failedCount > 0 ? FAILED_USER_MESSAGE : null,
      successMessage:
        params.failedCount > 0 ? null : formatCleanUploadSummary(params.cleanCount),
      clearParentVirusErrors: false,
    };
  }

  if (params.failedCount > 0) {
    return {
      virusMessage: null,
      failedMessage: FAILED_USER_MESSAGE,
      successMessage: null,
      clearParentVirusErrors: false,
    };
  }

  return {
    virusMessage: null,
    failedMessage: null,
    successMessage: formatCleanUploadSummary(params.cleanCount),
    clearParentVirusErrors: false,
  };
}
