/**
 * Occupier Details Summary Card
 * Displays occupier contact information
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatEmail, formatPhone } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const OccupierDetailsSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.OCCUPIER_DETAILS}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.OCCUPIER_DETAILS(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Title
    rows.push(createSummaryRow(CONSTANTS.OCCUPIER_FIELDS.TITLE, data.title || CONSTANTS.DEFAULTS.EMPTY));

    // Name
    rows.push(createSummaryRow(CONSTANTS.OCCUPIER_FIELDS.NAME, data.name || CONSTANTS.DEFAULTS.EMPTY));

    // Organisation
    rows.push(createSummaryRow(CONSTANTS.OCCUPIER_FIELDS.ORGANISATION, data.organisation || CONSTANTS.DEFAULTS.EMPTY));

    // Address
    const addressParts = [data.address_line1, data.address_line2, data.postcode].filter((part) => part && part !== '-');
    const addressHtml = addressParts.length > 0 ? addressParts.join('<br>') : CONSTANTS.DEFAULTS.EMPTY;
    rows.push({
        key: { text: CONSTANTS.OCCUPIER_FIELDS.ADDRESS },
        value: { text: '', html: addressHtml },
    });

    // Email
    rows.push(createSummaryRow(CONSTANTS.OCCUPIER_FIELDS.EMAIL, formatEmail(data.email)));

    // Phone
    rows.push(createSummaryRow(CONSTANTS.OCCUPIER_FIELDS.PHONE, formatPhone(data.phone)));

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.OCCUPIER_DETAILS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.OCCUPIER_DETAILS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};