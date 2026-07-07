
import React from 'react';
import { CommonInputProps } from '../../../types/form';




const TextArea: React.FC<CommonInputProps> = ({ id, name, label, value, error, onChange, maxLength, showCount, style, disabled }) => {
  const count = value.length;
  const remainingChars = maxLength ? maxLength - count : 0;
  
  return (
    <div className={`govuk-form-group${showCount && maxLength ? ' govuk-character-count' : ''}${error ? ' govuk-form-group--error' : ''}`} data-module={showCount && maxLength ? "govuk-character-count" : undefined} data-maxlength={showCount && maxLength ? maxLength : undefined}>
      <label className="govuk-label" htmlFor={id}>{label}</label>
      {error && (
        <span className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </span>
      )}
      <textarea
        className={`govuk-textarea${showCount && maxLength ? ' govuk-js-character-count' : ''}${error ? ' govuk-textarea--error' : ''}`}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={4}
        aria-describedby={showCount ? `${id}-info` : undefined}
        style={style}
        disabled={disabled}
      />
      {showCount && maxLength && (
        <div id={`${id}-info`} className="govuk-hint govuk-character-count__message">
          You have {remainingChars} characters remaining
        </div>
      )}
    </div>
  );
};

export default TextArea;