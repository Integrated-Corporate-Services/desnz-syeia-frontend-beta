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

    // Has representative (always Yes if showing)
    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.HAS_REPRESENTATIVE, formatBoolean(data.has_representative)));

    // Name
    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.NAME, data.name || CONSTANTS.DEFAULTS.NOT_PROVIDED));

    // Organisation
    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.ORGANISATION, data.organisation || CONSTANTS.DEFAULTS.DASH));

    // Email
    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.EMAIL, formatEmail(data.email)));

    // Phone
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
