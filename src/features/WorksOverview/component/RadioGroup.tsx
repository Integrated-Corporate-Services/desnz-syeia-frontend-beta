
import React from 'react';
import { CommonInputProps } from '../../../types/form';

interface RadioGroupProps extends CommonInputProps {
  hint?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ id, name, label, value, error, onChange, options = [], children, hint }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">{label}</legend>
      {/* Render hint below legend and before radio buttons */}
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
      <div className="govuk-radios">
        {options.map((opt, idx) => (
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
              />
              <label className="govuk-label govuk-radios__label" htmlFor={`${id}-${opt.value}`}>
                {opt.label}
              </label>
            </div>
            {opt.value === 'yes' && value === 'yes' && children && (
              <div style={{ borderLeft: '4px solid #b1b4b6', marginLeft: 32, paddingLeft: 24, marginTop: 8 }}>
                {children}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </fieldset>
  </div>
);

export default RadioGroup;