import React from "react";

interface SelectOption {
  value: string;
  text: string;
}

interface SelectInputProps {
  id: string;
  name: string;
  label: React.ReactNode;
  value: string;
  options: SelectOption[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  error,
  hint,
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
      {label && (
        <label className="govuk-label" htmlFor={id}>
          {label}
        </label>
      )}

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

      <select
        className={`govuk-select ${className} ${
          hasError ? "govuk-select--error" : ""
        }`.trim()}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-describedby={ariaDescribedBy}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
