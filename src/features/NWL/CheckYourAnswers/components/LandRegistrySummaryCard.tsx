import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('LandRegistrySummaryCard');

interface Props {
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const LandRegistrySummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.LAND_REGISTRY}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.LAND_REGISTRY(applicationId),
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    rows.push(createSummaryRow(CONSTANTS.LAND_REGISTRY_FIELDS.IS_REGISTERED, formatBoolean(data.is_registered)));


    if (data.is_registered) {
        rows.push(createSummaryRow(CONSTANTS.LAND_REGISTRY_FIELDS.REGISTRY_REF, data.land_registry_ref || CONSTANTS.DEFAULTS.EMPTY));

        if (data.land_registry_reference_document) {
            const doc = data.land_registry_reference_document;
            const fileKey = doc.fileUrl || doc.file_id;
            const downloadUrl = `/backend/api/file/download?key=${encodeURIComponent(fileKey)}`;
            rows.push({
                key: { text: CONSTANTS.LAND_REGISTRY_FIELDS.REGISTRY_DOC },
                value: {
                    text: '',
                    html: `<a href="${downloadUrl}" class="govuk-link" data-file-key="${fileKey}" data-filename="${doc.filename}">${doc.filename}</a>`,
                },
            });
        } else {
            rows.push(createSummaryRow(CONSTANTS.LAND_REGISTRY_FIELDS.REGISTRY_DOC, CONSTANTS.DEFAULTS.EMPTY));
        }
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.LAND_REGISTRY}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.LAND_REGISTRY(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
