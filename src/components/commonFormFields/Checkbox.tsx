
import React from 'react';

interface CheckboxProps {
    id: string;
    name: string;
    label: React.ReactNode;
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    hint?: React.ReactNode;
    error?: string;
}


const Checkbox: React.FC<CheckboxProps> = ({
    id,
    name,
    label,
    checked,
    onChange,
    hint,
    error
}) => {
    const hasError = Boolean(error && error.length > 0);

    return (
        <div className={`govuk-form-group ${hasError ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset">
                <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
                    <div className="govuk-checkboxes__item">
                        <input
                            className="govuk-checkboxes__input"
                            id={id}
                            name={name}
                            type="checkbox"
                            checked={checked}
                            onChange={onChange}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
                            {label}
                        </label>
                        {hint && (
                            <div id={`${id}-hint`} className="govuk-hint govuk-checkboxes__hint">
                                {hint}
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default Checkbox;
