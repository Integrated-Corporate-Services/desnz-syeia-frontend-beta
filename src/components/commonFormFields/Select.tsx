import AccessibleSelect from "./AccessibleSelect";

interface SelectOption {
    value: string;
    label: React.ReactNode;
}

interface SelectProps {
    id: string;
    name: string;
    label: React.ReactNode;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    options: SelectOption[];
    error?: string;
    hint?: React.ReactNode;
    defaultOption?: string;
}

const Select: React.FC<SelectProps> = ({
    id,
    name,
    label,
    value,
    onChange,
    options,
    error,
    hint,
    defaultOption = "Select an option"
}) => {
    const hasError = Boolean(error && error.length > 0);

    // Build aria-describedby cleanly
    const describedByIds: string[] = [];
    if (hint) describedByIds.push(`${id}-hint`);
    if (hasError) describedByIds.push(`${id}-error`);
    const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

    return (
        <div className={`govuk-form-group ${hasError ? 'govuk-form-group--error' : ''}`}>
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

            <AccessibleSelect
                id={id}
                value={value}
                error={hasError}
                options={[{ value: '', text: defaultOption }, ...options.map((option) => ({ value: option.value, text: option.label }))]}
                aria-describedby={ariaDescribedBy}
                onChange={(newValue) =>
                    onChange({ target: { name, value: newValue } } as React.ChangeEvent<HTMLSelectElement>)
                }
            />

        </div>
    );
};

export default Select;
