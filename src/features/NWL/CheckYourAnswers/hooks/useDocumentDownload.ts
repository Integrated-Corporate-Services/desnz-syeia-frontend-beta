import { useEffect } from 'react';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('useDocumentDownload');

export const useDocumentDownload = () => {
    useEffect(() => {
        const handleDocClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            if (target.tagName === 'A' && target.hasAttribute('data-file-key')) {
                e.preventDefault();

                const fileKey = target.getAttribute('data-file-key');
                // Optional for now - only set once a card passes it through. Without it
                // the backend falls back to the original upload bucket, which 404s once
                // the scan workflow has moved/deleted the object from there.
                const fileId = target.getAttribute('data-file-id') || undefined;

                if (fileKey) {
                    try {
                        logger.info('Downloading document via presigned URL', { fileKey, fileId });
                        await downloadS3FileOnSameTab(fileKey, fileId);
                        logger.info('Document download initiated successfully', { fileKey, fileId });
                    } catch (error) {
                        logger.error('Failed to download document', { error, fileKey, fileId });
                    }
                }
            }
        };

        document.addEventListener('click', handleDocClick);
        
        return () => {
            document.removeEventListener('click', handleDocClick);
        };
    }, []);
};
