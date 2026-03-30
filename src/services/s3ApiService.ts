// S3 API Service for presigned URL and upload
export async function getPresignedUrls(files: { filename: string; contentType: string }[]) {
  const res = await fetch('/backend/api/upload/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files })
  });
  if (!res.ok) throw new Error('Failed to get presigned URLs');
  return await res.json();
}

export async function uploadFileToS3(url: string, file: File) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file
  });
  return res;
}

// New: Get presigned GET (download) URL for a file
export async function getPresignedGetUrl(filename: string) {
  const res = await fetch('/backend/api/file/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  });
  if (!res.ok) throw new Error('Failed to get presigned GET URL');
  return await res.json();
}

// List files for a given prefix
export async function listFilesByPrefix(prefix: string) {
  const res = await fetch(`/backend/api/files?prefix=${encodeURIComponent(prefix)}`);
  if (!res.ok) throw new Error('Failed to list files');
  return await res.json();
}

// Delete a file from S3 by key
export async function deleteFileFromS3(key: string) {
  const res = await fetch('/backend/api/file/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return await res.json();
}

// Delete a file completely (from both S3 and database)
export async function deleteFileCompletely(fileId: string, key: string) {
  const res = await fetch('/backend/api/file/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, fileId })
  });
  if (!res.ok) {
    const errorResponse = await res.json();
    throw new Error(errorResponse.error || 'Failed to delete file completely');
  }
  return await res.json();
}

// Get presigned GET URL that forces download
export async function getPresignedGetUrlForDownload(filename: string) {
  const res = await fetch('/backend/api/file/presigned-url/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename })
  });
  if (!res.ok) throw new Error('Failed to get presigned download URL');
  return await res.json();
}