import React from "react";

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  name,
  error,
  required = false,
  className = "govuk-textarea",
}) => (
  <div className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}>
    <label className="govuk-label" htmlFor={name}>
      {label}
      {required && <span className="govuk-required">*</span>}
    </label>
    {error && <span className="govuk-error-message">{error}</span>}
    <textarea
      className={className}
      id={name}
      name={name}
      rows={5}
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-required={required}
    />
  </div>
);

export default TextAreaField;
