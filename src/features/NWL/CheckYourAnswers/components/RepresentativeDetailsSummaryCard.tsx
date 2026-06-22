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
    if (!data) {
        return null;
    }

    const rows: SummaryRow[] = [];

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.HAS_REPRESENTATIVE, formatBoolean(data.objector_has_representative)));

    if (!data.objector_has_representative) {
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
    }

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.NAME, data.representative_name || CONSTANTS.DEFAULTS.EMPTY));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.ORGANISATION, data.representative_organisation || CONSTANTS.DEFAULTS.EMPTY));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.EMAIL, formatEmail(data.representative_email)));

    rows.push(createSummaryRow(CONSTANTS.REPRESENTATIVE_FIELDS.PHONE, formatPhone(data.representative_phone)));

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