
import React from 'react';
import { CommonInputProps } from '../../../types/form';

interface NumberInputProps extends CommonInputProps {
  suffix?: string;
  hint?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  name,
  label,
  value,
  error,
  onChange,
  widthClass,
  suffix,
  hint,
}) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    {label && (
      <label className="govuk-label" htmlFor={id}>
        {label}
        {suffix && <span className="govuk-visually-hidden"> {suffix}</span>}
      </label>
    )}
    {hint && (
      <div className="govuk-hint" id={`${id}-hint`}>
        {hint}
      </div>
    )}
    {error && (
      <span className="govuk-error-message">
        <span className="govuk-visually-hidden">Error:</span> {error}
      </span>
    )}
    {suffix ? (
      <div className="govuk-input__wrapper">
        <input
          className={`govuk-input govuk-input--width-4${error ? ' govuk-input--error' : ''}`}
          id={id}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <div className="govuk-input__suffix" aria-hidden="true">
          {suffix}
        </div>
      </div>
    ) : (
      <input
        className={`govuk-input${widthClass ? ' ' + widthClass : ''}${error ? ' govuk-input--error' : ''}`}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

export default NumberInput;
