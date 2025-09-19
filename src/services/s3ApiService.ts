// S3 API Service for presigned URL and upload
export async function getPresignedUrls(files: { filename: string; contentType: string }[]) {
  const res = await fetch('/api/upload/presigned-url', {
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
