/**
 * Applicant Details Summary Card
 * Displays applicant organization and contact information
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

export const ApplicantDetailsSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.APPLICANT_DETAILS}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.APPLICANT_DETAILS(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Applicant name
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.APPLICANT_NAME, data.applicant_name || CONSTANTS.DEFAULTS.NOT_PROVIDED));

    // Applicant contact name
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.CONTACT_NAME, data.applicant_contact_name || CONSTANTS.DEFAULTS.NOT_PROVIDED));

    // Address
    const addressParts = [data.address_line1, data.address_line2, data.postcode].filter((part) => part && part !== '-');
    const addressHtml = addressParts.length > 0 ? addressParts.join('<br>') : CONSTANTS.DEFAULTS.NOT_PROVIDED;
    rows.push({
        key: { text: CONSTANTS.APPLICANT_FIELDS.ADDRESS },
        value: { text: '', html: addressHtml },
    });

    // Email
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.EMAIL, formatEmail(data.email)));

    // Phone
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.PHONE, formatPhone(data.phone)));

    // Additional contacts
    if (data.additional_contacts && data.additional_contacts.length > 0) {
        const contactsHtml = data.additional_contacts.join('<br>');
        rows.push({
            key: { text: CONSTANTS.APPLICANT_FIELDS.ADDITIONAL_CONTACTS },
            value: { text: '', html: contactsHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.ADDITIONAL_CONTACTS, CONSTANTS.DEFAULTS.NONE));
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.APPLICANT_DETAILS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.APPLICANT_DETAILS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
