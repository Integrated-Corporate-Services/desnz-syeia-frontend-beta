/**
 * Site Address Summary Card
 * Displays site address information
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const SiteAddressSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.SITE_ADDRESS}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.SITE_ADDRESS(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Site address same as occupier
    rows.push(createSummaryRow(CONSTANTS.SITE_ADDRESS_FIELDS.SAME_AS_OCCUPIER, formatBoolean(data.site_address_same)));

    // Site address
    if (data.site_address) {
        const addressHtml = data.site_address.split('\n').join('<br>');
        rows.push({
            key: { text: CONSTANTS.SITE_ADDRESS_FIELDS.SITE_ADDRESS },
            value: { text: '', html: addressHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.SITE_ADDRESS_FIELDS.SITE_ADDRESS, CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.SITE_ADDRESS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.SITE_ADDRESS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
