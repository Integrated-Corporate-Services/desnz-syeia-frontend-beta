// src/components/ContactDetailsConfirmationRadio.tsx
import React from 'react';
import { CONTENT } from '../../../constants/content';

type Props = {
  value: string;
  onChange: (val: string) => void;
};

const ContactDetailsConfirmationRadio: React.FC<Props> = ({ value, onChange }) => (
  <div className="govuk-form-group">
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
        <h2 className="govuk-fieldset__heading">
          {CONTENT.networkOperatorContact.confirmation.legend}
        </h2>
      </legend>
      <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios" data-govuk-radios-init="">
        <div className="govuk-radios__item">
          <input
            className="govuk-radios__input"
            id="contactDetailsConfirmed"
            name="contactDetailsConfirmed"
            type="radio"
            value="true"
            checked={value === 'true'}
            onChange={() => onChange('true')}
          />
          <label className="govuk-label govuk-radios__label" htmlFor="contactDetailsConfirmed">
            {CONTENT.networkOperatorContact.confirmation.yes}
          </label>
        </div>
        <div className="govuk-radios__item">
          <input
            className="govuk-radios__input"
            id="contactDetailsConfirmed-no"
            name="contactDetailsConfirmed"
            type="radio"
            value="false"
            checked={value === 'false'}
            onChange={() => onChange('false')}
          />
          <label className="govuk-label govuk-radios__label" htmlFor="contactDetailsConfirmed-no">
            {CONTENT.networkOperatorContact.confirmation.no}
          </label>
        </div>
        {value === 'false' && (
          <div className="govuk-radios__conditional" id="contactDetailsConfirmed-no-hidden">
            <p className="govuk-body">{CONTENT.networkOperatorContact.confirmation.noDetails1}</p>
            <p className="govuk-body">{CONTENT.networkOperatorContact.confirmation.noDetails2}</p>
          </div>
        )}
      </div>
    </fieldset>
  </div>
);

export default ContactDetailsConfirmationRadio;