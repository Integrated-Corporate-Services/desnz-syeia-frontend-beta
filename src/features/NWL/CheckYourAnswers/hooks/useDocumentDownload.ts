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
                
                if (fileKey) {
                    try {
                        logger.info('Downloading document via presigned URL', { fileKey });
                        await downloadS3FileOnSameTab(fileKey);
                        logger.info('Document download initiated successfully', { fileKey });
                    } catch (error) {
                        logger.error('Failed to download document', { error, fileKey });
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
