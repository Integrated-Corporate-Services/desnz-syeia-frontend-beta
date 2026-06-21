import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('NewLineDetailsCard');

interface Props {
    data: any;
    applicationId: string;
    canEdit: boolean;
}

const NewLineDetailsCard: React.FC<Props> = ({ data, applicationId, canEdit }) => {
    const rows: SummaryRow[] = [];
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE, data.application_type || CONSTANTS.DEFAULTS.EMPTY));
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.OFFER_DATE, formatDate(data.wayleave_offer_date)));
    
    if (data.wayleave_offer_documents && data.wayleave_offer_documents.length > 0) {
        const docLinks = data.wayleave_offer_documents.map((doc: any) => {
            const fileKey = doc.fileUrl || doc.file_id;
            return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${doc.filename}">${doc.filename}</a>`;
        }).join('<br>');
        rows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.WAYLEAVE_OFFER_DOCUMENTS },
            value: { text: '', html: docLinks },
        });
    }

    React.useEffect(() => {
        const handleDocClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.hasAttribute('data-file-key')) {
                e.preventDefault();
                const fileKey = target.getAttribute('data-file-key');
                if (fileKey) {
                    try {
                        await downloadS3FileOnSameTab(fileKey);
                    } catch (error) {
                        logger.error('Failed to download document', { error, fileKey });
                    }
                }
            }
        };

        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.APPLICATION_DETAILS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.APPLICATION_DETAILS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};

export default NewLineDetailsCard;