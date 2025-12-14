
import React from 'react';

interface MultiSelectOption {
    value: string;
    label: React.ReactNode;
}

interface MultiSelectSyntheticEvent {
    target: {
        name: string;
        value: string[];
    };
}

interface MultiSelectProps {
    id: string;
    name: string;
    label: React.ReactNode;
    values?: string[];
    onChange: (event: MultiSelectSyntheticEvent) => void;
    options: MultiSelectOption[];
    error?: string;
    hint?: React.ReactNode;
    maxSelections?: number | null;
}


const MultiSelect: React.FC<MultiSelectProps> = React.memo(({
    id,
    name,
    label,
    values = [],
    onChange,
    options,
    error,
    hint,
    maxSelections = null
}) => {
    const hasError = Boolean(error && error.length > 0);

    const handleCheckboxChange = (optionValue: string) => {
        let newValues: string[];
        if (values.includes(optionValue)) {
            // Remove if already selected
            newValues = values.filter(val => val !== optionValue);
        } else {
            // Add if not selected (check max limit)
            if (typeof maxSelections === 'number' && maxSelections > 0 && values.length >= maxSelections) {
                return; // Don't allow more selections
            }
            newValues = [...values, optionValue];
        }

        // Create synthetic event to match standard form handling
        const syntheticEvent: MultiSelectSyntheticEvent = {
            target: {
                name: name,
                value: newValues
            }
        };
        onChange(syntheticEvent);
    };

    // Build aria-describedby cleanly
    const describedByIds: string[] = [];
    if (hint) describedByIds.push(`${id}-hint`);
    if (hasError) describedByIds.push(`${id}-error`);
    const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

    return (
        <div className={`govuk-form-group ${hasError ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={ariaDescribedBy}>
                <legend className="govuk-fieldset__legend govuk-label">
                    {label}
                </legend>

                {hint && (
                    <div id={`${id}-hint`} className="govuk-hint">
                        {hint}
                        {maxSelections && (
                            <>
                                <br />
                                <span className="govuk-!-font-size-16">
                                    You can select up to {maxSelections} organisation{maxSelections !== 1 ? 's' : ''}.
                                </span>
                            </>
                        )}
                    </div>
                )}

                {hasError && (
                    <p id={`${id}-error`} className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span> {error}
                    </p>
                )}

                <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
                    {options.map((option) => {
                        const checkboxId = `${id}-${option.value}`;
                        const isChecked = values.includes(option.value);
                        const isDisabled = typeof maxSelections === 'number' && maxSelections > 0 && values.length >= maxSelections && !isChecked;
                        return (
                            <div key={option.value} className="govuk-checkboxes__item">
                                <input
                                    className="govuk-checkboxes__input"
                                    id={checkboxId}
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => handleCheckboxChange(option.value)}
                                />
                                <label
                                    className={`govuk-label govuk-checkboxes__label ${isDisabled ? 'govuk-checkboxes__label--disabled' : ''}`}
                                    htmlFor={checkboxId}
                                >
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}
                </div>

                {/* Selected items summary */}
                {values.length > 0 && (
                    <div className="govuk-inset-text govuk-!-margin-top-4">
                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                            <strong>Selected organisation{values.length !== 1 ? 's' : ''} ({values.length}):</strong>
                        </p>
                        <ul className="govuk-list govuk-list--bullet govuk-body-s">
                            {values.map(value => {
                                const option = options.find(opt => opt.value === value);
                                return (
                                    <li key={value}>
                                        {option ? option.label : value}
                                        <button
                                            type="button"
                                            className="govuk-link govuk-!-font-size-14 govuk-!-margin-left-2"
                                            onClick={() => handleCheckboxChange(value)}
                                            style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0 }}
                                            aria-label={`Remove ${option ? option.label : value}`}
                                        >
                                            (remove)
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

            </fieldset>
        </div>
    );
});

export default MultiSelect;
