
import React from 'react';
import { CommonInputProps } from '../../../types/form';

interface TextInputProps extends CommonInputProps {
  inputMode?: 'text' | 'numeric' | 'decimal';
  suffix?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, name, label, hint, value, error, onChange, widthClass, inputMode, suffix, labelClassName }, ref) => {
    const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;

    const input = (
      <input
        className={`govuk-input${widthClass ? ` ${widthClass}` : ''}${error ? ' govuk-input--error' : ''}`}
        id={id}
        name={name}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        ref={ref}
        aria-describedby={describedBy}
      />
    );

    return (
      <div className={`govuk-form-group govuk-!-margin-bottom-4${error ? ' govuk-form-group--error' : ''}`}>
        {label && <label className={`govuk-label${labelClassName ? ` ${labelClassName}` : ''}`} htmlFor={id}>{label}</label>}
        {hint && (
          <div id={`${id}-hint`} className="govuk-hint">
            {hint}
          </div>
        )}
        {error && (
          <p id={`${id}-error`} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        {suffix ? (
          <div className="govuk-input__wrapper">
            {input}
            <div className="govuk-input__suffix" aria-hidden="true">{suffix}</div>
          </div>
        ) : (
          input
        )}
      </div>
    );
  }
);

export default TextInput;
