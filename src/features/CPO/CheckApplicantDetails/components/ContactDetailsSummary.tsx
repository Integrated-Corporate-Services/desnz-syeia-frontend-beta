import React from "react";
import { Link } from 'react-router-dom';
import { ContactDetails } from "../utils/contactDetailsFormatter";
import { LABELS } from "../constants/contactDetailsConstants";

interface ContactDetailsSummaryProps {
  contactDetails: ContactDetails;
  additionalContacts?: string;
  reference?: string;
  changeUrl?: string;
}

/**
 * Summary list component displaying contact details
 * Shows DNO organization name and team coordinator information
 *
 * Uses the standard GOV.UK summary-list width utility (width-one-third on
 * the key cell) so every label is separated from its value with consistent,
 * proper spacing. The value cell takes the remaining width so contact details
 * such as email addresses and addresses do not wrap unnecessarily, while
 * leaving room for the optional "Change" actions cell so row separator lines
 * extend across the full row width. This replaces the previous inline
 * `whiteSpace: 'nowrap' + paddingRight` style which caused the value to run
 * straight into its label (e.g. "Applicant contact nameHannah Martin-NG-TC").
 */
export function ContactDetailsSummary({
  contactDetails,
  additionalContacts,
  reference,
  changeUrl,
}: ContactDetailsSummaryProps) {
  return (
    <dl className="govuk-summary-list">
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">{LABELS.APPLICANT_NAME}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.applicantName}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">{LABELS.CONTACT_NAME}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.contactName}</dd>
        {changeUrl && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${changeUrl}#contactName`}>Change<span className="govuk-visually-hidden"> contact name</span></Link></dd>}
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">{LABELS.ADDRESS}</dt>
        <dd className="govuk-summary-list__value">
          {contactDetails.address.line1 && <div>{contactDetails.address.line1}</div>}
          {contactDetails.address.line2 && <div>{contactDetails.address.line2}</div>}
          {contactDetails.address.city && <div>{contactDetails.address.city}</div>}
          {contactDetails.address.country && <div>{contactDetails.address.country}</div>}
          {contactDetails.address.postcode && <div>{contactDetails.address.postcode}</div>}
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">{LABELS.EMAIL}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.email}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">{LABELS.PHONE}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.phone}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">Additional contacts</dt>
        <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>
          {additionalContacts ? additionalContacts.split(',').filter(Boolean).map(email => <div key={email}>{email.trim()}</div>) : 'None added'}
        </dd>
        {changeUrl && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${changeUrl}#emailAddress`}>Change<span className="govuk-visually-hidden"> additional contacts</span></Link></dd>}
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-third">Applicant's reference</dt>
        <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{reference || 'Not provided'}</dd>
        {changeUrl && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${changeUrl}#networkOperatorRef`}>Change<span className="govuk-visually-hidden"> applicant's reference</span></Link></dd>}
      </div>
    </dl>
  );
}
