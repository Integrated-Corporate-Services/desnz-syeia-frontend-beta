import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('IdentifyingInformationSummaryCard');

interface Props {
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const IdentifyingInformationSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.IDENTIFYING_INFORMATION}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.IDENTIFYING_INFORMATION(applicationId),
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    rows.push(createSummaryRow(CONSTANTS.IDENTIFYING_INFO_FIELDS.IDENTIFY_THE_LAND, data.land_identification || CONSTANTS.DEFAULTS.EMPTY));

    rows.push(createSummaryRow(CONSTANTS.IDENTIFYING_INFO_FIELDS.VISIBLE_FROM_PUBLIC_ROAD, formatBoolean(data.visible_from_road)));

    if (data.site_photos && data.site_photos.length > 0) {
        const photosHtml = data.site_photos
            .map((photo: any) => {
                const fileKey = photo.fileUrl || photo.file_id;
                return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${photo.filename}">${photo.filename}</a>`;
            })
            .join('<br>');
        rows.push({
            key: { text: CONSTANTS.IDENTIFYING_INFO_FIELDS.SITE_PHOTOGRAPHS },
            value: { text: '', html: photosHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.IDENTIFYING_INFO_FIELDS.SITE_PHOTOGRAPHS, CONSTANTS.DEFAULTS.EMPTY));
    }

    React.useEffect(() => {
        const handlePhotoClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.hasAttribute('data-file-key')) {
                e.preventDefault();
                const fileKey = target.getAttribute('data-file-key');
                if (fileKey) {
                    try {
                        await downloadS3FileOnSameTab(fileKey);
                    } catch (error) {
                        logger.error('Failed to download site photo', { error, fileKey });
                    }
                }
            }
        };

        document.addEventListener('click', handlePhotoClick);
        return () => document.removeEventListener('click', handlePhotoClick);
    }, []);

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.IDENTIFYING_INFORMATION}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.IDENTIFYING_INFORMATION(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
