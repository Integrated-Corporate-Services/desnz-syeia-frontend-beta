
import React from 'react';
import { CommonInputProps } from '../../../types/form';




const NumberInput: React.FC<CommonInputProps> = ({ id, name, label, value, error, onChange, widthClass, inlineLabel, labelClassName }) => (
  <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}
    style={inlineLabel ? { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 0 } : {}}>
    {inlineLabel ? (
      <>
        <label className={`govuk-label${labelClassName ? ' ' + labelClassName : ''}`} htmlFor={id} style={{ marginBottom: 0 }}>{label}</label>
        <input
          className={`govuk-input${widthClass ? ' ' + widthClass : ''}${error ? ' govuk-input--error' : ''}`}
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={onChange}
        />
      </>
    ) : (
      <>
        <label className="govuk-label" htmlFor={id}>{label}</label>
        {error && (
          <span className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </span>
        )}
        <input
          className={`govuk-input${widthClass ? ' ' + widthClass : ''}${error ? ' govuk-input--error' : ''}`}
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={onChange}
        />
      </>
    )}
  </div>
);

export default NumberInput;