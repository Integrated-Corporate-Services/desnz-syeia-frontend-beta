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

const logger = createLogger('FileUpload');

// GOV.UK / GDS-aligned messages (SYEIA-46 AC3, SYEIA-1466). Backend returns the same
// wording via `userMessage`; these are used as fallbacks and for multi-file summaries.
const INFECTED_USER_MESSAGE =
  'Your document upload was blocked because our virus scan detected a potential security risk. ' +
  'Please check the file on your device, run a virus scan and try uploading a clean version.';

const INFECTED_MULTI_USER_MESSAGE = (count: number): string =>
  `${count} of your document uploads were blocked because our virus scan detected a potential ` +
  'security risk. Please check the files on your device, run a virus scan and try uploading clean versions.';

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
  if (cleanCount <= 0) {
    return null;
  }

  return cleanCount === 1
    ? '1 file uploaded successfully.'
    : `${cleanCount} files uploaded successfully.`;
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
}

export interface FileUploadHandle {
  triggerUpload: () => Promise<{ uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[] }>;
  getPendingFiles: () => File[];
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
}, ref) => {
  // Get user from auth context
  const { user } = useAuthUserContext();
  const userId =
    (user as AuthUser)?.user_id ||
    (user as AuthUser)?.person_id ||
    DEMO_USER_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanAbortRef = useRef<AbortController | null>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // New state for files awaiting upload
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ completed: number; total: number } | null>(null);
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
          setUploadNoticeMessage(
            infectedCount === 1
              ? INFECTED_USER_MESSAGE
              : INFECTED_MULTI_USER_MESSAGE(infectedCount)
          );
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
      if (pendingFiles.length > 0) {
        logger.info('Manually triggering upload for pending files', {
          pendingFilesCount: pendingFiles.length
        });
        
        const result = await uploadFiles(pendingFiles);
        setPendingFiles([]); // Clear pending files after upload
        if (onPendingFilesChange) {
          onPendingFilesChange([]);
        }
        return result;
      }
      return { uploadedFiles: [], applicationDocuments: [] };
    },
    getPendingFiles: () => pendingFiles,
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
        // Upload immediately (original behavior)
        setTimeout(() => {
          const newFileIndices = allFiles
            .map((file, idx) => ({ file, idx }))
            .filter(({ file }) =>
              result.validFiles.some(
                (nf) => nf.name === file.name && nf.size === file.size
              )
            )
            .map(({ idx }) => idx);
          if (newFileIndices.length > 0) {
            uploadFiles(newFileIndices.map((i) => allFiles[i]));
          }
        }, 0);
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
        // Upload immediately (original behavior)
        setTimeout(() => {
          const newFileIndices = allFiles
            .map((file, idx) => ({ file, idx }))
            .filter(({ file }) =>
              result.validFiles.some(
                (df) => df.name === file.name && df.size === file.size
              )
            )
            .map(({ idx }) => idx);
          if (newFileIndices.length > 0) {
            uploadFiles(newFileIndices.map((i) => allFiles[i]));
          }
        }, 0);
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
    
    // Also remove from pending files if it exists there
    if (fileToRemove && !uploadImmediately) {
      setPendingFiles((prev) => 
        prev.filter(f => !(f.name === fileToRemove.name && f.size === fileToRemove.size))
      );
    }
    
   
    if (onValidationErrors) {
      onValidationErrors([]);
    }
  };

  // Core upload logic, called instantly after file select/drop
  const uploadFiles = async (uploadFiles: File[]): Promise<{ uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[] }> => {
    
    if (uploadFiles.length === 0) {
      setStatuses(["No files selected"]);
      return { uploadedFiles: [], applicationDocuments: [] };
    }
    setStatuses(Array(uploadFiles.length).fill("Requesting presigned URLs..."));
    
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
        return { uploadedFiles: [], applicationDocuments: [] };
      }
      const newStatuses = Array(uploadFiles.length).fill("");
      const uploadedFiles: UploadedFile[] = [];
      const applicationDocuments: ApplicationDocument[] = [];

      setIsScanning(true);
      scanAbortRef.current?.abort();
      const abortController = new AbortController();
      scanAbortRef.current = abortController;

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
        setScanProgress({ completed: 0, total: confirmedUploads.length });

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

          setScanProgress((prev) =>
            prev
              ? { ...prev, completed: Math.min(prev.completed + 1, prev.total) }
              : prev
          );

          if (scanStatus.error) {
            newStatuses[i] = scanStatus.error;
            failedCount += 1;
            setStatuses([...newStatuses]);
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
            return;
          }

          clearPresignedUrlCache(confirmResponse.s3Key);
          clearPresignedUrlCache(`download_${confirmResponse.s3Key}`);

          const isInfected = scanStatus.scanResult === "INFECTED";
          if (isInfected) {
            infectedCount += 1;
            newStatuses[i] = scanStatus.userMessage || INFECTED_USER_MESSAGE;
          } else {
            cleanCount += 1;
            newStatuses[i] = "File scanned successfully. Upload complete.";
          }
          setUploadNoticeMessage(formatUploadSummary(cleanCount));
          setStatuses([...newStatuses]);

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

        const summary = formatUploadSummary(cleanCount);
        if (summary) {
          setUploadNoticeMessage(summary);
        } else if (failedCount === 0) {
          setUploadNoticeMessage(null);
        }

        // Surface blocked/failed outcomes in the page-level GOV.UK error summary.
        if ((infectedCount > 0 || failedCount > 0) && onValidationErrors) {
          const scanErrors: string[] = [];
          if (infectedCount > 0) {
            scanErrors.push(
              infectedCount === 1 ? INFECTED_USER_MESSAGE : INFECTED_MULTI_USER_MESSAGE(infectedCount)
            );
          }
          if (failedCount > 0) {
            scanErrors.push(FAILED_USER_MESSAGE);
          }
          onValidationErrors(scanErrors);
        }
      } finally {
        setIsScanning(false);
        setScanProgress(null);
      }

      // Files already pushed via progressive onUploaded — return accumulated lists.
      return { uploadedFiles, applicationDocuments};
    } catch (err) {
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
      await deleteFileCompletely(fileId, s3Key);
      if (onDeleteFile) {
        onDeleteFile(fileId);
      }
      
      if (onValidationErrors) {
        onValidationErrors([]);
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
    <div className="gds-upload-container" tabIndex={-1}>
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
                        if (file.scanStatus && file.scanStatus !== "COMPLETED" && file.scanResult !== "INFECTED") {
                          setUploadNoticeMessage(
                            "Your file is being scanned. Please wait while the upload is processed."
                          );
                          return;
                        }
                        if (file.scanResult === "INFECTED") {
                          setUploadNoticeMessage(
                            file.virusName
                              ? `${INFECTED_USER_MESSAGE} (${file.virusName})`
                              : INFECTED_USER_MESSAGE
                          );
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
                    {file.scanStatus &&
                      file.scanStatus !== "COMPLETED" &&
                      file.scanStatus !== "FAILED" &&
                      file.scanResult !== "INFECTED" && (
                      <p className="govuk-hint govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                        Scanning in progress — download will be available when the scan finishes.
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
                        const updatedPendingFiles = pendingFiles.filter((_, i) => i !== idx);
                        setPendingFiles(updatedPendingFiles);
                        
                        if (onValidationErrors) {
                          onValidationErrors([]);
                        }
                        
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
      {isScanning && (
        <div className="govuk-inset-text" role="status" aria-live="polite">
          <p className="govuk-body govuk-!-margin-bottom-0">
            {scanProgress
              ? `Scanning files. ${scanProgress.completed} of ${scanProgress.total} complete.`
              : "Your file is being scanned. Please wait while the upload is processed."}
          </p>
          <p className="govuk-hint govuk-!-margin-top-2 govuk-!-margin-bottom-0">
            Files appear in the list as soon as each scan finishes.
          </p>
        </div>
      )}
      {!isScanning && uploadNoticeMessage && (
        <div className="govuk-inset-text" role="status" aria-live="polite">
          <p className="govuk-body govuk-!-margin-bottom-0">{uploadNoticeMessage}</p>
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
