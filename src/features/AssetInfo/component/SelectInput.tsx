import React from 'react';

interface SelectInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({ id, name, label, value, error, onChange, options }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}> 
    <label className="govuk-label govuk-!-margin-top-3" htmlFor={id}>{label}</label>
    {error && (
      <span className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {error}
      </span>
    )}
    <select
      className={`govuk-select${error ? ' govuk-select--error' : ''}`}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default SelectInput;
