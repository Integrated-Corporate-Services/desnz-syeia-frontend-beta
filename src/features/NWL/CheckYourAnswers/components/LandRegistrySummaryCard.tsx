import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean, buildDocumentLinkHtml } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

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
            rows.push({
                key: { text: CONSTANTS.LAND_REGISTRY_FIELDS.REGISTRY_DOC },
                value: {
                    text: '',
                    html: buildDocumentLinkHtml(doc),
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
