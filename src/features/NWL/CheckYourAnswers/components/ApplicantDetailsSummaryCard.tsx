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
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Applicant name
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.APPLICANT_NAME, data.applicant_name || CONSTANTS.DEFAULTS.EMPTY));

    // Applicant contact name
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.CONTACT_NAME, data.applicant_contact_name || CONSTANTS.DEFAULTS.EMPTY));

    // Address
    const addressParts = [data.address_line1, data.address_line2, data.postcode].filter((part) => part && part !== '-');
    const addressHtml = addressParts.length > 0 ? addressParts.join('<br>') : CONSTANTS.DEFAULTS.EMPTY;
    rows.push({
        key: { text: CONSTANTS.APPLICANT_FIELDS.ADDRESS },
        value: { text: '', html: addressHtml },
    });

    // Email
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.EMAIL, formatEmail(data.email) || CONSTANTS.DEFAULTS.EMPTY));

    // Phone
    rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.PHONE, formatPhone(data.phone) || CONSTANTS.DEFAULTS.EMPTY));

    // Additional contacts (supports both legacy and current payload shapes)
    const additionalContacts = Array.isArray(data.additional_contacts)
        ? data.additional_contacts
        : typeof data.additional_contacts === 'string'
            ? data.additional_contacts
                .split(',')
                .map((contact: string) => contact.trim())
                .filter((contact: string) => contact.length > 0)
            : typeof data.additional_contact === 'string'
                ? data.additional_contact
                    .split(',')
                    .map((contact: string) => contact.trim())
                    .filter((contact: string) => contact.length > 0)
                : [];

    if (additionalContacts.length > 0) {
        const contactsHtml = additionalContacts.join('<br>');
        rows.push({
            key: { text: CONSTANTS.APPLICANT_FIELDS.ADDITIONAL_CONTACTS },
            value: { text: '', html: contactsHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.APPLICANT_FIELDS.ADDITIONAL_CONTACTS, CONSTANTS.DEFAULTS.EMPTY));
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