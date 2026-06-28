import React from 'react';

interface TextAreaWithCounterProps {
  id: string;
  name: string;
  label?: string;
  hint?: string;
  value: string;
  error?: string;
  rows?: number;
  maxLength: number;
  onChange: (value: string) => void;
  showLabel?: boolean;
  labelClassName?: string;
}

export const TextAreaWithCounter: React.FC<TextAreaWithCounterProps> = ({
  id,
  name,
  label,
  hint,
  value,
  error,
  rows = 8,
  maxLength,
  onChange,
  showLabel = true,
  labelClassName = 'govuk-label',
}) => {
  const remainingChars = maxLength - value.length;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const infoId = `${id}-info`;

  // Build aria-describedby string
  const ariaDescribedBy = [
    errorId,
    hintId,
    infoId,
  ].filter(Boolean).join(' ');


  const characterRemainingMessage = (remaining: number): string => {
    if (remaining === 0) return 'You have 0 characters remaining';
    if (remaining < 0) return `You have ${Math.abs(remaining)} characters too many`;
    if (remaining === 1) return 'You have 1 character remaining';
    return `You can enter up to ${remaining.toLocaleString()} characters`;
  };

  return (
    <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
      {showLabel && label && (
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
      )}
      
      {hint && (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      )}
      
      {error && (
        <p id={errorId} className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      
      <textarea
        className={`govuk-textarea ${error ? 'govuk-textarea--error' : ''}`}
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={ariaDescribedBy || undefined}
        maxLength={maxLength}
      />
      
      <div id={infoId} className="govuk-hint govuk-character-count__message govuk-visually-hidden">
        You can enter up to {maxLength.toLocaleString()} characters
      </div>
      
      <div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">
        {characterRemainingMessage(remainingChars)}
      </div>
      
      <div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">
        {characterRemainingMessage(remainingChars)}
      </div>
    </div>
  );
};
