import React from 'react';
import type { ApplicationTypeOption } from '../constants/applicationTypeOptions';

interface RadioGroupProps {
  name: string;
  legend: string;
  options: ApplicationTypeOption[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  errorId?: string;
  hint?: string;
  legendSize?: 's' | 'm' | 'l' | 'xl';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  legend,
  options,
  selectedValue,
  onChange,
  error,
  errorId,
  hint,
  legendSize = 'l',
}) => {
  const hintId = hint ? `${name}-hint` : undefined;
  const describedBy = [
    hintId,
    error && errorId ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  const legendClassName = `govuk-fieldset__legend govuk-fieldset__legend--${legendSize}`;

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset" aria-describedby={describedBy}>
        <legend className={legendClassName}>
          <h1 className="govuk-fieldset__heading">{legend}</h1>
        </legend>

        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}

        {error && errorId && (
          <p className="govuk-error-message" id={errorId}>
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}

        <div className="govuk-radios govuk-radios--large">
          {options.map((option) => (
            <div key={option.id} className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id={option.id}
                name={name}
                type="radio"
                value={option.value}
                checked={selectedValue === option.value}
                onChange={onChange}
              />
              <label className="govuk-label govuk-radios__label" htmlFor={option.id}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
