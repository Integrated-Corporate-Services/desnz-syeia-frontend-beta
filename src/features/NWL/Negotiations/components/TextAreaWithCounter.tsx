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
  characterRemainingMessage: (remaining: number) => string;
  showLabel?: boolean;
  labelClassName?: string;
}

/**
 * Reusable TextArea component with dynamic character counter
 * Follows GOV.UK Design System patterns with accessibility support
 */
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
  characterRemainingMessage,
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
      
      {/* Visually hidden - for initial context */}
      <div id={infoId} className="govuk-hint govuk-character-count__message govuk-visually-hidden">
        You can enter up to {maxLength.toLocaleString()} characters
      </div>
      
      {/* Visible dynamic counter */}
      <div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">
        {characterRemainingMessage(remainingChars)}
      </div>
      
      {/* Screen reader live region */}
      <div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">
        {characterRemainingMessage(remainingChars)}
      </div>
    </div>
  );
};
