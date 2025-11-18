// Utility to get presigned S3 URL and open in new tab
export async function downloadS3File(keyOrUrl: string) {
  const { getPresignedGetUrl } = await import('../services/s3ApiService');
  try {
    const result = await getPresignedGetUrl(keyOrUrl);
    if (result.url) {
      window.open(result.url, '_blank');
    } else {
      alert('Failed to get download URL');
    }
  } catch (err) {
    alert('Failed to download file');
  }
}