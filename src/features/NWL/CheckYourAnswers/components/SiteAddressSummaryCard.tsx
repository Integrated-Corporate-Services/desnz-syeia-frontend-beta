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

    rows.push(createSummaryRow(CONSTANTS.SITE_ADDRESS_FIELDS.SAME_AS_OCCUPIER, formatBoolean(data.site_address_same)));

    if (data.site_address) {
        const addr = data.site_address;
        let addressHtml: string;
        if (typeof addr === 'string') {
            addressHtml = addr.split('\n').join('<br>');
        } else {
            const parts = [addr.line1, addr.line2, addr.town_city, addr.county, addr.postcode]
                .filter((p: string) => p && p.trim() !== '');
            addressHtml = parts.join('<br>');
        }
        rows.push({
            key: { text: CONSTANTS.SITE_ADDRESS_FIELDS.SITE_ADDRESS },
            value: { text: '', html: addressHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.SITE_ADDRESS_FIELDS.SITE_ADDRESS, CONSTANTS.DEFAULTS.EMPTY));
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