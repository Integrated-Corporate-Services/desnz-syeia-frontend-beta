
import React from 'react';
import { CommonInputProps } from '../../../types/form';

interface NumberInputProps extends CommonInputProps {
  suffix?: string;
  allowDecimals?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  name,
  label,
  hint,
  value,
  error,
  onChange,
  widthClass,
  inlineLabel,
  labelClassName,
  suffix,
  allowDecimals = false,
}) => {
  const describedBy = [
    hint ? `${id}-hint` : '',
    error ? `${id}-error` : '',
  ].filter(Boolean).join(' ') || undefined;

  const input = (
    <input
      className={`govuk-input${widthClass ? ` ${widthClass}` : ''}${error ? ' govuk-input--error' : ''}`}
      id={id}
      name={name}
      type="number"
      inputMode={allowDecimals ? 'decimal' : 'numeric'}
      pattern={allowDecimals ? undefined : '[0-9]*'}
      step={allowDecimals ? 'any' : '1'}
      value={value}
      onChange={onChange}
      aria-describedby={describedBy}
    />
  );

  return (
    <div
      className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}
      style={inlineLabel ? { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 0 } : {}}
    >
      {inlineLabel ? (
        <>
          <label className={`govuk-label${labelClassName ? ` ${labelClassName}` : ''}`} htmlFor={id} style={{ marginBottom: 0 }}>
            {label}
          </label>
          {input}
        </>
      ) : (
        <>
          {label && <label className="govuk-label" htmlFor={id}>{label}</label>}
          {hint && (
            <div id={`${id}-hint`} className="govuk-hint">
              {hint}
            </div>
          )}
          {error && (
            <span id={`${id}-error`} className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {error}
            </span>
          )}
          {suffix ? (
            <div className="govuk-input__wrapper">
              {input}
              <div className="govuk-input__suffix" aria-hidden="true">{suffix}</div>
            </div>
          ) : (
            input
          )}
        </>
      )}
    </div>
  );
};

export default NumberInput;
