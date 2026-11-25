import React from 'react';

interface QuestionInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  caption?: string;
  hint?: string;
  /** True when the label is the page heading. */
  isPageHeading?: boolean;
  type?: 'text' | 'email';
  widthClass?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'email' | 'text';
}

/** A single GOV.UK text input whose label can double as the page heading, with an optional caption above it. */
const QuestionInput: React.FC<QuestionInputProps> = ({
  id, label, value, onChange, error, caption, hint, isPageHeading = true,
  // Half the content column matches the name and email inputs in the Figma designs.
  type = 'text', widthClass = 'govuk-!-width-one-half', autoComplete, inputMode,
}) => {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const labelElement = (
    <label className={`govuk-label${isPageHeading ? ' govuk-label--l' : ''}`} htmlFor={id}>{label}</label>
  );

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      {caption && <span className="govuk-caption-l">{caption}</span>}
      {isPageHeading ? <h1 className="govuk-label-wrapper">{labelElement}</h1> : labelElement}
      {hint && <div className="govuk-hint" id={`${id}-hint`}>{hint}</div>}
      {error && <p className="govuk-error-message" id={`${id}-error`}><span className="govuk-visually-hidden">Error:</span> {error}</p>}
      <input
        className={`govuk-input ${widthClass}${error ? ' govuk-input--error' : ''}`}
        id={id}
        name={id}
        type={type}
        spellCheck={false}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-describedby={describedBy}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

export default QuestionInput;
