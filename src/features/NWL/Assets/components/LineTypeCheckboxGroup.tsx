import React from 'react';
import type { LineTypeOption, LineTypeState, AssetFormErrors } from '../types';
import { CHARACTER_LIMITS, MESSAGES, LABELS, HINTS } from '../constants';

interface LineTypeCheckboxGroupProps {
  lineTypes: Record<string, LineTypeState>;
  options: LineTypeOption[];
  errors: AssetFormErrors;
  onCheckboxChange: (value: string) => void;
  onDescriptionChange: (value: string, description: string) => void;
}

export const LineTypeCheckboxGroup: React.FC<LineTypeCheckboxGroupProps> = ({
  lineTypes,
  options,
  errors,
  onCheckboxChange,
  onDescriptionChange,
}) => {
  return (
    <div className={`govuk-form-group ${errors.lineTypes ? 'govuk-form-group--error' : ''}`}>
      <fieldset 
        className="govuk-fieldset" 
        aria-describedby={errors.lineTypes ? 'line-type-error' : undefined}
      >
        <legend className="govuk-fieldset__legend govuk-label--s">
          <h2 className="govuk-fieldset__heading">{LABELS.LINE_TYPE}</h2>
        </legend>
        
        <div id="line-type-hint" className="govuk-hint">
          {HINTS.SELECT_LINE_TYPES}
        </div>
        
        {errors.lineTypes && (
          <p id="line-type-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errors.lineTypes}
          </p>
        )}

        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          {options.map((option) => (
            <React.Fragment key={option.value}>
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`line-type-${option.value}`}
                  name="line-type"
                  type="checkbox"
                  checked={lineTypes[option.value].checked}
                  onChange={() => onCheckboxChange(option.value)}
                  aria-controls={`conditional-${option.value}`}
                  aria-expanded={lineTypes[option.value].checked}
                />
                <label 
                  className="govuk-label govuk-checkboxes__label" 
                  htmlFor={`line-type-${option.value}`}
                >
                  {option.label}
                </label>
              </div>

              {lineTypes[option.value].checked && (
                <div className="govuk-checkboxes__conditional" id={`conditional-${option.value}`}>
                  <div 
                    className={`govuk-form-group govuk-character-count ${
                      errors[`lineType-${option.value}`] ? 'govuk-form-group--error' : ''
                    }`} 
                    data-module="govuk-character-count" 
                    data-maxlength={CHARACTER_LIMITS.MAX_DESCRIPTION}
                  >
                    <label 
                      className="govuk-label" 
                      htmlFor={`description-${option.value}`}
                    >
                      {LABELS.DESCRIPTION_LABEL}
                    </label>
                    
                    {errors[`lineType-${option.value}`] && (
                      <p id={`description-${option.value}-error`} className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error:</span>{' '}
                        {errors[`lineType-${option.value}`]}
                      </p>
                    )}
                    
                    <textarea
                      className={`govuk-textarea govuk-js-character-count ${
                        errors[`lineType-${option.value}`] ? 'govuk-textarea--error' : ''
                      }`}
                      id={`description-${option.value}`}
                      name={`description-${option.value}`}
                      rows={4}
                      value={lineTypes[option.value].description}
                      onChange={(e) => onDescriptionChange(option.value, e.target.value)}
                      maxLength={CHARACTER_LIMITS.MAX_DESCRIPTION}
                      aria-describedby={`description-${option.value}-info${
                        errors[`lineType-${option.value}`] ? ` description-${option.value}-error` : ''
                      }`}
                    />
                    
                    <div 
                      id={`description-${option.value}-info`} 
                      className="govuk-hint govuk-character-count__message"
                    >
                      {MESSAGES.CHARACTER_REMAINING(
                        CHARACTER_LIMITS.MAX_DESCRIPTION - lineTypes[option.value].description.length
                      )}
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
