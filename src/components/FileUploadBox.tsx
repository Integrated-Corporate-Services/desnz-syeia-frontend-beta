import React, { useRef, useState } from 'react';
import { getPresignedUrls, uploadFileToS3 } from '../services/s3ApiService';

export interface FileUploadBoxProps {
  title?: string;
  prefix?: string;
  onUploadComplete?: (results: Array<{ filename: string; status: string; description: string }>) => void;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ title = 'Upload files', prefix = '', onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    // Remove duplicates by name and size
    const allFiles = [...files, ...newFiles];
    const uniqueFiles = allFiles.filter((file, idx, arr) =>
      arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );
    // Find indices of new files in the uniqueFiles array
    const newFileIndices = uniqueFiles
      .map((file, idx) => ({ file, idx }))
      .filter(({ file }) => newFiles.some(nf => nf.name === file.name && nf.size === file.size))
      .map(({ idx }) => idx);
    setFiles(uniqueFiles);
    setStatuses(Array(uniqueFiles.length).fill(''));
    setDescriptions(Array(uniqueFiles.length).fill(''));
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    // Remove duplicates by name and size
    const allFiles = [...files, ...droppedFiles];
    const uniqueFiles = allFiles.filter((file, idx, arr) =>
      arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );
    // Find indices of new files in the uniqueFiles array
    const newFileIndices = uniqueFiles
      .map((file, idx) => ({ file, idx }))
      .filter(({ file }) => droppedFiles.some(df => df.name === file.name && df.size === file.size))
      .map(({ idx }) => idx);
    setFiles(uniqueFiles);
    setStatuses(Array(uniqueFiles.length).fill(''));
    setDescriptions(Array(uniqueFiles.length).fill(''));
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
        return;
      }
      const newStatuses = Array(uploadFiles.length).fill('');
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
            newStatuses[i] = 'Upload successful!';
          } else {
            newStatuses[i] = 'Upload failed: ' + uploadRes.statusText;
          }
        } catch (err) {
          newStatuses[i] = 'Error: ' + (err instanceof Error ? err.message : String(err));
        }
        setStatuses([...newStatuses]);
      }
      if (onUploadComplete) {
        onUploadComplete(uploadFiles.map((f, i) => ({ filename: prefix ? `${prefix}/${f.name}` : f.name, status: newStatuses[i], description: uploadDescriptions[i] })));
      }
    } catch (err) {
      setStatuses(Array(uploadFiles.length).fill('Error: ' + (err instanceof Error ? err.message : String(err))));
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {title && <h2 style={{ marginBottom: 24 }}>{title}</h2>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: '2px dashed #b1b4b6', background: '#fafafa', padding: 24, marginBottom: 32, textAlign: 'center', cursor: 'pointer', fontSize: '1.25rem', width: '100%', color: '#0b0c0c', boxSizing: 'border-box', maxWidth: 700 }}
        aria-label="Drag and drop your documents here"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <span style={{ fontWeight: 500, color: '#0b0c0c' }}>Drag and drop your documents here, or{' '}
          <span style={{ color: '#1d70b8', textDecoration: 'underline', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>choose a file</span>
        </span>
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
                {removeIdx !== null && (
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
