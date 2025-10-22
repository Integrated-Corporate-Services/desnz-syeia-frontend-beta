import React, { useRef, useState, useEffect } from 'react';
import '../styles/FileUpload.css';
import { getPresignedUrls, uploadFileToS3, getPresignedGetUrl, deleteFileFromS3 } from '../services/s3ApiService';

import { UploadedFile, ApplicationDocument } from '../types/fileUpload';
import { FILE_CATEGORIES } from '../constants/fileCategoryConstants';
import { useAuthUserContext } from '../context/AuthUserContext';
import type { AuthUser } from '../types/auth';

export interface FileUploadProps {
  title?: string;
  prefix?: string;
  uploadedFiles?: UploadedFile[];
  onFilesChange?: (files: File[]) => void;
  onRemoveFile?: (idx: number) => void;
  applicationId?: string;
  category?: string;
  addedBy?: string;
  onUploaded?: (uploadedFiles: UploadedFile[], applicationDocuments: ApplicationDocument[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ title = 'Upload site photographs', prefix = '', uploadedFiles, onFilesChange, onRemoveFile, applicationId, category, addedBy, onUploaded }) => {
  // Get user from auth context
  const { user } = useAuthUserContext();
  const DEFAULT_USER_ID = "44444444-4444-4444-4444-444444444444";
  const userId = (user as AuthUser)?.person_id || (user as AuthUser)?.user_id || DEFAULT_USER_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const [downloadStatuses, setDownloadStatuses] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<Array<{ key: string, size: number, lastModified: string }>>([]);
  const [existingFilesLoading, setExistingFilesLoading] = useState(false);
  const [existingFilesError, setExistingFilesError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // S3 file listing is disabled; display files from uploadedFiles prop/state instead

  // Local files for upload logic
  const files = internalFiles;

  const allowedTypes = [
    'application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-outlook',
    'image/jpg'
  ];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.msg', '.doc', '.docx', '.xls', '.xlsx'];
  const maxFileSize = 25 * 1024 * 1024; // 25MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    // Validation: type and size
    const validatedFiles = newFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const validType = allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
      const validSize = file.size <= maxFileSize;
      return validType && validSize;
    });
    // Remove duplicates by name and size
    const allFiles = [...files, ...validatedFiles];
    const uniqueFiles = allFiles.filter((file, idx, arr) =>
      arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );
    if (onFilesChange) {
      onFilesChange(uniqueFiles);
    } else {
      setInternalFiles(uniqueFiles);
    }
    setStatuses(Array(uniqueFiles.length).fill(''));
    setDownloadStatuses(Array(uniqueFiles.length).fill(''));
    e.target.value = '';
    // Only upload the newly added files
    setTimeout(() => {
      const newFileIndices = uniqueFiles
        .map((file, idx) => ({ file, idx }))
        .filter(({ file }) => validatedFiles.some(nf => nf.name === file.name && nf.size === file.size))
        .map(({ idx }) => idx);
      if (newFileIndices.length > 0) {
        uploadFiles(
          newFileIndices.map(i => uniqueFiles[i])
        );
      }
    }, 0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    // Remove duplicates by name and size
    const allFiles = [...files, ...droppedFiles];
    const uniqueFiles = allFiles.filter((file, idx, arr) =>
      arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );
    if (onFilesChange) {
      onFilesChange(uniqueFiles);
    } else {
      setInternalFiles(uniqueFiles);
    }
    setStatuses(Array(uniqueFiles.length).fill(''));
    setDownloadStatuses(Array(uniqueFiles.length).fill(''));
    setTimeout(() => {
      const newFileIndices = uniqueFiles
        .map((file, idx) => ({ file, idx }))
        .filter(({ file }) => droppedFiles.some(df => df.name === file.name && df.size === file.size))
        .map(({ idx }) => idx);
      if (newFileIndices.length > 0) {
        uploadFiles(
          newFileIndices.map(i => uniqueFiles[i])
        );
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (idx: number) => {
    if (onRemoveFile) {
      onRemoveFile(idx);
    } else {
      setInternalFiles(prev => prev.filter((_, i) => i !== idx));
    }
    setStatuses(prev => prev.filter((_, i) => i !== idx));
    setDownloadStatuses(prev => prev.filter((_, i) => i !== idx));
  };

  // Core upload logic, called instantly after file select/drop
  const uploadFiles = async (uploadFiles: File[]) => {
    if (uploadFiles.length === 0) {
      setStatuses(['No files selected']);
      return;
    }
    setStatuses(Array(uploadFiles.length).fill('Requesting presigned URLs...'));
    try {
      const fileMetas = uploadFiles.map((f) => ({
        filename: prefix ? `${prefix}/${f.name}` : f.name,
        contentType: f.type || 'application/octet-stream',
      }));
      const data = await getPresignedUrls(fileMetas);
      if (!data.urls || data.urls.length !== uploadFiles.length) {
        setStatuses(Array(uploadFiles.length).fill('Failed to get presigned URLs'));
        return;
      }
      const newStatuses = Array(uploadFiles.length).fill('');
      const uploadedFiles: UploadedFile[] = [];
      const applicationDocuments: ApplicationDocument[] = [];
      for (let i = 0; i < uploadFiles.length; i++) {
        const urlObj = data.urls[i];
        if (!urlObj.url) {
          newStatuses[i] = 'Failed to get presigned URL';
          setStatuses([...newStatuses]);
          continue;
        }
        newStatuses[i] = 'Uploading to S3...';
        setStatuses([...newStatuses]);
        try {
          const uploadRes = await uploadFileToS3(urlObj.url, uploadFiles[i]);
          if (uploadRes.ok) {
            // Build UploadedFile and ApplicationDocument objects
            const now = new Date().toISOString();
            const s3Key = prefix ? `${prefix}/${uploadFiles[i].name}` : uploadFiles[i].name;
            const uploadedFile: UploadedFile = {
              id: crypto.randomUUID(),
              storageProvider: 'aws_s3',
              s3Key: s3Key,
              bucketName: urlObj.bucketName || '', // If available from backend
              virtualFolder: s3Key.split('/').slice(0, -1).join('/'),
              filename: uploadFiles[i].name,
              fileContentType: uploadFiles[i].type,
              fileSizeBytes: uploadFiles[i].size,
              uploadedAtTimestamp: now,
            };
            uploadedFiles.push(uploadedFile);
            const applicationDocument: ApplicationDocument = {
              documentId: crypto.randomUUID(),
              applicationId: applicationId || '',
              fileId: uploadedFile.id,
              category: category || FILE_CATEGORIES.SENSITIVE_AREA_REVIEW,
              title: uploadedFile.filename,
              virtualFolder: uploadedFile.virtualFolder,
              addedBy: userId,
              addedAt: uploadedFile.uploadedAtTimestamp,
            };
            applicationDocuments.push(applicationDocument);
            // Remove file and its status from local state after successful upload
            setInternalFiles((prevFiles: File[]) => {
              const idxToRemove = prevFiles.findIndex((file: File) => file.name === uploadFiles[i].name && file.size === uploadFiles[i].size);
              if (idxToRemove !== -1) {
                setStatuses((prevStatuses: string[]) => prevStatuses.filter((_, idx: number) => idx !== idxToRemove));
                setDownloadStatuses((prevDownloadStatuses: string[]) => prevDownloadStatuses.filter((_, idx: number) => idx !== idxToRemove));
                return prevFiles.filter((_, idx: number) => idx !== idxToRemove);
              }
              return prevFiles;
            });
          } else {
            newStatuses[i] = 'Upload failed: ' + uploadRes.statusText;
            setStatuses([...newStatuses]);
          }
        } catch (err) {
          newStatuses[i] = 'Error: ' + (err instanceof Error ? err.message : String(err));
          setStatuses([...newStatuses]);
        }
      }
      // Call onUploaded callback with built objects
      if (onUploaded) {
        onUploaded(uploadedFiles, applicationDocuments);
      }
      // Refresh existing files after upload
      if (prefix) {
        setExistingFilesLoading(true);
        import('../services/s3ApiService').then(({ listFilesByPrefix }) => {
          listFilesByPrefix(prefix)
            .then(data => {
              setExistingFiles(data.files || []);
              setExistingFilesLoading(false);
            })
            .catch(err => {
              setExistingFilesError(err.message || 'Failed to fetch files');
              setExistingFilesLoading(false);
            });
        });
      }
    } catch (err) {
      setStatuses(Array(uploadFiles.length).fill('Error: ' + (err instanceof Error ? err.message : String(err))));
    }
  };


  // Download handler for each file
  const handleDownloadFile = async (key: string) => {
    try {
      const res = await getPresignedGetUrl(key);
      if (res.url) window.open(res.url, '_blank');
    } catch (err) {
      alert('Failed to download: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Remove handler for S3 files
  const handleRemoveS3File = async (key: string) => {
    try {
      await deleteFileFromS3(key);
      setExistingFiles(prev => prev.filter(f => f.key !== key));
      setRemoveError(null);
    } catch (err) {
      setRemoveError('Failed to remove file: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="gds-upload-container"><div className="gds-upload-title" style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</div><div style={{ color: '#505a5f', marginBottom: '0.5rem', fontSize: '1rem' }}>
        You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each.
      </div>
      {/* Existing files for this path/prefix (from DB, not S3) */}
      <div className="gds-upload-list">
        {/* Display DB files if provided */}
        {Array.isArray(uploadedFiles) && uploadedFiles.length === 0 && (
          <div style={{ color: '#505a5f' }}>No files found.</div>
        )}
        {Array.isArray(uploadedFiles) && uploadedFiles.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {uploadedFiles.map((file: UploadedFile, idx: number) => (
              <div key={file.id} className="gds-upload-file-row" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #b1b4b6', padding: '8px 0' }}>
                <a
                  href="#"
                  className="govuk-link gds-upload-file-link"
                  style={{ flex: '1', color: '#1d70b8', textDecoration: 'underline', fontWeight: 400, fontSize: '1rem' }}
                  onClick={e => { e.preventDefault(); /* add download handler if needed */ }}
                >
                  {file.filename ? file.filename.split('/').pop() : ''}
                </a>
                <span className="gds-upload-file-size" style={{ flex: '0 0 100px', textAlign: 'center', color: '#505a5f', fontSize: '1rem' }}>{Math.round(Number(file.fileSizeBytes) / 1024)} KB</span>
                <a
                  href="#"
                  className="govuk-link gds-upload-remove-link"
                  style={{ flex: '0 0 120px', textAlign: 'right', color: '#1d70b8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 400, fontSize: '1rem', marginLeft: 'auto' }}
                  onClick={e => { e.preventDefault(); if (onRemoveFile) onRemoveFile(idx); }}
                >
                  Remove file
                </a>
              </div>
            ))}
          </div>
        )}
      
      </div><div
        className="gds-upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      ><input
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.msg,.doc,.docx,.xls,.xlsx"
        /><div className="gds-upload-dropzone-content"><span>No file chosen</span><button type="button" className="gds-upload-choose">Choose file</button><span>or drop file</span></div></div></div>
  );
};

export default FileUpload;
