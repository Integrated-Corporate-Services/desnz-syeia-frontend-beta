import React from "react";
import { LABELS, CONDITIONAL_TEXT } from "../constants/contactDetailsConstants";
import RevealAnnouncement from "../../../../components/commonFormFields/RevealAnnouncement";

interface ContactConfirmationRadiosProps {
  contactIsConfirmed: true | false | null;
  setContactIsConfirmed: (value: true | false) => void;
  setError: (error: string) => void;
}

/**
 * Radio buttons component for contact details confirmation
 * Shows conditional text when user selects "No"
 */
export function ContactConfirmationRadios({
  contactIsConfirmed,
  setContactIsConfirmed,
  setError,
}: ContactConfirmationRadiosProps) {
  return (
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          {LABELS.CONFIRMATION_QUESTION}
        </legend>
        <div className="govuk-radios" data-module="govuk-radios">
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="contactIsConfirmed-yes"
              name="contactIsConfirmed"
              type="radio"
              checked={contactIsConfirmed === true}
              onChange={() => {
                setContactIsConfirmed(true);
                setError("");
              }}
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="contactIsConfirmed-yes"
            >
              {LABELS.YES}
            </label>
          </div>
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="contactIsConfirmed-no"
              name="contactIsConfirmed"
              type="radio"
              checked={contactIsConfirmed === false}
              onChange={() => {
                setContactIsConfirmed(false);
                setError("");
              }}
              aria-controls="contactIsConfirmed-no-hidden"
              aria-expanded={contactIsConfirmed === false}
            />
            <label
              className="govuk-label govuk-radios__label"
              htmlFor="contactIsConfirmed-no"
            >
              {LABELS.NO}
            </label>
          </div>
          {contactIsConfirmed === false && (
            <div className="govuk-radios__conditional" id="contactIsConfirmed-no-hidden">
              <p className="govuk-body">
                {CONDITIONAL_TEXT.INCORRECT_DETAILS}
              </p>
            </div>
          )}
        </div>
        <RevealAnnouncement shown={contactIsConfirmed === false} message={CONDITIONAL_TEXT.INCORRECT_DETAILS} />
      </fieldset>
    </div>
  );
}
