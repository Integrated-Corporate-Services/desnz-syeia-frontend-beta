import React, { useRef, useState, useEffect } from "react";
import { downloadS3FileOnSameTab } from "../utils/s3DownloadUtil";
import "../styles/Fileupload.css";
import {
  getPresignedUrls,
  uploadFileToS3,
  deleteFileCompletely,
} from "../services/s3ApiService"; 
import { createLogger } from "../utils/logger";
import { validateFiles, formatFileSize, FILE_SIZE_LIMITS } from "../utils/fileUploadValidation";

import { UploadedFile, ApplicationDocument } from "../types/fileUpload";
import { useAuthUserContext } from "../context/AuthUserContext";
import type { AuthUser } from "../types/auth";
import { DEMO_USER_ID } from "../constants/demo";

const logger = createLogger('FileUpload');

export interface FileUploadProps {
  title?: string;
  prefix?: string;
  uploadedFiles?: UploadedFile[];
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
}

const FileUpload: React.FC<FileUploadProps> = ({
  title = "Upload a file",
  prefix = "",
  uploadedFiles,
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
}) => {
  // Get user from auth context
  const { user } = useAuthUserContext();
  const userId =
    (user as AuthUser)?.user_id ||
    (user as AuthUser)?.person_id ||
    DEMO_USER_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statuses, setStatuses] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [downloadStatuses, setDownloadStatuses] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  // S3 file listing is disabled; display files from uploadedFiles prop/state instead

  // Local files for upload logic
  const files = internalFiles;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    setValidationErrors([]); // Clear previous errors
    
    // Immediately clear parent errors when validation starts
    if (onValidationErrors) {
      onValidationErrors([]);
    }
    
    logger.info('Starting file validation', {
      newFilesCount: newFiles.length,
      files: newFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
    const result = await validateFiles(newFiles, files);
    
    logger.info('File validation completed', {
      validFilesCount: result.validFiles.length,
      errorsCount: result.errors.length,
      errors: result.errors
    });
    
    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(error => error.message);
      setValidationErrors(errorMessages);
      if (onValidationErrors) {
        onValidationErrors(errorMessages);
      }
    } else {
      setValidationErrors([]);
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
      
      // Upload the newly validated files
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
    }
    
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setValidationErrors([]); // Clear previous errors
    
    // Immediately clear parent errors when validation starts
    if (onValidationErrors) {
      onValidationErrors([]);
    }
    
    const result = await validateFiles(droppedFiles, files);
    
    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(error => error.message);
      setValidationErrors(errorMessages);
      if (onValidationErrors) {
        onValidationErrors(errorMessages);
      }
    } else {
      setValidationErrors([]);
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
      
      // Upload the newly validated files
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
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveFile = (idx: number) => {
    if (onRemoveFile) {
      onRemoveFile(idx);
    } else {
      setInternalFiles((prev) => prev.filter((_, i) => i !== idx));
    }
    setStatuses((prev) => prev.filter((_, i) => i !== idx));
    setDownloadStatuses((prev) => prev.filter((_, i) => i !== idx));
    
    // Clear validation errors when files are removed as space constraints may be resolved
    setValidationErrors([]);
    
    // Also clear parent errors when files are removed
    if (onValidationErrors) {
      onValidationErrors([]);
    }
  };

  // Core upload logic, called instantly after file select/drop
  const uploadFiles = async (uploadFiles: File[]) => {
    if (uploadFiles.length === 0) {
      setStatuses(["No files selected"]);
      return;
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
        return;
      }
      const newStatuses = Array(uploadFiles.length).fill("");
      const uploadedFiles: UploadedFile[] = [];
      const applicationDocuments: ApplicationDocument[] = [];
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
            // Build UploadedFile and ApplicationDocument objects
            const now = new Date().toISOString();
            const s3Key = prefix
              ? `${prefix}/${uploadFiles[i].name}`
              : uploadFiles[i].name;
            const uploadedFile: UploadedFile = {
              id: crypto.randomUUID(),
              storageProvider: "aws_s3",
              s3Key: s3Key,
              bucketName: urlObj.bucketName || "", // If available from backend
              virtualFolder: s3Key.split("/").slice(0, -1).join("/"),
              filename: uploadFiles[i].name,
              fileContentType: uploadFiles[i].type,
              fileSizeBytes: uploadFiles[i].size,
              uploadedAtTimestamp: now,
            };
            uploadedFiles.push(uploadedFile);
            const applicationDocument: ApplicationDocument = {
              documentId: crypto.randomUUID(),
              applicationId: applicationId || "",
              fileId: uploadedFile.id,
              category: category || "",
              subCategory: subCategory || "",
              title: uploadedFile.filename,
              virtualFolder: uploadedFile.virtualFolder,
              addedBy: userId,
              addedAt: uploadedFile.uploadedAtTimestamp,
              consultationId: consultationId || "", // Set if applicable
            };
            applicationDocuments.push(applicationDocument);
            
            // File uploaded successfully
            
            // Remove file and its status from local state after successful upload
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
        }
      }
      // Call onUploaded callback with built objects
      // Calling onUploaded callback with files
      if (onUploaded) {
        onUploaded(uploadedFiles, applicationDocuments);
      }
    } catch (err) {
      setStatuses(
        Array(uploadFiles.length).fill(
          "Error: " + (err instanceof Error ? err.message : String(err))
        )
      );
    }
  };

  // Handle file deletion from S3
  const handleDeleteFile = async (fileId: string, s3Key: string) => {
    try {
      // Delete from both S3 and database using comprehensive deletion
      const result = await deleteFileCompletely(fileId, s3Key);
      
      // File deleted successfully
      
      // Call the onDeleteFile callback to update parent state
      if (onDeleteFile) {
        onDeleteFile(fileId);
      }
      
    } catch (error: any) {
      // Enhanced error logging for deletion failures
      logger.error('File Deletion Error Details:', {
        fileId,
        s3Key,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStatus: error?.status || error?.response?.status,
        errorData: error?.response?.data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      // Log error and show user-friendly error with more context
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error occurred';
      logger.error('Failed to delete file completely', {
        fileId,
        s3Key,
        errorMessage: errorMsg,
        error
      });
    }
  };

  return (
    <div className="gds-upload-container" tabIndex={-1}>
      {/* Documents Uploaded Section - Show uploaded files first */}
      {showDocumentsHeading && Array.isArray(uploadedFiles) && uploadedFiles.length > 0 && (
        <div className="govuk-!-margin-bottom-6">
          {/* <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Documents uploaded</h2> */}
          <table className="govuk-table">
            <tbody className="govuk-table__body">
              {uploadedFiles.map((file: UploadedFile, idx: number) => (
                <tr key={file.id} className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (file.s3Key) {
                          try {
                            await downloadS3FileOnSameTab(file.s3Key);
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

      {/* File validation errors display */}
      {validationErrors.length > 0 && (
        <div className="govuk-error-message govuk-!-margin-bottom-3">
          <span className="govuk-visually-hidden">Error:</span>
          {validationErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
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
        .xlsx files of up to 25MB each.
      </p>

      <div
        className="gds-upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
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
};

export default FileUpload;
