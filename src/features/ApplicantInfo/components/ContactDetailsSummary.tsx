import React from "react";
import { ContactDetails } from "../utils/contactDetailsFormatter";
import { LABELS } from "../constants/contactDetailsConstants";

interface ContactDetailsSummaryProps {
  contactDetails: ContactDetails;
}

/**
 * Summary list component displaying contact details
 * Shows DNO organization name and team coordinator information
 */
export function ContactDetailsSummary({
  contactDetails,
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
        <dd
          className="govuk-summary-list__value"
          dangerouslySetInnerHTML={{ __html: contactDetails.address }}
        />
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{LABELS.EMAIL}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.email}</dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">{LABELS.PHONE}</dt>
        <dd className="govuk-summary-list__value">{contactDetails.phone}</dd>
      </div>
    </dl>
  );
}
