import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  id: string;
  name: string;
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  name,
  label,
  options,
  selected,
  onChange,
  error,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, value]);
    } else {
      onChange(selected.filter((v) => v !== value));
    }
  };

  return (
    <div
      className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}
      ref={dropdownRef}
      style={{ maxWidth: 320 }}
    >
      <fieldset className="govuk-fieldset" aria-describedby={`${id}-hint`}>
        {label && (
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
            {label}
          </legend>
        )}
        <div id={`${id}-hint`} className="govuk-hint">
          Select all that apply
        </div>
        {error && (
          <span className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </span>
        )}
        <div className="multi-select-dropdown" style={{ position: "relative" }}>
          <button
            type="button"
            className={`govuk-select${error ? " govuk-input--error" : ""}`}
            style={{
              width: "100%",
              textAlign: "left",
              border: error ? "2px solid #d4351c" : undefined,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            id={id}
          >
            {selected.length > 0
              ? options
                  .filter((opt) => selected.includes(opt.value))
                  .map((opt) => opt.label)
                  .join(", ")
              : "Select..."}
          </button>
          {open && (
            <div
              className="multi-select-dropdown-list"
              style={{
                position: "absolute",
                zIndex: 10,
                background: "#fff",
                border: "1px solid #b1b4b6",
                width: "100%",
                maxHeight: 220,
                overflowY: "auto",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              role="listbox"
              aria-multiselectable="true"
            >
              {options.map((opt) => (
                <div
                  key={opt.value}
                  className="govuk-checkboxes__item"
                  style={{
                    padding: "8px 12px 8px 20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    id={`${id}-${opt.value}`}
                    name={name}
                    value={opt.value}
                    checked={selected.includes(opt.value)}
                    onChange={(e) =>
                      handleCheckboxChange(opt.value, e.target.checked)
                    }
                    className="govuk-checkboxes__input"
                    style={{ width: 16, height: 16 }}
                  />
                  <label
                    htmlFor={`${id}-${opt.value}`}
                    className="govuk-label govuk-checkboxes__label"
                    style={{ marginLeft: 8, fontSize: "1rem" }}
                  >
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default MultiSelectDropdown;
