
import React from 'react';
import { CommonInputProps } from '../../../types/form';

export interface RadioOption {
  value: string;
  label: string;
  conditional?: React.ReactNode;
}

interface RadioGroupProps extends Omit<CommonInputProps, 'options'> {
  hint?: string;
  options?: RadioOption[];
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  name,
  label,
  value,
  error,
  onChange,
  options = [],
  hint,
}) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <fieldset className="govuk-fieldset" aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">{label}</legend>
      {typeof hint === 'string' && hint.length > 0 && (
        <div className="govuk-hint" id={`${id}-hint`}>
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
        {options.map((opt) => {
          const conditionalId = `${id}-${opt.value}-conditional`;
          const isSelected = value === opt.value;

          return (
            <React.Fragment key={opt.value}>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id={`${id}-${opt.value}`}
                  name={name}
                  type="radio"
                  value={opt.value}
                  checked={isSelected}
                  onChange={onChange}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={`${id}-${opt.value}`}>
                  {opt.label}
                </label>
              </div>
              {opt.conditional && isSelected && (
                <div className="govuk-radios__conditional" id={conditionalId}>
                  {opt.conditional}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </fieldset>
  </div>
);

export default RadioGroup;
