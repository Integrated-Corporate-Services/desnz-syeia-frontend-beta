import React from "react";
import AccessibleSelect from "./AccessibleSelect";

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

      <AccessibleSelect
        id={id}
        name={name}
        className={className}
        value={value}
        error={hasError}
        options={options}
        aria-describedby={ariaDescribedBy}
        onChange={(newValue) =>
          onChange({ target: { name, value: newValue, type: 'select-one' } } as React.ChangeEvent<HTMLSelectElement>)
        }
      />
    </div>
  );
};

export default SelectInput;
