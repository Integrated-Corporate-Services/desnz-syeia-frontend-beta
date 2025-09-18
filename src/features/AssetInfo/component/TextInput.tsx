import React from 'react';

interface TextInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  widthClass?: string;
}

const TextInput: React.FC<TextInputProps> = ({ id, name, label, value, error, onChange, widthClass }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <label className="govuk-label" htmlFor={id}>{label}</label>
    {error && (
      <span className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {error}
      </span>
    )}
    <input
      className={`govuk-input${widthClass ? ' ' + widthClass : ''}${error ? ' govuk-input--error' : ''}`}
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={onChange}
    />
  </div>
);

export default TextInput;