/**
 * Representative Details Summary Card
 * Displays landowner representative information (conditional)
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatEmail, formatPhone, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const RepresentativeDetailsSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    // Only show if representative exists
    if (!data || !data.has_representative) {
        return null;
    }

    const rows: SummaryRow[] = [];

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.HAS_REPRESENTATIVE, formatBoolean(data.has_representative)));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.TITLE, data.title || CONSTANTS.DEFAULTS.EMPTY));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.NAME, data.name || CONSTANTS.DEFAULTS.EMPTY));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.ORGANISATION, data.organisation || CONSTANTS.DEFAULTS.EMPTY));

    const addressParts = [data.address_line1, data.address_line2, data.town_city, data.postcode].filter((part: string) => part && part !== '-');
    const addressHtml = addressParts.length > 0 ? addressParts.join('<br>') : CONSTANTS.DEFAULTS.EMPTY;
    rows.push({
        key: { text: CONSTANTS.REPRESENTATIVE_FIELDS.ADDRESS },
        value: { text: '', html: addressHtml },
    });

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.EMAIL, formatEmail(data.email)));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.PHONE, formatPhone(data.phone)));

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.REPRESENTATIVE_DETAILS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.REPRESENTATIVE_DETAILS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};