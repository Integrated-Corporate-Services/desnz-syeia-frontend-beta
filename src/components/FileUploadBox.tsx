import React, { useRef, useState } from 'react';
import { getPresignedUrls, uploadFileToS3, getPresignedGetUrl } from '../services/s3ApiService';
import { FileUploadResponse } from '../types/FileUploadResponse';
import { validateFiles, formatFileSize, FILE_SIZE_LIMITS } from '../utils/fileUploadValidation';
import { createLogger } from '../utils/logger';

const logger = createLogger('FileUploadBox');

export interface FileUploadBoxProps {
  title?: string;
  prefix?: string;
  onUploadComplete?: (results: FileUploadResponse[]) => void;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ title = 'Upload files', prefix = '', onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const [downloadStatuses, setDownloadStatuses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New: State for existing files in S3 for this prefix
  const [existingFiles, setExistingFiles] = useState<Array<{ key: string, size: number, lastModified: string }>>([]);
  const [existingFilesLoading, setExistingFilesLoading] = useState(false);
  const [existingFilesError, setExistingFilesError] = useState<string | null>(null);

  // Fetch existing files for the prefix on mount
  React.useEffect(() => {
    if (!prefix) return;
    setExistingFilesLoading(true);
    setExistingFilesError(null);
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
  }, [prefix]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    setValidationErrors([]); // Clear previous errors
    
    // Calculate S3 files size for validation
    const s3FilesSize = existingFiles.reduce((sum, f) => sum + f.size, 0);
    
    // Validate files before processing
    logger.info('Validating files before upload', {
      newFilesCount: newFiles.length,
      stagedFilesCount: files.length,
      s3FilesCount: existingFiles.length
    });
    
    const validationResult = await validateFiles(newFiles, files, s3FilesSize);
    
    if (validationResult.errors.length > 0) {
      const errorMessages = validationResult.errors.map(err => err.message);
      setValidationErrors(errorMessages);
      logger.warn('File validation failed', {
        errorsCount: validationResult.errors.length,
        errors: validationResult.errors
      });
      e.target.value = ''; // Clear the input
      return; // Stop processing if there are validation errors
    }
    
    logger.info('Files validated successfully', {
      validFilesCount: validationResult.validFiles.length
    });
    
    // Remove duplicates by name and size
    const allFiles = [...files, ...validationResult.validFiles];
    const uniqueFiles = allFiles.filter((file, idx, arr) =>
      arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );
    // Find indices of new files in the uniqueFiles array
    const newFileIndices = uniqueFiles
      .map((file, idx) => ({ file, idx }))
      .filter(({ file }) => validationResult.validFiles.some(nf => nf.name === file.name && nf.size === file.size))
      .map(({ idx }) => idx);
  setFiles(uniqueFiles);
  setStatuses(Array(uniqueFiles.length).fill(''));
  setDescriptions(Array(uniqueFiles.length).fill(''));
  setDownloadStatuses(Array(uniqueFiles.length).fill(''));
    e.target.value = '';
    // Only upload the newly added files
    setTimeout(() => {
      if (newFileIndices.length > 0) {
        uploadFiles(
          newFileIndices.map(i => uniqueFiles[i]),
          newFileIndices.map(i => descriptions[i])
        );
      }
    }, 0);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setValidationErrors([]); // Clear previous errors
    
    // Calculate sizes for debugging - INCLUDING already uploaded files in S3
    const s3FilesSize = existingFiles.reduce((sum, f) => sum + f.size, 0);
    
    // Validate files before processing
    logger.info('Validating dropped files before upload', {
      droppedFilesCount: droppedFiles.length,
      stagedFilesCount: files.length,
      s3FilesCount: existingFiles.length
    });
    
    const validationResult = await validateFiles(droppedFiles, files, s3FilesSize);
    
    if (validationResult.errors.length > 0) {
      const errorMessages = validationResult.errors.map(err => err.message);
      setValidationErrors(errorMessages);
      logger.warn('File validation failed', {
        errorsCount: validationResult.errors.length,
        errors: validationResult.errors
      });
      return; // Stop processing if there are validation errors
    }
    
    logger.info('Dropped files validated successfully', {
      validFilesCount: validationResult.validFiles.length
    });
    
    // Remove duplicates by name and size
    const allFiles = [...files, ...validationResult.validFiles];
    const uniqueFiles = allFiles.filter((file, idx, arr) =>
      arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );
    // Find indices of new files in the uniqueFiles array
    const newFileIndices = uniqueFiles
      .map((file, idx) => ({ file, idx }))
      .filter(({ file }) => validationResult.validFiles.some(df => df.name === file.name && df.size === file.size))
      .map(({ idx }) => idx);
  setFiles(uniqueFiles);
  setStatuses(Array(uniqueFiles.length).fill(''));
  setDescriptions(Array(uniqueFiles.length).fill(''));
  setDownloadStatuses(Array(uniqueFiles.length).fill(''));
    // Only upload the newly added files
    setTimeout(() => {
      if (newFileIndices.length > 0) {
        uploadFiles(
          newFileIndices.map(i => uniqueFiles[i]),
          newFileIndices.map(i => descriptions[i])
        );
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (idx: number) => {
    setRemoveIdx(idx);
  };

  const confirmRemoveFile = () => {
    if (removeIdx === null) return;
    const newFiles = files.filter((_, i) => i !== removeIdx);
  setFiles(newFiles);
  setStatuses(statuses.filter((_, i) => i !== removeIdx));
  setDescriptions(descriptions.filter((_, i) => i !== removeIdx));
  setDownloadStatuses(downloadStatuses.filter((_, i) => i !== removeIdx));
    setRemoveIdx(null);
  };

  const cancelRemoveFile = () => {
    setRemoveIdx(null);
  };

  // Core upload logic, called instantly after file select/drop
  const uploadFiles = async (uploadFiles: File[], uploadDescriptions: string[]) => {
    if (uploadFiles.length === 0) {
      setStatuses(['No files selected']);
      return;
    }
    setStatuses(Array(uploadFiles.length).fill('Requesting presigned URLs...'));
    try {
      const fileMetas = uploadFiles.map((f, i) => ({
        filename: prefix ? `${prefix}/${f.name}` : f.name,
        contentType: f.type || 'application/octet-stream',
        description: uploadDescriptions[i]
      }));
      const data = await getPresignedUrls(fileMetas);
      if (!data.urls || data.urls.length !== uploadFiles.length) {
        setStatuses(Array(uploadFiles.length).fill('Failed to get presigned URLs'));
        setError('Failed to get presigned URLs');
        return;
      }
      const newStatuses = Array(uploadFiles.length).fill('');
      for (let i = 0; i < uploadFiles.length; i++) {
        const urlObj = data.urls[i];
        if (!urlObj.url) {
          newStatuses[i] = 'Failed to get presigned URL';
          setStatuses([...newStatuses]);
          setError('Failed to get presigned URL');
          continue;
        }
        newStatuses[i] = 'Uploading to S3...';
        setStatuses([...newStatuses]);
        try {
          const uploadRes = await uploadFileToS3(urlObj.url, uploadFiles[i]);
          if (uploadRes.ok) {
            newStatuses[i] = 'Upload successful!';
          } else {
            newStatuses[i] = 'Upload failed: ' + uploadRes.statusText;
            setError('Upload failed: ' + uploadRes.statusText);
          }
        } catch (err) {
          newStatuses[i] = 'Error: ' + (err instanceof Error ? err.message : String(err));
          setError('Error: ' + (err instanceof Error ? err.message : String(err)));
        }
        setStatuses([...newStatuses]);
      }
      if (onUploadComplete) {
        // Map presigned URL response to include contentType and fileSize
        const uploadResults = data.urls.map((urlObj: any, i: number) => ({
          filename: urlObj.filename,
          status: newStatuses[i],
          description: uploadDescriptions[i],
          contentType: urlObj.contentType,
          fileSize: urlObj.fileSize,
          bucketName: urlObj.bucketName,
          url: urlObj.url
        }));
        onUploadComplete(uploadResults);
      }
    } catch (err) {
      setStatuses(Array(uploadFiles.length).fill('Error: ' + (err instanceof Error ? err.message : String(err))));
      setError('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Download handler for each file
  const handleDownloadFile = async (idx: number) => {
    setDownloadStatuses(ds => {
      const newDs = [...ds];
      newDs[idx] = 'Requesting download link...';
      return newDs;
    });
    try {
      const filename = files[idx].name;
      const prefixPath = prefix ? `${prefix}/${filename}` : filename;
      const url = await getPresignedGetUrl(prefixPath);
      if (!url) {
        setDownloadStatuses(ds => {
          const newDs = [...ds];
          newDs[idx] = 'Failed to get download link';
          return newDs;
        });
        return;
      }
      setDownloadStatuses(ds => {
        const newDs = [...ds];
        newDs[idx] = 'Downloading...';
        return newDs;
      });
      // Start download
      window.open(url, '_blank');
      setDownloadStatuses(ds => {
        const newDs = [...ds];
        newDs[idx] = '';
        return newDs;
      });
    } catch (err) {
      setDownloadStatuses(ds => {
        const newDs = [...ds];
        newDs[idx] = 'Error: ' + (err instanceof Error ? err.message : String(err));
        return newDs;
      });
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {title && <h2 style={{ marginBottom: 24 }}>{title}</h2>}
      {error && <div style={{ color: '#d4351c', marginBottom: 16 }}>{error}</div>}
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title" data-module="govuk-error-summary">
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
              {validationErrors.map((error, index) => (
                <li key={index}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Existing files for this path/prefix */}
      <div style={{ marginBottom: 32 }}>
        {existingFilesLoading && <div>Loading files...</div>}
        {!existingFilesLoading && !existingFilesError && existingFiles.length === 0 && (
          <div style={{ color: '#505a5f' }}>No files found.</div>
        )}
        {!existingFilesLoading && !existingFilesError && existingFiles.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {existingFiles.map((file, idx) => (
              <div key={file.key} style={{ border: '2px solid #b1b4b6', background: '#fff', marginBottom: 16, padding: 12, boxSizing: 'border-box', width: '100%', maxWidth: 700, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#0b0c0c', background: '#f3f2f1', padding: '2px 4px', fontSize: '1.05rem' }}>{file.key.replace(prefix + '/', '')}</span>
                <span style={{ marginLeft: 8, color: '#505a5f', fontSize: '1rem' }}>- {Math.round(file.size / 1024)} kB</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const url = await getPresignedGetUrl(file.key);
                      if (url) window.open(url, '_blank');
                    } catch (err) {
                      alert('Failed to download: ' + (err instanceof Error ? err.message : String(err)));
                    }
                  }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#00703c', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', fontWeight: 400 }}
                >Download</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        onDrop={error ? undefined : handleDrop}
        onDragOver={error ? undefined : handleDragOver}
        style={{ border: '2px dashed #b1b4b6', background: '#fafafa', padding: 24, marginBottom: 32, textAlign: 'center', cursor: error ? 'not-allowed' : 'pointer', fontSize: '1.25rem', width: '100%', color: '#0b0c0c', boxSizing: 'border-box', maxWidth: 700 }}
        aria-label="Drag and drop your documents here"
        onClick={() => !error && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={error ? undefined : handleFileChange}
          style={{ display: 'none' }}
          disabled={!!error}
        />
        <span style={{ fontWeight: 500, color: '#0b0c0c' }}>Drag and drop your documents here, or{' '}
          <span style={{ color: error ? '#888' : '#1d70b8', textDecoration: 'underline', cursor: error ? 'not-allowed' : 'pointer' }} onClick={e => { if (!error) { e.stopPropagation(); fileInputRef.current?.click(); } }}>
            choose a file
          </span>
        </span>
        {error && (
          <button type="button" className="govuk-button" disabled style={{ marginTop: 16 }}>
            Upload disabled due to error
          </button>
        )}
      </div>
      {files.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {files.map((file, idx) => (
            <div key={file.name + idx} style={{ border: '4px solid #b1b4b6', background: '#fff', marginBottom: 24, padding: 16, boxSizing: 'border-box', width: '100%', maxWidth: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ background: '#f3f2f1', fontWeight: 'bold', padding: '2px 4px', fontSize: '1.15rem', lineHeight: '1.5', borderBottom: '4px solid #b1b4b6', boxShadow: 'none', color: '#0b0c0c' }}>{file.name}</span>
                <span style={{ marginLeft: 8, color: '#505a5f', fontSize: '1.1rem' }}>- {Math.round(file.size / 1024)} kB</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#1d70b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 400 }}
                >Remove file</button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(idx)}
                  style={{ marginLeft: 12, background: 'none', border: 'none', color: '#00703c', textDecoration: 'underline', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 400 }}
                >Download</button>
                {statuses[idx] && (
                  <span style={{ marginLeft: 16, color: statuses[idx].includes('successful') ? '#00703c' : '#d4351c', fontWeight: 500, fontSize: '1rem' }}>{statuses[idx]}</span>
                )}
                {downloadStatuses[idx] && (
                  <span style={{ marginLeft: 16, color: downloadStatuses[idx].includes('Error') ? '#d4351c' : '#505a5f', fontWeight: 500, fontSize: '1rem' }}>{downloadStatuses[idx]}</span>
                )}
                {removeIdx !== null && removeIdx === idx && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', border: '4px solid #b1b4b6', padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}>
                      <button onClick={cancelRemoveFile} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#222', fontWeight: 700, fontSize: 18, textDecoration: 'underline', backgroundColor: '#ffeb3b' }}>Close</button>
                      <div style={{ marginBottom: 24, fontSize: '1.15rem', color: '#0b0c0c', fontWeight: 500 }}>
                        Are you sure you want to remove <span style={{ fontWeight: 700 }}>{files[removeIdx]?.name}</span>?
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <button onClick={confirmRemoveFile} style={{ background: '#00703c', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', padding: '8px 24px', borderRadius: 2, cursor: 'pointer' }}>Remove</button>
                        <button onClick={cancelRemoveFile} style={{ background: '#f3f2f1', color: '#222', fontWeight: 700, fontSize: 16, border: 'none', padding: '8px 24px', borderRadius: 2, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadBox;
