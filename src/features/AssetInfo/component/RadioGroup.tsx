import React from 'react';
import { CommonInputProps } from '../../../types/form';
import RevealAnnouncement from '../../../components/commonFormFields/RevealAnnouncement';

const RadioGroup: React.FC<CommonInputProps> = ({ id, name, label, value, error, onChange, options = [], children, disabled }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
    <fieldset className="govuk-fieldset">
      {label && <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{label}</legend>}
      {error && (
        <span className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </span>
      )}
      <div className="govuk-radios" data-module="govuk-radios">
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
                disabled={disabled}
                aria-controls={opt.value === 'transmission' && children ? `${id}-${opt.value}-hidden` : undefined}
                aria-expanded={opt.value === 'transmission' && children ? value === 'transmission' : undefined}
              />
              <label className="govuk-label govuk-radios__label" htmlFor={`${id}-${opt.value}`}>
                {opt.label}
              </label>
            </div>
            {opt.value === 'transmission' && children && <RevealAnnouncement shown={value === 'transmission'} message="More information is needed. A new question is shown below." />}
            {opt.value === 'transmission' && value === 'transmission' && children && (
              <div className="govuk-radios__conditional govuk-!-padding-left-4" id={`${id}-${opt.value}-hidden`}>
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