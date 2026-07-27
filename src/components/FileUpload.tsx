import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef, useMemo } from "react";
import { downloadS3FileOnSameTab } from "../utils/s3DownloadUtil";
import "../styles/Fileupload.css";
import {
  getPresignedUrls,
  uploadFileToS3,
  deleteFileCompletely,
  confirmUpload,
  waitForFilesScan,
  getFilesScanStatus,
  clearPresignedUrlCache,
} from "../services/s3ApiService"; 
import { createLogger } from "../utils/logger";
import { validateFiles,  } from "../utils/fileUploadValidation";

import { UploadedFile, ApplicationDocument } from "../types/fileUpload";
import { useAuthUserContext } from "../context/AuthUserContext";
import type { AuthUser } from "../types/auth";
import { DEMO_USER_ID } from "../constants/demo";
import {
  INFECTED_USER_MESSAGE as SHARED_INFECTED_USER_MESSAGE,
  INFECTED_MULTI_USER_MESSAGE as SHARED_INFECTED_MULTI_USER_MESSAGE,
  formatCleanUploadSummary,
  getFileBaseName,
  countInfectedListedFiles,
  reconcileVirusWarningAfterDelete,
  reconcileVirusWarningAfterScanBatch,
} from "../utils/fileUploadVirusWarning";

const logger = createLogger('FileUpload');

// GOV.UK / GDS-aligned messages (SYEIA-46 AC3, SYEIA-1466). Backend returns the same
// wording via `userMessage`; these are used as fallbacks and for multi-file summaries.
const INFECTED_USER_MESSAGE = SHARED_INFECTED_USER_MESSAGE;

const INFECTED_MULTI_USER_MESSAGE = SHARED_INFECTED_MULTI_USER_MESSAGE;

const FAILED_USER_MESSAGE =
  'Sorry, there is a problem with the service. Your file could not be scanned. Please try again later.';

type FileScanMeta = {
  scanStatus?: string | null;
  scanResult?: string | null;
  virusName?: string | null;
  scannedAt?: string | null;
};

// Success confirmation shown in the inset notice. Infected/failed outcomes are surfaced
// as GOV.UK errors (error summary + per-file error message), not in this notice.
function formatUploadSummary(cleanCount: number): string | null {
  return formatCleanUploadSummary(cleanCount);
}

/** Limit parallel S3 PUT + confirm calls (GDS: keep UI responsive under load). */
const UPLOAD_CONFIRM_CONCURRENCY = 3;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current], current);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runNext()
  );
  await Promise.all(runners);
  return results;
}

/** Gate for parent "Save and continue" buttons (SYEIA-46). */
export type FileUploadGate = {
  /** True while upload or virus scan is in progress (GDS status for the primary button). */
  isScanning: boolean;
  hasInfectedFiles: boolean;
  /**
   * False while upload/scan is in progress or any infected file remains.
   * Parents must disable Save and continue when this is false.
   */
  canContinue: boolean;
};

export const DEFAULT_FILE_UPLOAD_GATE: FileUploadGate = {
  isScanning: false,
  hasInfectedFiles: false,
  canContinue: true,
};

/** Shared GDS copy for parents that hard-stop submit while a scan is running. */
/** Shared copy for parents that hard-stop submit while a scan is running (not shown as a banner). */
export const FILE_SCAN_IN_PROGRESS_MESSAGE =
  'Your file is being scanned. Please wait while the upload is processed.';

/** Shared GDS copy for parents that hard-stop submit when a virus is detected. */
export const FILE_INFECTED_BLOCK_MESSAGE = INFECTED_USER_MESSAGE;

function buildUploadGate(
  isBusy: boolean,
  hasInfectedFiles: boolean
): FileUploadGate {
  return {
    isScanning: isBusy,
    hasInfectedFiles,
    canContinue: !isBusy && !hasInfectedFiles,
  };
}

export interface FileUploadProps {
  title?: string;
  prefix?: string;
  uploadedFiles?: UploadedFile[];
  applicationDocuments?: ApplicationDocument[]; // Added: to filter files by category
  onFilesChange?: (files: File[]) => void;
  onRemoveFile?: (idx: number) => void;
  onDeleteFile?: (fileId: string) => void;
  applicationId?: string;
  category?: string;
  subCategory?: string;
  addedBy?: string;
  consultationId?: string;
  showDocumentsHeading?: boolean;
  showTitle?: boolean;
  onValidationErrors?: (errors: string[]) => void;
  onUploaded?: (
    uploadedFiles: UploadedFile[],
    applicationDocuments: ApplicationDocument[]
  ) => void;
  uploadImmediately?: boolean; // New prop to control upload timing
  onPendingFilesChange?: (files: File[]) => void; // New prop to notify parent of pending files
  /** Notifies parent so Save and continue can stay disabled until scans are clean. */
  onUploadGateChange?: (gate: FileUploadGate) => void;
}

export interface FileUploadHandle {
  triggerUpload: () => Promise<{ uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[] }>;
  getPendingFiles: () => File[];
  getUploadGate: () => FileUploadGate;
}

