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


// Utility to get presigned S3 URL and download file directly
// Utility to get presigned S3 URL and download file directly
// Simple redirect approach - no CORS issues
export async function downloadS3FileOnSameTab(keyOrUrl: string) {
  const { getPresignedGetUrlForDownload } = await import('../services/s3ApiService');
  try {
    const result = await getPresignedGetUrlForDownload(keyOrUrl);
    if (result.url) {
      // Simple approach: just navigate to the URL
      // The browser will either download or display based on Content-Type
      window.location.href = result.url;
    } else {
      alert('Failed to get download URL');
    }
  } catch (err) {
    console.error('Download error:', err);
    alert('Failed to download file');
  }
}