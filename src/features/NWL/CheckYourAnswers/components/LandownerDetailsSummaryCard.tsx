import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatEmail, formatPhone, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const LandownerDetailsSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.LANDOWNER_DETAILS}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.LANDOWNER_DETAILS(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Is objector also the landowner?
    rows.push(createSummaryRow(CONSTANTS.LANDOWNER_FIELDS.IS_ALSO_LANDOWNER, formatBoolean(data.is_objector_also_landowner)));

    // Only show individual fields if they are a separate landowner
    if (!data.is_objector_also_landowner) {
        rows.push(createSummaryRow(CONSTANTS.LANDOWNER_FIELDS.TITLE, data.title || CONSTANTS.DEFAULTS.EMPTY));
        rows.push(createSummaryRow(CONSTANTS.LANDOWNER_FIELDS.NAME, data.name || CONSTANTS.DEFAULTS.EMPTY));
        rows.push(createSummaryRow(CONSTANTS.LANDOWNER_FIELDS.ORGANISATION, data.organisation || CONSTANTS.DEFAULTS.EMPTY));
        const addressParts = [data.address_line1, data.address_line2, data.town_city, data.postcode].filter((part) => part && part !== '-');
        const addressHtml = addressParts.length > 0 ? addressParts.join('<br>') : CONSTANTS.DEFAULTS.EMPTY;
        rows.push({
            key: { text: CONSTANTS.LANDOWNER_FIELDS.ADDRESS },
            value: { text: '', html: addressHtml },
        });
        rows.push(createSummaryRow(CONSTANTS.LANDOWNER_FIELDS.EMAIL, formatEmail(data.email)));
        rows.push(createSummaryRow(CONSTANTS.LANDOWNER_FIELDS.PHONE, formatPhone(data.phone)));
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.LANDOWNER_DETAILS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.LANDOWNER_DETAILS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};