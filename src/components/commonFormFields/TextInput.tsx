import React from "react";

interface TextInputProps {
  id: string;
  name: string;
  label: React.ReactNode;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  hint?: React.ReactNode;
  type?: string;
  readOnly?: boolean;
  autoComplete?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  readOnly = false,
  autoComplete,
  className = "",
}) => {
  const hasError = Boolean(error && error.length > 0);

  // Build aria-describedby cleanly
  const describedByIds: string[] = [];
  if (hint) describedByIds.push(`${id}-hint`);
  if (hasError) describedByIds.push(`${id}-error`);
  const ariaDescribedBy =
    describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

  return (
    <div
      className={`govuk-form-group ${
        hasError ? "govuk-form-group--error" : ""
      }`}
    >
      <label className="govuk-label" htmlFor={id}>
        {label}
      </label>

      {hint && (
        <div id={`${id}-hint`} className="govuk-hint">
          {hint}
        </div>
      )}

      {hasError && (
        <p id={`${id}-error`} className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}

      <input
        className={`govuk-input ${className} ${
          hasError ? "govuk-input--error" : ""
        }`.trim()}
        id={id}
        name={name}
        type={type}
        value={value}
        readOnly={readOnly}
        autoComplete={autoComplete}
        onChange={onChange}
        aria-describedby={ariaDescribedBy}
      />
    </div>
  );
};

export default TextInput;
