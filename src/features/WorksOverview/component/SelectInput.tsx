
import React from 'react';
import { CommonInputProps } from '../../../types/form';
import AccessibleSelect from '../../../components/commonFormFields/AccessibleSelect';

const SelectInput: React.FC<CommonInputProps> = ({ id, name, label, value, error, onChange, options = [] }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <label className="govuk-label govuk-!-margin-top-3" htmlFor={id}>{label}</label>
    {error && (
      <span className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {error}
      </span>
    )}
    <AccessibleSelect
      id={id}
      value={value}
      error={Boolean(error)}
      options={options.map((opt) => ({ value: opt.value, text: opt.label }))}
      onChange={(newValue) => onChange({ target: { name, value: newValue } } as React.ChangeEvent<any>)}
    />
  </div>
);

export default SelectInput;
