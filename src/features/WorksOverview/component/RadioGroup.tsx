
import React from 'react';
import { CommonInputProps } from '../../../types/form';

interface RadioGroupProps extends CommonInputProps {
  hint?: string;
  noChildren?: React.ReactNode;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ id, name, label, value, error, onChange, options = [], children, noChildren, hint }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">{label}</legend>
      {typeof hint === 'string' && hint.length > 0 && (
        <div className="govuk-hint" id={`${id}-hint`}>
          {hint}
        </div>
      )}
      {error && (
        <span className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </span>
      )}
      <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
        {options.map((opt) => (
          <React.Fragment key={opt.value}>
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id={`${id}-${opt.value}`}
                name={name}
                type="radio"
                value={opt.value}
                checked={value === opt.value}
                onChange={onChange}
                aria-controls={`${id}-${opt.value}-conditional`}
                aria-expanded={value === opt.value ? 'true' : 'false'}
              />
              <label className="govuk-label govuk-radios__label" htmlFor={`${id}-${opt.value}`}>
                {opt.label}
              </label>
            </div>
            {opt.value === 'yes' && value === 'yes' && children && (
              <div className="govuk-radios__conditional" id={`${id}-yes-conditional`}>
                {children}
              </div>
            )}
            {opt.value === 'no' && value === 'no' && noChildren && (
              <div className="govuk-radios__conditional" id={`${id}-no-conditional`}>
                {noChildren}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </fieldset>
  </div>
);

export default RadioGroup;
