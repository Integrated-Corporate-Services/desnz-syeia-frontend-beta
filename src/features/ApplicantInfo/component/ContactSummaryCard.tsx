import React from 'react';
import { CONTENT } from '../../../constants/content';

type Party = {
  organisation_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  postcode?: string;
  email?: string;
  phone?: string;
};

const ContactSummaryCard: React.FC<{ party?: Party }> = ({ party }) => (
  <div className="govuk-summary-card" id="contact-details-summary">
    <div className="govuk-summary-card__content">
      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">{CONTENT.networkOperatorContact.summary.name}</dt>
          <dd className="govuk-summary-list__value">{party?.organisation_name || ''}</dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">{CONTENT.networkOperatorContact.summary.address}</dt>
          <dd className="govuk-summary-list__value">
            {[party?.line1, party?.line2, party?.city, party?.country, party?.postcode].filter(Boolean).join(', ')}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">{CONTENT.networkOperatorContact.summary.email}</dt>
          <dd className="govuk-summary-list__value">
            {party?.email ? (
              <a href={`mailto:${party.email}`} className="govuk-link">{party.email}</a>
            ) : ''}
          </dd>
        </div>
        <div className="govuk-summary-list__row govuk-summary-list__row--no-actions">
          <dt className="govuk-summary-list__key">{CONTENT.networkOperatorContact.summary.phone}</dt>
          <dd className="govuk-summary-list__value">{party?.phone || ''}</dd>
        </div>
      </dl>
    </div>
  </div>
);

export default ContactSummaryCard;