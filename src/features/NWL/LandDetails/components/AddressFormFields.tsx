import React from 'react';
import { LAND_DETAILS_LABELS } from '../constants';

type AddressFormFieldsProps = {
  addressLine1: string;
  addressLine2: string;
  town: string;
  county: string;
  postcode: string;
  onChange: (field: string, value: string) => void;
  errors: { [key: string]: string };
};

const AddressFormFields: React.FC<AddressFormFieldsProps> = ({
  addressLine1,
  addressLine2,
  town,
  county,
  postcode,
  onChange,
  errors,
}) => {
  const labels = LAND_DETAILS_LABELS.SITE_ADDRESS;

  return (
    <>
      <div className={`govuk-form-group${errors.addressLine1 ? ' govuk-form-group--error' : ''}`}>
        <label className="govuk-label" htmlFor="address-line-1">
          {labels.ADDRESS_LINE1}
        </label>
        {errors.addressLine1 && (
          <p id="address-line-1-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.addressLine1}
          </p>
        )}
        <input
          className={`govuk-input${errors.addressLine1 ? ' govuk-input--error' : ''}`}
          id="address-line-1"
          name="addressLine1"
          type="text"
          value={addressLine1}
          onChange={(e) => onChange('addressLine1', e.target.value)}
          aria-describedby={errors.addressLine1 ? 'address-line-1-error' : undefined}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="address-line-2">
          {labels.ADDRESS_LINE2}
        </label>
        <input
          className="govuk-input"
          id="address-line-2"
          name="addressLine2"
          type="text"
          value={addressLine2}
          onChange={(e) => onChange('addressLine2', e.target.value)}
        />
      </div>

      <div className={`govuk-form-group${errors.town ? ' govuk-form-group--error' : ''}`}>
        <label className="govuk-label" htmlFor="town">
          {labels.TOWN}
        </label>
        {errors.town && (
          <p id="town-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.town}
          </p>
        )}
        <input
          className={`govuk-input${errors.town ? ' govuk-input--error' : ''}`}
          id="town"
          name="town"
          type="text"
          value={town}
          onChange={(e) => onChange('town', e.target.value)}
          aria-describedby={errors.town ? 'town-error' : undefined}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="county">
          {labels.COUNTY}
        </label>
        <input
          className="govuk-input"
          id="county"
          name="county"
          type="text"
          value={county}
          onChange={(e) => onChange('county', e.target.value)}
        />
      </div>

      <div className={`govuk-form-group${errors.postcode ? ' govuk-form-group--error' : ''}`}>
        <label className="govuk-label" htmlFor="postcode">
          {labels.POSTCODE}
        </label>
        {errors.postcode && (
          <p id="postcode-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.postcode}
          </p>
        )}
        <input
          className={`govuk-input govuk-input--width-10${errors.postcode ? ' govuk-input--error' : ''}`}
          id="postcode"
          name="postcode"
          type="text"
          value={postcode}
          onChange={(e) => onChange('postcode', e.target.value)}
          aria-describedby={errors.postcode ? 'postcode-error' : undefined}
        />
      </div>
    </>
  );
};

export default AddressFormFields;
