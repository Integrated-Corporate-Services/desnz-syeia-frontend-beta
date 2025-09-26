
import React from 'react';
import { CommonInputProps } from '../../../types/form';




const TextArea: React.FC<CommonInputProps> = ({ id, name, label, value, error, onChange, maxLength, showCount, style }) => {
  const count = value.length;
  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label" htmlFor={id}>{label}</label>
      {error && (
        <span className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </span>
      )}
      <textarea
        className={`govuk-textarea${error ? ' govuk-textarea--error' : ''}`}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={4}
        aria-describedby={showCount ? `${id}-info` : undefined}
        style={style}
      />
      {showCount && maxLength && (
        <div id={`${id}-info`} className="govuk-hint govuk-character-count__message">
          You have {maxLength - count} characters remaining
        </div>
      )}
    </div>
  );
};

export default TextArea;