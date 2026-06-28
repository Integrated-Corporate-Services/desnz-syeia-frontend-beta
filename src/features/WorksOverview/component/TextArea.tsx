
import React from 'react';
import { CommonInputProps } from '../../../types/form';




const TextArea: React.FC<CommonInputProps> = ({ id, name, label, hint, value, error, onChange, maxLength, showCount, style }) => {
  const count = value.length;
  return (
    <div className={`govuk-form-group govuk-!-margin-bottom-4 govuk-character-count${error ? ' govuk-form-group--error' : ''}`} data-module="govuk-character-count" data-maxlength={maxLength}>
      <label className="govuk-label" htmlFor={id}>{label}</label>
      {/* Render hint if provided */}
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
      <textarea
        className={`govuk-textarea govuk-js-character-count${error ? ' govuk-textarea--error' : ''}`}
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