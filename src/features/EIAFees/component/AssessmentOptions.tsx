import React from 'react';
import { EIA_ASSESSMENT_LABELS, EIA_CONTENT, type EiaAssessment } from '../constants/eiaAssessment';
import { EIAFeesErrorField } from '../validations';

interface AssessmentOptionsProps {
    options: EiaAssessment[];
    value: EiaAssessment | '';
    onChange: (value: EiaAssessment) => void;
    errorMessage?: string;
}

const FIELD = EIAFeesErrorField.ASSESSMENT;

const AssessmentOptions: React.FC<AssessmentOptionsProps> = ({ options, value, onChange, errorMessage }) => (
    <div className={`govuk-form-group${errorMessage ? ' govuk-form-group--error' : ''}`}>
        <fieldset className="govuk-fieldset" aria-describedby={errorMessage ? `${FIELD}-error` : undefined}>
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{EIA_CONTENT.QUESTION}</legend>
            {errorMessage && (
                <p id={`${FIELD}-error`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errorMessage}
                </p>
            )}
            <div className="govuk-radios" data-module="govuk-radios">
                {options.map((option, index) => {
                    // The first input carries the field id so the error summary link moves focus to it.
                    const id = index === 0 ? FIELD : `${FIELD}-${option}`;
                    return (
                        <div className="govuk-radios__item" key={option}>
                            <input
                                className="govuk-radios__input"
                                id={id}
                                name={FIELD}
                                type="radio"
                                value={option}
                                checked={value === option}
                                onChange={() => onChange(option)}
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor={id}>
                                {EIA_ASSESSMENT_LABELS[option]}
                            </label>
                        </div>
                    );
                })}
            </div>
        </fieldset>
    </div>
);

export default AssessmentOptions;
