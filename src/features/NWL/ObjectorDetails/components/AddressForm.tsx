import React from 'react';
import { FORM_LABELS } from '../constants/objectorDetailsConstants';
import type { FormErrors } from '../types';

interface AddressFormProps {
  addressLine1: string;
  addressLine2: string;
  town: string;
  county: string;
  postcode: string;
  errors: FormErrors;
  onAddressLine1Change: (value: string) => void;
  onAddressLine2Change: (value: string) => void;
  onTownChange: (value: string) => void;
  onCountyChange: (value: string) => void;
  onPostcodeChange: (value: string) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  addressLine1,
  addressLine2,
  town,
  county,
  postcode,
  errors,
  onAddressLine1Change,
  onAddressLine2Change,
  onTownChange,
  onCountyChange,
  onPostcodeChange,
}) => {
  return (
    <>
      <div
        className={`govuk-form-group ${
          errors.addressLine1 ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="addressLine1">
          {FORM_LABELS.ADDRESS_LINE1}
        </label>
        {errors.addressLine1 && (
          <p id="addressLine1-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{' '}
            {errors.addressLine1}
          </p>
        )}
        <input
          className={`govuk-input ${
            errors.addressLine1 ? 'govuk-input--error' : ''
          }`}
          id="addressLine1"
          name="addressLine1"
          type="text"
          value={addressLine1}
          onChange={(e) => onAddressLine1Change(e.target.value)}
          aria-describedby={errors.addressLine1 ? 'addressLine1-error' : undefined}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="addressLine2">
          {FORM_LABELS.ADDRESS_LINE2}
        </label>
        <input
          className="govuk-input"
          id="addressLine2"
          name="addressLine2"
          type="text"
          value={addressLine2}
          onChange={(e) => onAddressLine2Change(e.target.value)}
        />
      </div>

      <div
        className={`govuk-form-group ${
          errors.town ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="town">
          {FORM_LABELS.TOWN}
        </label>
        {errors.town && (
          <p id="town-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.town}
          </p>
        )}
        <input
          className={`govuk-input ${errors.town ? 'govuk-input--error' : ''}`}
          id="town"
          name="town"
          type="text"
          value={town}
          onChange={(e) => onTownChange(e.target.value)}
          aria-describedby={errors.town ? 'town-error' : undefined}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="county">
          {FORM_LABELS.COUNTY}
        </label>
        <input
          className="govuk-input"
          id="county"
          name="county"
          type="text"
          value={county}
          onChange={(e) => onCountyChange(e.target.value)}
        />
      </div>

      <div
        className={`govuk-form-group ${
          errors.postcode ? 'govuk-form-group--error' : ''
        }`}
      >
        <label className="govuk-label" htmlFor="postcode">
          {FORM_LABELS.POSTCODE}
        </label>
        {errors.postcode && (
          <p id="postcode-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{' '}
            {errors.postcode}
          </p>
        )}
        <input
          className={`govuk-input govuk-input--width-10 ${
            errors.postcode ? 'govuk-input--error' : ''
          }`}
          id="postcode"
          name="postcode"
          type="text"
          value={postcode}
          onChange={(e) => onPostcodeChange(e.target.value)}
          aria-describedby={errors.postcode ? 'postcode-error' : undefined}
        />
      </div>
    </>
  );
};
