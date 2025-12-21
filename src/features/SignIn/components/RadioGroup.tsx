import React from 'react';
import type { ApplicationTypeOption } from '../constants/applicationTypeOptions';

interface RadioGroupProps {
  name: string;
  options: ApplicationTypeOption[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  errorId?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  error,
  errorId,
}) => {
  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset" aria-describedby={error && errorId ? errorId : undefined}>
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
