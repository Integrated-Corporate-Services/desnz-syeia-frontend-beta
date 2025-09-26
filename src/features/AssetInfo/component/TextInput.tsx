
import React from 'react';
import { CommonInputProps } from '../../../types/form';

const TextInput = React.forwardRef<HTMLInputElement, CommonInputProps>(
  ({ id, name, label, value, error, onChange, widthClass }, ref) => (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
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
        type="text"
        value={value}
        onChange={onChange}
        ref={ref}
      />
    </div>
  )
);

export default TextInput;