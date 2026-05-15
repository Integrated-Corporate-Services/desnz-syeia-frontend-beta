import React from "react";

interface DateInputProps {
  id: string;
  legend: string;
  hint?: string;
  day: string;
  month: string;
  year: string;
  onDayChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  error?: string;
  fieldErrors?: {
    day?: string;
    month?: string;
    year?: string;
  };
}

/**
 * Reusable GOV.UK date input component
 */
const DateInput: React.FC<DateInputProps> = ({
  id,
  legend,
  hint,
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  error,
  fieldErrors,
}) => {
  const hasError = error || fieldErrors?.day || fieldErrors?.month || fieldErrors?.year;

  return (
    <div className={`govuk-form-group ${hasError ? "govuk-form-group--error" : ""}`}>
      <fieldset className="govuk-fieldset" role="group" aria-describedby={hint ? `${id}-hint` : undefined}>
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h2 className="govuk-fieldset__heading">{legend}</h2>
        </legend>
        {hint && (
          <div id={`${id}-hint`} className="govuk-hint">
            {hint}
          </div>
        )}
        {error && (
          <p id={`${id}-error`} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <div className="govuk-date-input" id={id}>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-day`}>
                Day
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                  fieldErrors?.day ? "govuk-input--error" : ""
                }`}
                id={`${id}-day`}
                name="day"
                type="text"
                inputMode="numeric"
                value={day}
                onChange={(e) => onDayChange(e.target.value)}
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-month`}>
                Month
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                  fieldErrors?.month ? "govuk-input--error" : ""
                }`}
                id={`${id}-month`}
                name="month"
                type="text"
                inputMode="numeric"
                value={month}
                onChange={(e) => onMonthChange(e.target.value)}
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-year`}>
                Year
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                  fieldErrors?.year ? "govuk-input--error" : ""
                }`}
                id={`${id}-year`}
                name="year"
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) => onYearChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default DateInput;
