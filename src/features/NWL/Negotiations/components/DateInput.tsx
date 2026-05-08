import React from 'react';
import { FORM_LABELS, HINTS } from '../constants/negotiationsConstants';
import type { FormErrors, DateFormData } from '../types';

interface DateInputProps {
  date: DateFormData;
  errors: FormErrors;
  onDateChange: (field: keyof DateFormData, value: string) => void;
  legend?: string;
  hint?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  date,
  errors,
  onDateChange,
  legend = "Please confirm the start date of negotiations.",
  hint = HINTS.DATE_FORMAT,
}) => {
  const hasError = errors.date || errors.day || errors.month || errors.year;

  return (
    <div className={`govuk-form-group ${hasError ? 'govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset" role="group">
        <legend className="govuk-fieldset__legend">
          {legend}
        </legend>
        <div id="date-hint" className="govuk-hint">
          {hint}
        </div>
        {hasError && (
          <p id="date-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>{' '}
            {errors.date || errors.day || errors.month || errors.year}
          </p>
        )}
        <div className="govuk-date-input" id="date">
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor="day">
                {FORM_LABELS.DAY}
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                  errors.day ? 'govuk-input--error' : ''
                }`}
                id="day"
                name="day"
                type="text"
                inputMode="numeric"
                value={date.day}
                onChange={(e) => onDateChange('day', e.target.value)}
                aria-describedby={hasError ? 'date-error' : 'date-hint'}
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor="month">
                {FORM_LABELS.MONTH}
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                  errors.month ? 'govuk-input--error' : ''
                }`}
                id="month"
                name="month"
                type="text"
                inputMode="numeric"
                value={date.month}
                onChange={(e) => onDateChange('month', e.target.value)}
                aria-describedby={hasError ? 'date-error' : 'date-hint'}
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor="year">
                {FORM_LABELS.YEAR}
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                  errors.year ? 'govuk-input--error' : ''
                }`}
                id="year"
                name="year"
                type="text"
                inputMode="numeric"
                value={date.year}
                onChange={(e) => onDateChange('year', e.target.value)}
                aria-describedby={hasError ? 'date-error' : 'date-hint'}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
};
