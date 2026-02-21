import React, { useRef, useState } from "react";
import { downloadS3File } from "../utils/s3DownloadUtil";
import "../styles/Fileupload.css";
import {
  getPresignedUrls,
  uploadFileToS3,
} from "../services/s3ApiService";

import { UploadedFile, ApplicationDocument } from "../types/fileUpload";
import { useAuthUserContext } from "../context/AuthUserContext";
import type { AuthUser } from "../types/auth";
import { DEMO_USER_ID } from "../constants/demo";

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

  // S3 file listing is disabled; display files from uploadedFiles prop/state instead

  // Local files for upload logic
  const files = internalFiles;

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-outlook",
    "image/jpg",
  ];
  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".msg",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
  ];
  const maxFileSize = 25 * 1024 * 1024; // 25MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    // Validation: type and size
    const validatedFiles = newFiles.filter((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const validType =
        allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
      const validSize = file.size <= maxFileSize;
      return validType && validSize;
    });
    // Remove duplicates by name and size
    const allFiles = [...files, ...validatedFiles];
    const uniqueFiles = allFiles.filter(
      (file, idx, arr) =>
        arr.findIndex((f) => f.name === file.name && f.size === file.size) ===
        idx
    );
    if (onFilesChange) {
      onFilesChange(uniqueFiles);
    } else {
      setInternalFiles(uniqueFiles);
    }
    setStatuses(Array(uniqueFiles.length).fill(""));
    setDownloadStatuses(Array(uniqueFiles.length).fill(""));
    e.target.value = "";
    // Only upload the newly added files
    setTimeout(() => {
      const newFileIndices = uniqueFiles
        .map((file, idx) => ({ file, idx }))
        .filter(({ file }) =>
          validatedFiles.some(
            (nf) => nf.name === file.name && nf.size === file.size
          )
        )
        .map(({ idx }) => idx);
      if (newFileIndices.length > 0) {
        uploadFiles(newFileIndices.map((i) => uniqueFiles[i]));
      }
    }, 0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    // Remove duplicates by name and size
    const allFiles = [...files, ...droppedFiles];
    const uniqueFiles = allFiles.filter(
      (file, idx, arr) =>
        arr.findIndex((f) => f.name === file.name && f.size === file.size) ===
        idx
    );
    if (onFilesChange) {
      onFilesChange(uniqueFiles);
    } else {
      setInternalFiles(uniqueFiles);
    }
    setStatuses(Array(uniqueFiles.length).fill(""));
    setDownloadStatuses(Array(uniqueFiles.length).fill(""));
    setTimeout(() => {
      const newFileIndices = uniqueFiles
        .map((file, idx) => ({ file, idx }))
        .filter(({ file }) =>
          droppedFiles.some(
            (df) => df.name === file.name && df.size === file.size
          )
        )
        .map(({ idx }) => idx);
      if (newFileIndices.length > 0) {
        uploadFiles(newFileIndices.map((i) => uniqueFiles[i]));
      }
    }, 0);
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

  return (
    <div className="gds-upload-container">
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
                            await downloadS3File(file.s3Key);
                          } catch (error) {
                            console.error('Failed to download file:', error);
                            alert('Failed to download file. Please try again.');
                          }
                        }
                      }}
                    >
                      {file.filename ? file.filename.split("/").pop() : ""}
                    </a>
                  </td>
                  {/* <td className="govuk-table__cell govuk-table__cell--numeric">
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onDeleteFile) {
                          onDeleteFile(file.id);
                        } else if (onRemoveFile) {
                          onRemoveFile(idx);
                        }
                      }}
                    >
                      Delete
                    </a>
                  </td> */}
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
        .xlsx files of up to 25MB each. Files can not be password protected.
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