const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(({
  title = "Upload a file",
  prefix = "",
  uploadedFiles,
  applicationDocuments,
  onFilesChange,
  onRemoveFile,
  onDeleteFile,
  applicationId,
  category,
  subCategory,
  addedBy, // eslint-disable-line @typescript-eslint/no-unused-vars
  consultationId,
  showDocumentsHeading = true,
  showTitle = true,
  onValidationErrors,
  onUploaded,
  uploadImmediately = false, // Changed: Wait for "Save and Continue" by default
  onPendingFilesChange,
  onUploadGateChange,
}, ref) => {
  // Get user from auth context
  const { user } = useAuthUserContext();
  const userId =
    (user as AuthUser)?.user_id ||
    (user as AuthUser)?.person_id ||
    DEMO_USER_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanAbortRef = useRef<AbortController | null>(null);
  // Tracks files whose scan came back INFECTED. While any entry exists here the
  // component must never let the applicant continue (SYEIA-46 AC2/AC4). Keyed by
  // "name::size" so it survives re-renders without holding the File objects.
  const blockedFilesRef = useRef<Set<string>>(new Set());
  const getFileKey = (name: string, size: number) => `${name}::${size}`;
  // True after we have pushed a virus warning to the parent page error slot.
  // Used to clear that slot once infected files are gone, without wiping unrelated
  // validation errors (e.g. "upload a file").
  const virusWarningActiveRef = useRef(false);
  // Tracks the in-flight immediate upload+scan so "Save and continue" can wait
  // for a scan verdict before deciding whether to block (SYEIA-46 AC2/AC4).
  const uploadInFlightRef = useRef<Promise<unknown> | null>(null);
  // State mirror of in-flight work so the gate re-renders as soon as files are
  // selected (before async presign/scan) — closes the race where Save and continue
  // stayed enabled for one tick after file select.
  const [isUploadInProgress, setIsUploadInProgress] = useState(false);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // New state for files awaiting upload
  const [hasInfectedFiles, setHasInfectedFiles] = useState(false);

  const onValidationErrorsRef = useRef(onValidationErrors);
  onValidationErrorsRef.current = onValidationErrors;

  const syncBlockedFilesState = () => {
    setHasInfectedFiles(blockedFilesRef.current.size > 0);
  };

  const markFileInfected = (name: string, size: number) => {
    blockedFilesRef.current.add(getFileKey(name, size));
    syncBlockedFilesState();
  };

  const clearFileInfected = (name: string, size: number) => {
    blockedFilesRef.current.delete(getFileKey(name, size));
    // Also clear any size-mismatched keys for the same filename (API size can
    // differ from browser File.size).
    for (const key of [...blockedFilesRef.current]) {
      if (key.startsWith(`${name}::`)) {
        blockedFilesRef.current.delete(key);
      }
    }
    syncBlockedFilesState();
  };

  const countBlockedPending = (pending: File[]) =>
    pending.filter((f) =>
      blockedFilesRef.current.has(getFileKey(f.name, f.size))
    ).length;

  /**
   * After delete/remove: keep the virus warning if any infected file remains;
   * only clear it when none remain. Never wipe the warning while infections exist.
   */
  const applyVirusWarningAfterDelete = (
    listedFiles: UploadedFile[] | undefined,
    pending: File[],
    meta: Record<string, FileScanMeta>,
    excludeFileId?: string
  ) => {
    const result = reconcileVirusWarningAfterDelete({
      files: listedFiles ?? [],
      metaById: meta,
      excludeFileId,
      blockedPendingCount: countBlockedPending(pending),
    });

    if (result.keepVirusWarning && result.virusMessage) {
      setHasInfectedFiles(true);
      setUploadNoticeMessage(result.virusMessage);
      virusWarningActiveRef.current = true;
      onValidationErrorsRef.current?.([result.virusMessage]);
      return;
    }

    // No infected files left — clear virus warning only (keep clean success summary).
    // Do not wipe the whole block set here; keys were already removed via clearFileInfected.
    setHasInfectedFiles(blockedFilesRef.current.size > 0);
    setUploadNoticeMessage(result.successMessage);
    if (virusWarningActiveRef.current) {
      virusWarningActiveRef.current = false;
      onValidationErrorsRef.current?.([]);
    }
  };

  // Add files to the pending queue (used so immediate-upload files stay tracked
  // until their scan verdict is known).
  const markFilesPending = (filesToAdd: File[]) => {
    setPendingFiles((prev) => {
      const additions = filesToAdd.filter(
        (a) => !prev.some((p) => p.name === a.name && p.size === a.size)
      );
      return additions.length ? [...prev, ...additions] : prev;
    });
  };

  // Remove a single file from the pending queue once it is confirmed clean.
  const unmarkFilePending = (name: string, size: number) => {
    setPendingFiles((prev) =>
      prev.filter((f) => !(f.name === name && f.size === size))
    );
  };
  const [isScanning, setIsScanning] = useState(false);
  const [uploadNoticeMessage, setUploadNoticeMessage] = useState<string | null>(null);
  // Enrichment when parent pages omit scan fields from uploadedFiles
  const [scanMetaByFileId, setScanMetaByFileId] = useState<Record<string, FileScanMeta>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statuses, setStatuses] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [downloadStatuses, setDownloadStatuses] = useState<string[]>([]);
 
  const files = internalFiles;

  const displayFiles = useMemo(() => {
    if (!Array.isArray(uploadedFiles)) {
      return [];
    }
    return uploadedFiles.map((file) => {
      const meta = scanMetaByFileId[file.id];
      if (!meta) {
        return file;
      }
      return {
        ...file,
        scanStatus: file.scanStatus ?? meta.scanStatus ?? null,
        scanResult: file.scanResult ?? meta.scanResult ?? null,
        virusName: file.virusName ?? meta.virusName ?? null,
        scannedAt: file.scannedAt ?? meta.scannedAt ?? null,
      };
    });
  }, [uploadedFiles, scanMetaByFileId]);

  // Keep Save and continue blocked whenever any listed file is INFECTED
  // (covers live scan results and post-refresh enrichment).
  useEffect(() => {
    const uploadedInfected = displayFiles.some(
      (file) => file.scanResult === "INFECTED"
    );
    setHasInfectedFiles(
      uploadedInfected || blockedFilesRef.current.size > 0
    );
  }, [displayFiles]);

  // Keep parent Save and continue buttons in sync with scan / infection state.
  const onUploadGateChangeRef = useRef(onUploadGateChange);
  onUploadGateChangeRef.current = onUploadGateChange;
  const lastGateRef = useRef<FileUploadGate | null>(null);
  // Busy = virus scan polling OR upload already started (immediate mode).
  const isBusy = isScanning || isUploadInProgress;

  useEffect(() => {
    const notify = onUploadGateChangeRef.current;
    if (!notify) {
      return;
    }
    const gate = buildUploadGate(isBusy, hasInfectedFiles);
    const prev = lastGateRef.current;
    if (
      prev &&
      prev.isScanning === gate.isScanning &&
      prev.hasInfectedFiles === gate.hasInfectedFiles &&
      prev.canContinue === gate.canContinue
    ) {
      return;
    }
    lastGateRef.current = gate;
    notify(gate);
  }, [isBusy, hasInfectedFiles]);

  // When this upload unmounts, clear the gate so multi-upload pages do not
  // stay blocked by a stale instance that is no longer on the page.
  useEffect(() => {
    return () => {
      onUploadGateChangeRef.current?.(DEFAULT_FILE_UPLOAD_GATE);
    };
  }, []);

  useEffect(() => {
    return () => {
      scanAbortRef.current?.abort();
    };
  }, []);

  // Parents often map UploadedFile without scan fields — load them here for all pages.
  useEffect(() => {
    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      return;
    }

    const idsNeedingScan = uploadedFiles
      .filter(
        (file) =>
          Boolean(file?.id) &&
          file.scanStatus == null &&
          file.scanResult == null &&
          !scanMetaByFileId[file.id]
      )
      .map((file) => file.id);

    if (idsNeedingScan.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const statuses = await getFilesScanStatus(idsNeedingScan);
        if (cancelled) {
          return;
        }

        const nextMeta: Record<string, FileScanMeta> = {};
        let infectedCount = 0;

        for (const status of statuses) {
          if (status.error || !status.fileId) {
            continue;
          }
          nextMeta[status.fileId] = {
            scanStatus: status.scanStatus ?? null,
            scanResult: status.scanResult ?? null,
            virusName: status.virusName ?? null,
            scannedAt: status.scannedAt ?? null,
          };
          if (status.scanResult === 'INFECTED') {
            infectedCount += 1;
          }
        }

        if (Object.keys(nextMeta).length > 0) {
          setScanMetaByFileId((prev) => ({ ...prev, ...nextMeta }));
        }

        if (!isScanning && infectedCount > 0) {
          setHasInfectedFiles(true);
          const message =
            infectedCount === 1
              ? INFECTED_USER_MESSAGE
              : INFECTED_MULTI_USER_MESSAGE(infectedCount);
          setUploadNoticeMessage(message);
          virusWarningActiveRef.current = true;
          if (onValidationErrors) {
            onValidationErrors([message]);
          }
        }
      } catch (error) {
        logger.warn('Failed to enrich uploaded files with scan status', { error });
      }
    })();

    return () => {
      cancelled = true;
    };
    // scanMetaByFileId intentionally omitted to avoid re-fetch loops; we skip ids already enriched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles, isScanning]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    triggerUpload: async () => {
      // Immediate-upload mode: a scan may still be running from when the file was
      // selected. Wait for the verdict before deciding whether to continue, so an
      // infected file can never slip through the scanning window (SYEIA-46 AC2/AC4).
      if (uploadInFlightRef.current) {
        try {
          await uploadInFlightRef.current;
        } catch {
          // Any upload failure is surfaced per-file; the block check below decides.
        }
      }

      // If immediate-mode pending files remain with no in-flight promise (e.g. race
      // before the upload was assigned), upload them now rather than clearing and
      // allowing Save and continue to proceed without a scan verdict.
      if (uploadImmediately && pendingFiles.length > 0) {
        if (uploadInFlightRef.current) {
          try {
            await uploadInFlightRef.current;
          } catch {
            // Surfaced per-file below.
          }
        } else {
          setIsUploadInProgress(true);
          const pendingSnapshot = [...pendingFiles];
          const promise = uploadFiles(pendingSnapshot).finally(() => {
            if (uploadInFlightRef.current === promise) {
              uploadInFlightRef.current = null;
            }
            setIsUploadInProgress(false);
          });
          uploadInFlightRef.current = promise;
          try {
            await promise;
          } catch {
            // Surfaced per-file below.
          }
        }
      }

      // Block progression while any file is flagged infected. The applicant must
      // remove the offending file before they can continue.
      if (blockedFilesRef.current.size > 0 || hasInfectedFiles) {
        throw new Error(INFECTED_USER_MESSAGE);
      }

      // Also block if any listed uploaded file is still marked INFECTED (e.g. after
      // refresh enrichment) even if the blocked-files ref was cleared.
      const listedInfected = (uploadedFiles ?? []).some(
        (f) => f.scanResult === 'INFECTED' || scanMetaByFileId[f.id]?.scanResult === 'INFECTED'
      );
      if (listedInfected) {
        throw new Error(INFECTED_USER_MESSAGE);
      }

      // Deferred-upload mode: files were queued but not uploaded yet - upload now.
      if (!uploadImmediately && pendingFiles.length > 0) {
        logger.info('Manually triggering upload for pending files', {
          pendingFilesCount: pendingFiles.length
        });

        const result = await uploadFiles(pendingFiles);

        // The scan may have flagged a file as infected during this upload.
        if (blockedFilesRef.current.size > 0) {
          throw new Error(INFECTED_USER_MESSAGE);
        }

        setPendingFiles([]); // Clear pending files after a fully clean upload
        if (onPendingFilesChange) {
          onPendingFilesChange([]);
        }
        // Never hand infected files back to the parent save payload.
        const cleanUploaded = result.uploadedFiles.filter(
          (f) => f.scanResult !== 'INFECTED'
        );
        const cleanIds = new Set(cleanUploaded.map((f) => f.id));
        return {
          uploadedFiles: cleanUploaded,
          applicationDocuments: result.applicationDocuments.filter((doc) =>
            cleanIds.has(doc.fileId)
          ),
        };
      }

      // Immediate mode: clean files were already attached via onUploaded during
      // upload. Clear any leftover pending entries (none are infected here).
      setPendingFiles([]);
      if (onPendingFilesChange) {
        onPendingFilesChange([]);
      }
      return { uploadedFiles: [], applicationDocuments: [] };
    },
    getPendingFiles: () => pendingFiles,
    getUploadGate: () => buildUploadGate(isScanning || isUploadInProgress, hasInfectedFiles),
  }));

  // Notify parent when pending files change
  useEffect(() => {
    if (onPendingFilesChange) {
      onPendingFilesChange(pendingFiles);
    }
  }, [pendingFiles, onPendingFilesChange]);

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    
    if (onValidationErrors) {
      onValidationErrors([]);
    }
    setUploadNoticeMessage(null);

    const fileIdsForThisCategory = applicationDocuments
      ?.filter(doc => doc.category === category)
      .map(doc => doc.fileId) || [];
    
    const uploadedFilesForThisCategory = uploadedFiles?.filter(
      file => fileIdsForThisCategory.includes(file.id)
    ) || [];
    
    const uploadedFilesSize = uploadedFilesForThisCategory.reduce((sum, f) => sum + Number(f.fileSizeBytes), 0);
    
    const pendingFilesSize = pendingFiles.reduce((sum, f) => sum + f.size, 0);
    
    logger.info('Starting file validation - Per Page Limit', {
      page: prefix,
      category,
      newFilesCount: newFiles.length,
      totalUploadedFiles: uploadedFiles?.length || 0,
      uploadedFilesOnThisCategory: uploadedFilesForThisCategory.length,
      uploadedFilesSizeThisCategory: uploadedFilesSize,
      pendingFilesCount: pendingFiles.length,
      pendingFilesSize,
      totalExistingSize: uploadedFilesSize + pendingFilesSize,
      files: newFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
    const allExistingFiles = [...uploadedFilesForThisCategory, ...pendingFiles];
    const result = await validateFiles(newFiles, allExistingFiles);
    
    logger.info('File validation completed', {
      validFilesCount: result.validFiles.length,
      errorsCount: result.errors.length,
      errors: result.errors
    });
    



    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(error => error.message);
      if (onValidationErrors) {
        onValidationErrors(errorMessages);
      }
    } else {
      if (onValidationErrors) {
        onValidationErrors([]);
      }
    }
    
    if (result.validFiles.length > 0) {
      const allFiles = [...files, ...result.validFiles];
      
      if (onFilesChange) {
        onFilesChange(allFiles);
      } else {
        setInternalFiles(allFiles);
      }
      setStatuses(Array(allFiles.length).fill(""));
      setDownloadStatuses(Array(allFiles.length).fill(""));
      
      if (uploadImmediately) {
        // Upload immediately. Keep files in the pending queue while they upload/scan
        // so triggerUpload can await a verdict and block infected files (SYEIA-46).
        // Start synchronously (no setTimeout) so Save and continue cannot race ahead
        // of uploadInFlightRef / isUploadInProgress.
        markFilesPending(result.validFiles);
        setIsUploadInProgress(true);
        const filesToUpload = result.validFiles;
        const promise = uploadFiles(filesToUpload).finally(() => {
          if (uploadInFlightRef.current === promise) {
            uploadInFlightRef.current = null;
          }
          setIsUploadInProgress(false);
        });
        uploadInFlightRef.current = promise;
      } else {
        // Store files for later upload
        const newPendingFiles = [...pendingFiles, ...result.validFiles];
        setPendingFiles(newPendingFiles);
        logger.info('Files validated and queued for upload on form submission', {
          newFilesCount: result.validFiles.length,
          totalPendingCount: newPendingFiles.length
        });
      }
    }
    
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Immediately clear parent errors when validation starts
    if (onValidationErrors) {
      onValidationErrors([]);
    }
    
    const fileIdsForThisCategory = applicationDocuments
      ?.filter(doc => doc.category === category)
      .map(doc => doc.fileId) || [];
    
    const uploadedFilesForThisCategory = uploadedFiles?.filter(
      file => fileIdsForThisCategory.includes(file.id)
    ) || [];
  
    const uploadedFilesSize = uploadedFilesForThisCategory.reduce((sum, f) => sum + Number(f.fileSizeBytes), 0);
    const pendingFilesSize = pendingFiles.reduce((sum, f) => sum + f.size, 0);
    
    logger.info('Starting file validation (drop) - Per Page Limit', {
      page: prefix,
      droppedFilesCount: droppedFiles.length,
      uploadedFilesOnThisPage: uploadedFilesForThisCategory.length,
      uploadedFilesSize,
      pendingFilesSize,
      totalExistingSize: uploadedFilesSize + pendingFilesSize
    });
    
    const allExistingFiles = [...uploadedFilesForThisCategory, ...pendingFiles];
    const result = await validateFiles(droppedFiles, allExistingFiles);
    
    // Handle validation errors
    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(error => error.message);
      if (onValidationErrors) {
        onValidationErrors(errorMessages);
      }
    } else {
      if (onValidationErrors) {
        onValidationErrors([]);
      }
    }
    
     if (result.validFiles.length > 0) {
      const allFiles = [...files, ...result.validFiles];
      
      if (onFilesChange) {
        onFilesChange(allFiles);
      } else {
        setInternalFiles(allFiles);
      }
      setStatuses(Array(allFiles.length).fill(""));
      setDownloadStatuses(Array(allFiles.length).fill(""));
      
      if (uploadImmediately) {
        // Upload immediately. Start synchronously so Save and continue cannot race
        // ahead of the scan gate (SYEIA-46 AC2/AC4).
        markFilesPending(result.validFiles);
        setIsUploadInProgress(true);
        const filesToUpload = result.validFiles;
        const promise = uploadFiles(filesToUpload).finally(() => {
          if (uploadInFlightRef.current === promise) {
            uploadInFlightRef.current = null;
          }
          setIsUploadInProgress(false);
        });
        uploadInFlightRef.current = promise;
      } else {
        // Store files for later upload
        const newPendingFiles = [...pendingFiles, ...result.validFiles];
        setPendingFiles(newPendingFiles);
        logger.info('Files dropped, validated and queued for upload on form submission', {
          newFilesCount: result.validFiles.length,
          totalPendingCount: newPendingFiles.length
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveFile = (idx: number) => {
    const fileToRemove = files[idx];
    
    if (onRemoveFile) {
      onRemoveFile(idx);
    } else {
      setInternalFiles((prev) => prev.filter((_, i) => i !== idx));
    }
    setStatuses((prev) => prev.filter((_, i) => i !== idx));
    setDownloadStatuses((prev) => prev.filter((_, i) => i !== idx));

    if (fileToRemove) {
      clearFileInfected(fileToRemove.name, fileToRemove.size);
      const updatedPending = pendingFiles.filter(
        (f) => !(f.name === fileToRemove.name && f.size === fileToRemove.size)
      );
      setPendingFiles(updatedPending);
      applyVirusWarningAfterDelete(uploadedFiles, updatedPending, scanMetaByFileId);
    }
  };

  // Core upload logic, called instantly after file select/drop
  const uploadFiles = async (uploadFiles: File[]): Promise<{ uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[] }> => {
    
    if (uploadFiles.length === 0) {
      setStatuses(["No files selected"]);
      return { uploadedFiles: [], applicationDocuments: [] };
    }

    // These files are being (re)scanned now, so clear any stale "infected" block
    // for them; the scan below re-adds it if the file is still infected.
    for (const f of uploadFiles) {
      clearFileInfected(f.name, f.size);
    }
    setStatuses(Array(uploadFiles.length).fill("Requesting presigned URLs..."));
    // Mark busy immediately (before presign) so Save and continue stays disabled.
    setIsScanning(true);
    scanAbortRef.current?.abort();
    const abortController = new AbortController();
    scanAbortRef.current = abortController;
    
    try {
      const fileMetas = uploadFiles.map((f) => ({
        filename: prefix ? `${prefix}/${f.name}` : f.name,
        contentType: f.type || "application/octet-stream",
      }));
      
      const data = await getPresignedUrls(fileMetas);
      
      if (!data.urls || data.urls.length !== uploadFiles.length) {
        setStatuses(
          Array(uploadFiles.length).fill("Failed to get presigned URLs")
        );
        setIsScanning(false);
        return { uploadedFiles: [], applicationDocuments: [] };
      }
      const newStatuses = Array(uploadFiles.length).fill("");
      const uploadedFiles: UploadedFile[] = [];
      const applicationDocuments: ApplicationDocument[] = [];

      type ConfirmedUpload = {
        index: number;
        confirmResponse: Awaited<ReturnType<typeof confirmUpload>>;
      };

      try {
        // Phase 1: parallel S3 PUT + confirm (scans run async on the worker).
        const confirmed = await mapWithConcurrency(
          uploadFiles,
          UPLOAD_CONFIRM_CONCURRENCY,
          async (file, i): Promise<ConfirmedUpload | null> => {
            const urlObj = data.urls[i];
            if (!urlObj?.url) {
              newStatuses[i] = "Failed to get presigned URL";
              setStatuses([...newStatuses]);
              return null;
            }

            try {
              newStatuses[i] = "Uploading to S3...";
              setStatuses([...newStatuses]);

              const uploadRes = await uploadFileToS3(urlObj.url, file);
              if (!uploadRes.ok) {
                newStatuses[i] = "Upload failed: " + uploadRes.statusText;
                setStatuses([...newStatuses]);
                return null;
              }

              const s3Key = prefix ? `${prefix}/${file.name}` : file.name;
              const etag = uploadRes.headers.get("etag");

              newStatuses[i] = "Confirming upload...";
              setStatuses([...newStatuses]);

              logger.info("S3 upload successful, calling confirm endpoint", {
                s3Key,
                etag,
                fileName: file.name,
              });

              const confirmResponse = await confirmUpload(
                {
                  s3Key,
                  fileName: file.name,
                  contentType: file.type || "application/octet-stream",
                  fileSize: file.size,
                  etag: etag || undefined,
                  applicationId: applicationId || "",
                  category: category || "",
                  addedBy: userId,
                  subCategory: subCategory,
                  consultationId: consultationId,
                },
                { signal: abortController.signal }
              );

              logger.info("Upload confirmed by server", {
                documentId: confirmResponse.documentId,
                fileId: confirmResponse.fileId,
                s3Key: confirmResponse.s3Key,
                scanStatus: confirmResponse.scanStatus,
              });

              newStatuses[i] =
                "Your file is being scanned. Please wait while the upload is processed.";
              setStatuses([...newStatuses]);
              return { index: i, confirmResponse };
            } catch (err) {
              newStatuses[i] =
                "Error: " + (err instanceof Error ? err.message : String(err));
              setStatuses([...newStatuses]);
              logger.error("Upload or confirm failed", {
                fileName: file.name,
                error: err,
              });
              return null;
            }
          }
        );

        const confirmedUploads = confirmed.filter(
          (item): item is ConfirmedUpload => item !== null
        );

        if (confirmedUploads.length === 0) {
          return { uploadedFiles, applicationDocuments };
        }

        if (onValidationErrors) {
          onValidationErrors([]);
        }

        // Phase 2: batch poll — add each file to the list as soon as its scan finishes.
        const fileIds = confirmedUploads.map((c) => c.confirmResponse.fileId);
        const confirmByFileId = new Map(
          confirmedUploads.map((c) => [c.confirmResponse.fileId, c])
        );

        let infectedCount = 0;
        let cleanCount = 0;
        let failedCount = 0;

        const promoteCompletedFile = (
          scanStatus: Awaited<ReturnType<typeof waitForFilesScan>>[number]
        ) => {
          const item = confirmByFileId.get(scanStatus.fileId);
          if (!item) {
            return;
          }
          // Prevent double-promoting the same fileId.
          confirmByFileId.delete(scanStatus.fileId);

          const { index: i, confirmResponse } = item;

          if (scanStatus.error) {
            newStatuses[i] = scanStatus.error;
            failedCount += 1;
            setStatuses([...newStatuses]);
            const failedFile = uploadFiles[i];
            if (failedFile) {
              unmarkFilePending(failedFile.name, failedFile.size);
            }
            return;
          }

          if (
            scanStatus.scanStatus === "FAILED" ||
            (scanStatus.scanResult !== "CLEAN" && scanStatus.scanResult !== "INFECTED")
          ) {
            const failedMessage =
              scanStatus.userMessage || FAILED_USER_MESSAGE;
            newStatuses[i] = failedMessage;
            failedCount += 1;
            setStatuses([...newStatuses]);
            const failedFile = uploadFiles[i];
            if (failedFile) {
              unmarkFilePending(failedFile.name, failedFile.size);
            }
            return;
          }

          clearPresignedUrlCache(confirmResponse.s3Key);
          clearPresignedUrlCache(`download_${confirmResponse.s3Key}`);

          const isInfected = scanStatus.scanResult === "INFECTED";
          if (isInfected) {
            // SYEIA-46 AC2/AC4: reject infected files for progression, but still show
            // them in the documents list with an error so the applicant can remove them
            // immediately (without waiting for a page refresh).
            infectedCount += 1;
            newStatuses[i] = scanStatus.userMessage || INFECTED_USER_MESSAGE;
            setStatuses([...newStatuses]);

            const infectedFile = uploadFiles[i];
            if (infectedFile) {
              markFileInfected(infectedFile.name, infectedFile.size);
              unmarkFilePending(infectedFile.name, infectedFile.size);
            }

            const infectedUploadedFile: UploadedFile = {
              id: confirmResponse.fileId,
              storageProvider: "aws_s3",
              s3Key: confirmResponse.s3Key,
              bucketName: scanStatus.bucketName || confirmResponse.bucketName,
              virtualFolder: confirmResponse.virtualFolder,
              filename: confirmResponse.fileName,
              fileContentType: confirmResponse.contentType,
              fileSizeBytes: confirmResponse.fileSizeBytes,
              uploadedAtTimestamp: confirmResponse.uploadedAt,
              scanStatus: scanStatus.scanStatus,
              scanResult: scanStatus.scanResult,
              virusName: scanStatus.virusName,
              scannedAt: scanStatus.scannedAt,
            };
            uploadedFiles.push(infectedUploadedFile);

            const infectedApplicationDocument: ApplicationDocument = {
              documentId: confirmResponse.documentId,
              applicationId: applicationId || "",
              fileId: confirmResponse.fileId,
              category: category || "",
              subCategory: subCategory || "",
              title: confirmResponse.fileName,
              virtualFolder: confirmResponse.virtualFolder,
              addedBy: userId,
              addedAt: confirmResponse.uploadedAt,
              consultationId: consultationId || undefined,
            };
            applicationDocuments.push(infectedApplicationDocument);

            if (onUploaded) {
              onUploaded([infectedUploadedFile], [infectedApplicationDocument]);
            }

            // Surface the virus message as soon as this file finishes — do not wait
            // for the rest of the batch (mixed clean/infected uploads).
            virusWarningActiveRef.current = true;
            if (onValidationErrors) {
              onValidationErrors([
                infectedCount === 1
                  ? (scanStatus.userMessage || INFECTED_USER_MESSAGE)
                  : INFECTED_MULTI_USER_MESSAGE(infectedCount),
              ]);
            }
            setUploadNoticeMessage(
              infectedCount === 1
                ? (scanStatus.userMessage || INFECTED_USER_MESSAGE)
                : INFECTED_MULTI_USER_MESSAGE(infectedCount)
            );

            setInternalFiles((prevFiles: File[]) => {
              const idxToRemove = prevFiles.findIndex(
                (f: File) =>
                  f.name === uploadFiles[i].name && f.size === uploadFiles[i].size
              );
              if (idxToRemove !== -1) {
                setStatuses((prevStatuses: string[]) =>
                  prevStatuses.filter((_, idx: number) => idx !== idxToRemove)
                );
                setDownloadStatuses((prevDownloadStatuses: string[]) =>
                  prevDownloadStatuses.filter((_, idx: number) => idx !== idxToRemove)
                );
                return prevFiles.filter((_, idx: number) => idx !== idxToRemove);
              }
              return prevFiles;
            });
            return;
          }

          cleanCount += 1;
          newStatuses[i] = "File scanned successfully. Upload complete.";
          // Only show a clean success summary when nothing in this batch is infected.
          if (infectedCount === 0) {
            setUploadNoticeMessage(formatUploadSummary(cleanCount));
          }
          setStatuses([...newStatuses]);

          // Clean verdict - the file is now attached, so drop it from the pending
          // queue (it no longer needs to gate "Save and continue").
          {
            const cleanFile = uploadFiles[i];
            if (cleanFile) {
              unmarkFilePending(cleanFile.name, cleanFile.size);
            }
          }

          const uploadedFile: UploadedFile = {
            id: confirmResponse.fileId,
            storageProvider: "aws_s3",
            s3Key: confirmResponse.s3Key,
            bucketName: scanStatus.bucketName || confirmResponse.bucketName,
            virtualFolder: confirmResponse.virtualFolder,
            filename: confirmResponse.fileName,
            fileContentType: confirmResponse.contentType,
            fileSizeBytes: confirmResponse.fileSizeBytes,
            uploadedAtTimestamp: confirmResponse.uploadedAt,
            scanStatus: scanStatus.scanStatus,
            scanResult: scanStatus.scanResult,
            virusName: scanStatus.virusName,
            scannedAt: scanStatus.scannedAt,
          };
          uploadedFiles.push(uploadedFile);

          const applicationDocument: ApplicationDocument = {
            documentId: confirmResponse.documentId,
            applicationId: applicationId || "",
            fileId: confirmResponse.fileId,
            category: category || "",
            subCategory: subCategory || "",
            title: confirmResponse.fileName,
            virtualFolder: confirmResponse.virtualFolder,
            addedBy: userId,
            addedAt: confirmResponse.uploadedAt,
            consultationId: consultationId || undefined,
          };
          applicationDocuments.push(applicationDocument);

          // Progressive list update — parent appends as each scan finishes.
          if (onUploaded) {
            onUploaded([uploadedFile], [applicationDocument]);
          }

          setInternalFiles((prevFiles: File[]) => {
            const idxToRemove = prevFiles.findIndex(
              (f: File) =>
                f.name === uploadFiles[i].name && f.size === uploadFiles[i].size
            );
            if (idxToRemove !== -1) {
              setStatuses((prevStatuses: string[]) =>
                prevStatuses.filter((_, idx: number) => idx !== idxToRemove)
              );
              setDownloadStatuses((prevDownloadStatuses: string[]) =>
                prevDownloadStatuses.filter((_, idx: number) => idx !== idxToRemove)
              );
              return prevFiles.filter((_, idx: number) => idx !== idxToRemove);
            }
            return prevFiles;
          });
        };

        await waitForFilesScan(fileIds, {
          signal: abortController.signal,
          onProgress: (statuses) => {
            const byId = new Map(statuses.map((s) => [s.fileId, s]));
            for (const item of confirmedUploads) {
              const status = byId.get(item.confirmResponse.fileId);
              if (!status || status.scanStatus === "COMPLETED" || status.scanStatus === "FAILED") {
                continue;
              }
              newStatuses[item.index] =
                status.userMessage ||
                "Your file is being scanned. Please wait while the upload is processed.";
            }
            setStatuses([...newStatuses]);
          },
          onFileComplete: promoteCompletedFile,
        });

        setStatuses([...newStatuses]);

        // Keep / restore the virus warning when infections remain. Do not clear
        // a progressive warning just because blocked/listed counts look empty.
        const listedInfectedCount = countInfectedListedFiles(
          uploadedFiles ?? [],
          scanMetaByFileId
        );
        const batchResult = reconcileVirusWarningAfterScanBatch({
          batchInfectedCount: infectedCount,
          blockedRemainingCount: blockedFilesRef.current.size,
          listedInfectedCount,
          failedCount,
          cleanCount,
          virusWarningWasActive: virusWarningActiveRef.current,
        });

        if (batchResult.virusMessage) {
          setUploadNoticeMessage(batchResult.virusMessage);
          virusWarningActiveRef.current = true;
          const scanErrors = [batchResult.virusMessage];
          if (batchResult.failedMessage) {
            scanErrors.push(batchResult.failedMessage);
          }
          onValidationErrors?.(scanErrors);
        } else if (batchResult.failedMessage) {
          setUploadNoticeMessage(batchResult.failedMessage);
          onValidationErrors?.([batchResult.failedMessage]);
        } else {
          setUploadNoticeMessage(batchResult.successMessage);
        }
      } finally {
        setIsScanning(false);
      }

      // Files already pushed via progressive onUploaded — return accumulated lists.
      return { uploadedFiles, applicationDocuments};
    } catch (err) {
      setIsScanning(false);
      setStatuses(
        Array(uploadFiles.length).fill(
          "Error: " + (err instanceof Error ? err.message : String(err))
        )
      );
      return { uploadedFiles: [], applicationDocuments: [] };
    }
  };

  // Handle file deletion from S3
  const handleDeleteFile = async (fileId: string, s3Key: string) => {
    try {
      const deletedFile = (uploadedFiles ?? []).find((f) => f.id === fileId);
      await deleteFileCompletely(fileId, s3Key);
      const nextMeta = { ...scanMetaByFileId };
      delete nextMeta[fileId];
      setScanMetaByFileId(nextMeta);
      if (deletedFile) {
        const baseName = getFileBaseName(deletedFile.filename);
        if (baseName) {
          clearFileInfected(baseName, Number(deletedFile.fileSizeBytes) || 0);
        }
      }
      // Keep virus warning if other infected files remain; clear only when none left.
      applyVirusWarningAfterDelete(
        uploadedFiles,
        pendingFiles,
        nextMeta,
        fileId
      );
      if (onDeleteFile) {
        onDeleteFile(fileId);
      }
      
    } catch (error) {
      const err = error as Error & { response?: { data?: { error?: string }, status?: number }, status?: number };
      
      logger.error('File Deletion Error Details:', {
        fileId,
        s3Key,
        errorName: err?.name,
        errorMessage: err?.message,
        errorStatus: err?.status || err?.response?.status,
        errorData: err?.response?.data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      
      const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error occurred';
      logger.error('Failed to delete file completely', {
        fileId,
        s3Key,
        errorMessage: errorMsg,
        error: err
      });
    }
  };

  return (
    <div className="gds-upload-container" tabIndex={-1} aria-busy={isBusy || undefined}>
      {/* Documents Uploaded Section - Show uploaded files first */}
      {showDocumentsHeading && displayFiles.length > 0 && (
        <div className="govuk-!-margin-bottom-6">
          {/* <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Documents uploaded</h2> */}
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              {displayFiles.map((file: UploadedFile, idx: number) => (
                <tr key={file.id} className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={async (e) => {
                        e.preventDefault();
                        // Only COMPLETED + CLEAN files may be downloaded. Block infected,
                        // failed, still-scanning and unknown-scan-state files (e.g. before
                        // enrichment completes) before reaching the download path.
                        if (file.scanResult === "INFECTED") {
                          setUploadNoticeMessage(
                            file.virusName
                              ? `${INFECTED_USER_MESSAGE} (${file.virusName})`
                              : INFECTED_USER_MESSAGE
                          );
                          return;
                        }
                        if (file.scanStatus === "FAILED") {
                          setUploadNoticeMessage(FAILED_USER_MESSAGE);
                          return;
                        }
                        // Still scanning / unknown — block download quietly (no scanning banner).
                        if (file.scanStatus !== "COMPLETED" || file.scanResult !== "CLEAN") {
                          return;
                        }
                        if (file.s3Key) {
                          try {
                            await downloadS3FileOnSameTab(file.s3Key);
                          } catch (error) {
                            const message =
                              error instanceof Error
                                ? error.message
                                : "Failed to download file";
                            logger.error('Failed to download file', {
                              s3Key: file.s3Key,
                              filename: file.filename,
                              error
                            });
                            setUploadNoticeMessage(message);
                          }
                        }
                      }}
                    >
                      {file.filename ? file.filename.split("/").pop() : ""}
                    </a>
                    {file.scanResult === "INFECTED" && (
                      <p className="govuk-error-message govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                        <span className="govuk-visually-hidden">Error:</span> {INFECTED_USER_MESSAGE}
                      </p>
                    )}
                    {file.scanStatus === "FAILED" && (
                      <p className="govuk-error-message govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                        <span className="govuk-visually-hidden">Error:</span> {FAILED_USER_MESSAGE}
                      </p>
                    )}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (onDeleteFile) {
                          await handleDeleteFile(file.id, file.s3Key);
                        } else if (onRemoveFile) {
                          setUploadNoticeMessage(null);
                          onRemoveFile(idx);
                        }
                      }}
                    >
                      Delete
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Files Section - Show files waiting to be uploaded */}
      {pendingFiles.length > 0 && (
        <div className="govuk-!-margin-bottom-6">
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              {pendingFiles.map((file: File, idx: number) => (
                <tr key={`pending-${idx}`} className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        // Create a blob URL and open in new tab for viewing
                        const blobUrl = URL.createObjectURL(file);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.target = '_blank';
                        link.click();
                        // Clean up the blob URL after a delay
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                      }}
                    >
                      {file.name}
                    </a>
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        const removed = pendingFiles[idx];
                        if (removed) {
                          clearFileInfected(removed.name, removed.size);
                        }
                        const updatedPendingFiles = pendingFiles.filter((_, i) => i !== idx);
                        setPendingFiles(updatedPendingFiles);
                        applyVirusWarningAfterDelete(
                          uploadedFiles,
                          updatedPendingFiles,
                          scanMetaByFileId
                        );
                        
                        if (onPendingFilesChange) {
                          onPendingFilesChange(updatedPendingFiles);
                        }
                      }}
                    >
                      Remove
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File Upload Section - Upload controls appear after uploaded files */}
      {showTitle && (
        <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
          {title}
        </h3>
      )}
      <p className="govuk-hint govuk-!-margin-bottom-4">
        You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and
        .xlsx files of up to 25MB each. Files cannot be password protected.
      </p>
      {uploadNoticeMessage && (
        <div
          className={hasInfectedFiles ? "govuk-!-margin-bottom-4" : "govuk-inset-text"}
          role={hasInfectedFiles ? "alert" : "status"}
          aria-live="polite"
        >
          {hasInfectedFiles ? (
            <p className="govuk-error-message govuk-!-margin-bottom-0">
              <span className="govuk-visually-hidden">Error:</span> {uploadNoticeMessage}
            </p>
          ) : (
            <p className="govuk-body govuk-!-margin-bottom-0">{uploadNoticeMessage}</p>
          )}
        </div>
      )}

      <div
        className="gds-upload-dropzone"
        onDrop={(e) => {
          if (isScanning) {
            e.preventDefault();
            return;
          }
          handleDrop(e);
        }}
        onDragOver={handleDragOver}
        onClick={() => {
          if (isScanning) {
            return;
          }
          if (onValidationErrors) {
            onValidationErrors([]);
          }
          fileInputRef.current?.click();
        }}
        style={isScanning ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          id="file-upload-input" 
          aria-label="Upload file"
          title="Upload file"
          className="govuk-visually-hidden"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.msg,.doc,.docx,.xls,.xlsx"
          disabled={isScanning}
        />
        <div className="gds-upload-dropzone-content">
          <span>No file chosen</span>
          <button type="button" className="gds-upload-choose" disabled={isScanning}>
            Choose file
          </button>
          <span>or drop file</span>
        </div>
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
