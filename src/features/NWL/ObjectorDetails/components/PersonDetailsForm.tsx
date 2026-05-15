import React from 'react';
import { FORM_LABELS, TITLE_OPTIONS } from '../constants/objectorDetailsConstants';
import type { FormErrors } from '../types';

interface PersonDetailsFormProps {
  title: string;
  fullName: string;
  organisation: string;
  email: string;
  phone: string;
  errors: FormErrors;
  onTitleChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onOrganisationChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export const PersonDetailsForm: React.FC<PersonDetailsFormProps> = ({
  title,
  fullName,
  organisation,
  email,
  phone,
  errors,
  onTitleChange,
  onFullNameChange,
  onOrganisationChange,
  onEmailChange,
  onPhoneChange,
}) => {
  return (
    <>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="title">
          {FORM_LABELS.TITLE}
        </label>
        <select
          className="govuk-select"
          id="title"
          name="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        >
          {TITLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`govuk-form-group ${
          errors.fullName ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="fullName">
          {FORM_LABELS.FULL_NAME}
        </label>
        {errors.fullName && (
          <p id="fullName-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{' '}
            {errors.fullName}
          </p>
        )}
        <input
          className={`govuk-input ${
            errors.fullName ? 'govuk-input--error' : ''
          }`}
          id="fullName"
          name="fullName"
          type="text"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="organisation">
          {FORM_LABELS.ORGANISATION}
        </label>
        <input
          className="govuk-input"
          id="organisation"
          name="organisation"
          type="text"
          value={organisation}
          onChange={(e) => onOrganisationChange(e.target.value)}
        />
      </div>

      <div
        className={`govuk-form-group ${
          errors.email ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="email">
          {FORM_LABELS.EMAIL}
        </label>
        {errors.email && (
          <p id="email-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.email}
          </p>
        )}
        <input
          className={`govuk-input ${errors.email ? 'govuk-input--error' : ''}`}
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="phone">
          {FORM_LABELS.PHONE}
        </label>
        <input
          className="govuk-input"
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </div>
    </>
  );
};
