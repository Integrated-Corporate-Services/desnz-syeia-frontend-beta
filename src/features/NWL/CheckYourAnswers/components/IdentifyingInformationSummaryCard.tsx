import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

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
                                  text: CONSTANTS.ACTIONS.ADD,
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
        const photosHtml = data.site_photos.join('<br>');
        rows.push({
            key: { text: CONSTANTS.IDENTIFYING_INFO_FIELDS.SITE_PHOTOGRAPHS },
            value: { text: '', html: photosHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.IDENTIFYING_INFO_FIELDS.SITE_PHOTOGRAPHS, CONSTANTS.DEFAULTS.EMPTY));
    }

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
