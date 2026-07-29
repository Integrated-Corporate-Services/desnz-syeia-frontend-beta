/**
 * Land Location Summary Card
 * Displays land registration and location details
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean, buildDocumentLinkHtml } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const LandLocationSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.LAND_LOCATION}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.LAND_LOCATION(applicationId),
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Land location (country)
    rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.COUNTRY, data.country || CONSTANTS.DEFAULTS.EMPTY));

    // Registered with Land Registry
    rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.IS_REGISTERED, formatBoolean(data.is_registered)));

    // If registered - show details
    if (data.is_registered) {
        rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.REGISTRY_REF, data.land_registry_ref || CONSTANTS.DEFAULTS.EMPTY));

        if (data.land_registry_reference_document) {
            const doc = data.land_registry_reference_document;
            // Handle both object format and string format for backwards compatibility
            if (typeof doc === 'object' && doc.filename) {
                const docHtml = buildDocumentLinkHtml(doc);
                rows.push({
                    key: { text: CONSTANTS.LAND_LOCATION_FIELDS.REGISTRY_DOC },
                    value: { text: '', html: docHtml },
                });
            } else {
                // String fallback (old format)
                rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.REGISTRY_DOC, String(doc)));
            }
        } else {
            rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.REGISTRY_DOC, CONSTANTS.DEFAULTS.EMPTY));
        }
    }

    // OS Grid Reference
    rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.OS_GRID_REF, data.os_grid_ref || CONSTANTS.DEFAULTS.EMPTY));

    // Land identification
    rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.LAND_IDENTIFICATION, data.land_identification || CONSTANTS.DEFAULTS.EMPTY));

    // Visible from public road
    rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.VISIBLE_FROM_ROAD, formatBoolean(data.visible_from_road)));

    // Site photographs
    if (data.site_identification_photographs && data.site_identification_photographs.length > 0) {
        const photosHtml = data.site_identification_photographs.join('<br>');
        rows.push({
            key: { text: CONSTANTS.LAND_LOCATION_FIELDS.SITE_PHOTOS },
            value: { text: '', html: photosHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.LAND_LOCATION_FIELDS.SITE_PHOTOS, CONSTANTS.DEFAULTS.EMPTY));
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.LAND_LOCATION}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.LAND_LOCATION(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};