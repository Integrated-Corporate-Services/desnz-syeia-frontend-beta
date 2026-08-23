import { useEffect } from 'react';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('useDocumentDownload');

export const useDocumentDownload = (applicationId?: string) => {
    useEffect(() => {
        const handleDocClick = async (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a[data-file-key]') as HTMLElement | null;

            if (target) {
                e.preventDefault();

                const fileKey = target.getAttribute('data-file-key');
                const fileId = target.getAttribute('data-file-id') || undefined;
                const documentId = target.getAttribute('data-document-id') || undefined;

                if (fileKey) {
                    try {
                        logger.info('Downloading document', { fileKey, fileId, documentId });
                        await downloadS3FileOnSameTab(fileKey, fileId, applicationId, documentId);
                        logger.info('Document download initiated successfully', { fileKey, fileId, documentId });
                    } catch (error) {
                        logger.error('Failed to download document', { error, fileKey, fileId, documentId });
                    }
                }
            }
        };

        document.addEventListener('click', handleDocClick);

        return () => {
            document.removeEventListener('click', handleDocClick);
        };
    }, [applicationId]);
};
