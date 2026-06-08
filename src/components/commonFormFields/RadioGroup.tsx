import React from 'react';
import { CommonInputProps } from '../../types/form';

interface RadioGroupProps extends CommonInputProps {
  hint?: string;
  inline?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  name,
  label,
  hint,
  value,
  error,
  onChange,
  options = [],
  children,
  disabled,
  inline = false,
}) => {
  const hasError = Boolean(error);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  
  // Build aria-describedby
  const describedBy = [
    hint ? hintId : null,
    hasError ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`govuk-form-group${hasError ? ' govuk-form-group--error' : ''}`}>
      <fieldset
        className="govuk-fieldset"
        aria-describedby={describedBy}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h2 className="govuk-fieldset__heading">{label}</h2>
        </legend>

        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}

        {hasError && (
          <p id={errorId} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}

        <div className={`govuk-radios${inline ? ' govuk-radios--inline' : ''}`} data-module="govuk-radios">
          {options.map((opt) => {
            const inputId = `${id}-${opt.value}`;
            const isChecked = value === opt.value;
            
            return (
              <React.Fragment key={opt.value}>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id={inputId}
                    name={name}
                    type="radio"
                    value={opt.value}
                    checked={isChecked}
                    onChange={onChange}
                    disabled={disabled}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor={inputId}>
                    {opt.label}
                  </label>
                </div>
                
                {/* Conditional reveal for specific values */}
                {children && isChecked && (
                  <div className="govuk-radios__conditional">
                    <div className="govuk-form-group">
                      {children}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default RadioGroup;
