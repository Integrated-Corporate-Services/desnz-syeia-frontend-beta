import React from 'react';
import { FORM_LABELS, TITLE_OPTIONS, VALIDATION_LIMITS } from '../constants/objectorDetailsConstants';
import type { FormErrors } from '../types';
import AccessibleSelect from '../../../../components/commonFormFields/AccessibleSelect';

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
      <div className={`govuk-form-group ${errors.title ? 'govuk-form-group--error' : ''}`}>
        <label className="govuk-label" htmlFor="title">
          {FORM_LABELS.TITLE}
        </label>
        {errors.title && (
          <p id="title-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{' '}
            {errors.title}
          </p>
        )}
        <AccessibleSelect
          id="title"
          value={title}
          options={TITLE_OPTIONS}
          onChange={onTitleChange}
          error={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
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
          maxLength={VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH}
          onChange={(e) => onFullNameChange(e.target.value)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
      </div>

      <div
        className={`govuk-form-group ${
          errors.organisation ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="organisation">
          {FORM_LABELS.ORGANISATION}
        </label>
        {errors.organisation && (
          <p id="organisation-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{' '}
            {errors.organisation}
          </p>
        )}
        <input
          className={`govuk-input ${
            errors.organisation ? 'govuk-input--error' : ''
          }`}
          id="organisation"
          name="organisation"
          type="text"
          value={organisation}
          maxLength={VALIDATION_LIMITS.ORGANISATION_MAX_LENGTH}
          onChange={(e) => onOrganisationChange(e.target.value)}
          aria-describedby={errors.organisation ? 'organisation-error' : undefined}
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

      <div
        className={`govuk-form-group ${
          errors.phone ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="phone">
          {FORM_LABELS.PHONE}
        </label>
        {errors.phone && (
          <p id="phone-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.phone}
          </p>
        )}
        <input
          className={`govuk-input ${
            errors.phone ? 'govuk-input--error' : ''
          }`}
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
      </div>
    </>
  );
};
