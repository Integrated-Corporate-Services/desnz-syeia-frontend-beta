// Utility to get presigned S3 URL and trigger download (not preview)
export async function downloadS3File(keyOrUrl: string, filename?: string) {
  const { getPresignedGetUrl } = await import('../services/s3ApiService');
  try {
    const result = await getPresignedGetUrl(keyOrUrl);
    if (result.url) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = result.url;
      
      // Extract filename from URL if not provided
      if (filename) {
        link.download = filename;
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
    } else {
      alert('Failed to get download URL');
    }
  } catch (err) {
    alert('Failed to download file');
  }
}