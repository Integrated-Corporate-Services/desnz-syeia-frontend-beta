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
        <dt className="govuk-summary-list__key">{LABELS.APPLICANT_NAME}</dt>
        <dd className="govuk-summary-list__value">
          {contactDetails.applicantName}
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{LABELS.CONTACT_NAME}</dt>
        <dd className="govuk-summary-list__value">
          {contactDetails.contactName}
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{LABELS.ADDRESS}</dt>
        <dd className="govuk-summary-list__value">
          {contactDetails.address.line1 && <div>{contactDetails.address.line1}</div>}
          {contactDetails.address.line2 && <div>{contactDetails.address.line2}</div>}
          {contactDetails.address.city && <div>{contactDetails.address.city}</div>}
          {contactDetails.address.country && <div>{contactDetails.address.country}</div>}
          {contactDetails.address.postcode && <div>{contactDetails.address.postcode}</div>}
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{LABELS.EMAIL}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.email}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{LABELS.PHONE}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.phone}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Additional contacts</dt>
        <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>
          {additionalContacts ? additionalContacts.split(',').filter(Boolean).map(email => <div key={email}>{email.trim()}</div>) : 'None added'}
        </dd>
        {changeUrl && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${changeUrl}#emailAddress`}>Change<span className="govuk-visually-hidden"> additional contacts</span></Link></dd>}
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Applicant's reference</dt>
        <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{reference || 'Not provided'}</dd>
        {changeUrl && <dd className="govuk-summary-list__actions"><Link className="govuk-link" to={`${changeUrl}#networkOperatorRef`}>Change<span className="govuk-visually-hidden"> applicant's reference</span></Link></dd>}
      </div>
    </dl>
  );
}
