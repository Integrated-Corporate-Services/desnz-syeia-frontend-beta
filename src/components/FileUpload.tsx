import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { downloadS3FileOnSameTab } from "../utils/s3DownloadUtil";
import "../styles/Fileupload.css";
import {
  getPresignedUrls,
  uploadFileToS3,
  deleteFileCompletely,
  confirmUpload,
  getFileScanStatuses,
} from "../services/s3ApiService";
import { createLogger } from "../utils/logger";
import { validateFiles, } from "../utils/fileUploadValidation";

import { UploadedFile, ApplicationDocument } from "../types/fileUpload";
import { waitForScanResult } from "../utils/fileScanPolling";
import { useAuthUserContext } from "../context/AuthUserContext";
import type { AuthUser } from "../types/auth";
import { DEMO_USER_ID } from "../constants/demo";

const logger = createLogger('FileUpload');

interface RejectedFile {
  id: string;
  s3Key: string;
  filename: string;
  reason: 'INFECTED' | 'FAILED' | 'PENDING';
  virusName?: string | null;
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
  triggerUpload: () => Promise<{
    uploadedFiles: UploadedFile[];
    applicationDocuments: ApplicationDocument[];
    scanErrors: string[];
  }>;
  getPendingFiles: () => File[];
  /** True while a file is still being uploaded/virus-scanned, OR while a file has
   * been confirmed infected/failed and is still sitting there unresolved. Covers
   * both uploadImmediately and deferred modes. Callers should check this before
   * navigating away, since triggerUpload() is a no-op when uploadImmediately=true. */
  isBusy: () => boolean;
  /** The specific reason(s) isBusy() is currently true - e.g. "<file> contains a
   * virus (<name>) and cannot be used. Remove the file and try again." for a
   * confirmed-infected file, vs a generic "still scanning" message when nothing
   * is actually wrong yet. Empty array when isBusy() is false. */
  getBlockingMessages: () => string[];
  /** True if any currently-blocking reason is a confirmed infected/failed file
   * (not just "still scanning"). Callers should NOT auto-dismiss the message in
   * this case - it won't resolve on its own, only deleting the file clears it. */
  hasRejectedFiles: () => boolean;
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
  uploadImmediately = false,
  onPendingFilesChange,
}, ref) => {
  // Get user from auth context
  const { user } = useAuthUserContext();
  const userId =
    (user as AuthUser)?.user_id ||
    (user as AuthUser)?.person_id ||
    DEMO_USER_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // New state for files awaiting upload
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]); // Infected/failed-scan files - kept visible so the user can delete them
  const [isScanning, setIsScanning] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statuses, setStatuses] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [downloadStatuses, setDownloadStatuses] = useState<string[]>([]);

  const files = internalFiles;

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
      return { uploadedFiles: [], applicationDocuments: [], scanErrors: [] };
    },
    getPendingFiles: () => pendingFiles,
    isBusy: () => isScanning || rejectedFiles.length > 0,
    getBlockingMessages: () => {
      if (rejectedFiles.length > 0) {
        return rejectedFiles.map((f) => {
          const displayName = f.filename ? f.filename.split('/').pop() : f.filename;
          if (f.reason === 'INFECTED') {
            return `${displayName} contains a virus${f.virusName ? ` (${f.virusName})` : ''} and cannot be used. Remove the file and try again.`;
          }
          if (f.reason === 'FAILED') {
            return `${displayName} could not be checked for viruses. Remove the file and try again.`;
          }
          return `${displayName} is still being checked for viruses. Wait for the scan to finish before continuing.`;
        });
      }
      if (isScanning) {
        return ['File scan is in progress. Wait for the scan to finish before continuing.'];
      }
      return [];
    },
    hasRejectedFiles: () => rejectedFiles.length > 0,
  }));

  useEffect(() => {
    const ids = (uploadedFiles || []).map((f) => f.id).filter(Boolean);
    if (ids.length === 0) return;

    let cancelled = false;

    (async () => {
      try {
        const { statuses } = await getFileScanStatuses(ids);
        if (cancelled) return;

        const statusById = new Map(statuses.map((s) => [s.fileId, s]));
        const newlyUnsafe: RejectedFile[] = [];

        for (const file of uploadedFiles || []) {
          const status = statusById.get(file.id);
          const isClean = status?.scanStatus === 'COMPLETED' && status?.scanResult === 'CLEAN';
          if (isClean) continue;

          const reason: RejectedFile['reason'] =
            status?.scanStatus === 'COMPLETED' && status?.scanResult === 'INFECTED'
              ? 'INFECTED'
              : status?.scanStatus === 'FAILED'
                ? 'FAILED'
                : 'PENDING';

          newlyUnsafe.push({
            id: file.id,
            s3Key: file.s3Key,
            filename: file.filename,
            reason,
            virusName: status?.virusName,
          });
        }

        if (newlyUnsafe.length > 0) {
          logger.warn('Excluding non-clean pre-loaded files from the downloadable documents list', {
            files: newlyUnsafe.map((f) => ({ id: f.id, filename: f.filename, reason: f.reason })),
          });
          setRejectedFiles((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const toAdd = newlyUnsafe.filter((f) => !existingIds.has(f.id));
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });
        }
      } catch (err) {
        logger.error('Failed to re-verify scan status of previously-loaded files', { error: err });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uploadedFiles]);

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

    if (result.validFiles.length > 0 && result.errors.length === 0) {
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

    if (result.validFiles.length > 0 && result.errors.length === 0) {
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
  const uploadFiles = async (uploadFiles: File[]): Promise<{
    uploadedFiles: UploadedFile[];
    applicationDocuments: ApplicationDocument[];
    scanErrors: string[];
  }> => {

    if (uploadFiles.length === 0) {
      setStatuses(["No files selected"]);
      return { uploadedFiles: [], applicationDocuments: [], scanErrors: [] };
    }
    setStatuses(Array(uploadFiles.length).fill("Requesting presigned URLs..."));
    setIsScanning(true);

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
        return { uploadedFiles: [], applicationDocuments: [], scanErrors: [] };
      }
      const newStatuses = Array(uploadFiles.length).fill("");
      const uploadedFiles: UploadedFile[] = [];
      const applicationDocuments: ApplicationDocument[] = [];
      const scanErrors: string[] = [];
      const newRejectedFiles: RejectedFile[] = [];

      for (let i = 0; i < uploadFiles.length; i++) {
        const urlObj = data.urls[i];
        if (!urlObj.url) {
          newStatuses[i] = "Failed to get presigned URL";
          setStatuses([...newStatuses]);
          continue;
        }
        newStatuses[i] = "Uploading to S3...";
        setStatuses([...newStatuses]);
        try {
          const uploadRes = await uploadFileToS3(urlObj.url, uploadFiles[i]);

          if (uploadRes.ok) {
            const s3Key = prefix
              ? `${prefix}/${uploadFiles[i].name}`
              : uploadFiles[i].name;

            const etag = uploadRes.headers.get('etag');

            newStatuses[i] = "Confirming upload...";
            setStatuses([...newStatuses]);

            logger.info('S3 upload successful, calling confirm endpoint', {
              s3Key,
              etag,
              fileName: uploadFiles[i].name
            });

            const confirmResponse = await confirmUpload({
              s3Key,
              fileName: uploadFiles[i].name,
              contentType: uploadFiles[i].type || 'application/octet-stream',
              fileSize: uploadFiles[i].size,
              etag: etag || undefined,
              applicationId: applicationId || '',
              category: category || '',
              addedBy: userId,
              subCategory: subCategory,
              consultationId: consultationId
            });

            logger.info('Upload confirmed by server', {
              documentId: confirmResponse.documentId,
              fileId: confirmResponse.fileId,
              s3Key: confirmResponse.s3Key
            });

            newStatuses[i] = "Scanning for viruses...";
            setStatuses([...newStatuses]);

            const scanOutcome = await waitForScanResult(confirmResponse.fileId);
            const displayName = confirmResponse.fileName.split('/').pop() || confirmResponse.fileName;

            if (scanOutcome.scanStatus === 'COMPLETED' && scanOutcome.scanResult === 'INFECTED') {
              logger.warn('Uploaded file failed virus scan', {
                fileId: confirmResponse.fileId,
                fileName: confirmResponse.fileName,
                virusName: scanOutcome.virusName,
              });
              scanErrors.push(
                `${displayName} contains a virus${scanOutcome.virusName ? ` (${scanOutcome.virusName})` : ''} and could not be uploaded. Remove the file and try again.`
              );
              newRejectedFiles.push({
                id: confirmResponse.fileId,
                s3Key: confirmResponse.s3Key,
                filename: confirmResponse.fileName,
                reason: 'INFECTED',
                virusName: scanOutcome.virusName,
              });
              newStatuses[i] = "Virus detected";
            } else if (scanOutcome.scanStatus !== 'COMPLETED') {
              logger.warn('Uploaded file scan did not complete', {
                fileId: confirmResponse.fileId,
                fileName: confirmResponse.fileName,
                scanStatus: scanOutcome.scanStatus,
              });
              scanErrors.push(`${displayName} could not be checked for viruses. Try uploading it again.`);
              newRejectedFiles.push({
                id: confirmResponse.fileId,
                s3Key: confirmResponse.s3Key,
                filename: confirmResponse.fileName,
                reason: 'FAILED',
              });
              newStatuses[i] = "Scan failed";
            } else {
              const uploadedFile: UploadedFile = {
                id: confirmResponse.fileId,
                storageProvider: "aws_s3",
                s3Key: confirmResponse.s3Key,
                bucketName: confirmResponse.bucketName,
                virtualFolder: confirmResponse.virtualFolder,
                filename: confirmResponse.fileName,
                fileContentType: confirmResponse.contentType,
                fileSizeBytes: confirmResponse.fileSizeBytes,
                uploadedAtTimestamp: confirmResponse.uploadedAt,
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

              newStatuses[i] = "Upload complete";
            }

            setStatuses([...newStatuses]);

            setInternalFiles((prevFiles: File[]) => {
              const idxToRemove = prevFiles.findIndex(
                (file: File) =>
                  file.name === uploadFiles[i].name &&
                  file.size === uploadFiles[i].size
              );
              if (idxToRemove !== -1) {
                setStatuses((prevStatuses: string[]) =>
                  prevStatuses.filter((_, idx: number) => idx !== idxToRemove)
                );
                setDownloadStatuses((prevDownloadStatuses: string[]) =>
                  prevDownloadStatuses.filter(
                    (_, idx: number) => idx !== idxToRemove
                  )
                );
                return prevFiles.filter(
                  (_, idx: number) => idx !== idxToRemove
                );
              }
              return prevFiles;
            });
          } else {
            newStatuses[i] = "Upload failed: " + uploadRes.statusText;
            setStatuses([...newStatuses]);
          }
        } catch (err) {
          newStatuses[i] =
            "Error: " + (err instanceof Error ? err.message : String(err));
          setStatuses([...newStatuses]);
          logger.error('Upload or confirm failed', {
            fileName: uploadFiles[i].name,
            error: err
          });
        }
      }

      if (newRejectedFiles.length > 0) {
        setRejectedFiles((prev) => [...prev, ...newRejectedFiles]);
      }

      if (onValidationErrors) {
        onValidationErrors(scanErrors);
      }

      if (onUploaded) {
        onUploaded(uploadedFiles, applicationDocuments);
      }
      return { uploadedFiles, applicationDocuments, scanErrors };
    } catch (err) {
      setStatuses(
        Array(uploadFiles.length).fill(
          "Error: " + (err instanceof Error ? err.message : String(err))
        )
      );
      return { uploadedFiles: [], applicationDocuments: [], scanErrors: [] };
    } finally {
      setIsScanning(false);
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

  // Handle deletion of an infected/failed-scan file (same S3+DB delete as a clean file)
  const handleDeleteRejectedFile = async (fileId: string, s3Key: string) => {
    try {
      await deleteFileCompletely(fileId, s3Key);
      setRejectedFiles((prev) => prev.filter((f) => f.id !== fileId));

      if (onValidationErrors) {
        onValidationErrors([]);
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to delete rejected file', {
        fileId,
        s3Key,
        errorMessage: err?.message,
        error: err,
      });
    }
  };

  return (
    <div className="gds-upload-container" tabIndex={-1}>
      {showDocumentsHeading && Array.isArray(uploadedFiles) && uploadedFiles.filter(
        (file) => !rejectedFiles.some((rf) => rf.id === file.id)
      ).length > 0 && (
          <div className="govuk-!-margin-bottom-6">
            {/* <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Documents uploaded</h2> */}
            <table className="govuk-table">
              <tbody className="govuk-table__body">
                {uploadedFiles
                  .map((file: UploadedFile, idx: number) => ({ file, idx }))
                  .filter(({ file }) => !rejectedFiles.some((rf) => rf.id === file.id))
                  .map(({ file, idx }) => (
                    <tr key={file.id} className="govuk-table__row">
                      <td className="govuk-table__cell">
                        <a
                          href="#"
                          className="govuk-link"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (file.s3Key) {
                              try {
                                await downloadS3FileOnSameTab(file.s3Key, file.id);
                              } catch (error) {
                                logger.error('Failed to download file', {
                                  s3Key: file.s3Key,
                                  filename: file.filename,
                                  error
                                });
                              }
                            }
                          }}
                        >
                          {file.filename ? file.filename.split("/").pop() : ""}
                        </a>
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

      {/* Rejected Files Section - Infected or failed-scan files, kept visible so they can be deleted */}
      {rejectedFiles.length > 0 && (
        <div className="govuk-!-margin-bottom-6">
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              {rejectedFiles.map((file) => (
                <tr key={file.id} className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <span>{file.filename ? file.filename.split("/").pop() : ""}</span>
                  </td>
                  <td className="govuk-table__cell">
                    {file.reason === 'PENDING' ? (
                      <strong className="govuk-tag govuk-tag--grey">Scanning…</strong>
                    ) : (
                      <strong className="govuk-tag govuk-tag--red">
                        {file.reason === 'INFECTED' ? 'Infected' : 'Scan failed'}
                      </strong>
                    )}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={async (e) => {
                        e.preventDefault();
                        await handleDeleteRejectedFile(file.id, file.s3Key);
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

      <div
        className="gds-upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => {
          if (onValidationErrors) {
            onValidationErrors([]);
          }
          fileInputRef.current?.click();
        }}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          id="file-upload-input"
          className="govuk-visually-hidden"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.msg,.doc,.docx,.xls,.xlsx"
        />
        <div className="gds-upload-dropzone-content">
          <span>No file chosen</span>
          <button type="button" className="gds-upload-choose">
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
