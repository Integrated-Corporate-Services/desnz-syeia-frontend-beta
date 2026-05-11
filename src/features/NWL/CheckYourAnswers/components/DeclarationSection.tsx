import React from 'react';
import { DECLARATION_TEXT } from '../constants/checkYourAnswersConstants';

interface DeclarationSectionProps {
  isChecked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}

/**
 * Declaration section component following GDS Design System
 */
export const DeclarationSection: React.FC<DeclarationSectionProps> = ({
  isChecked,
  error,
  onChange,
}) => {
  return (
    <div className="govuk-form-group">
      <h2 className="govuk-heading-m">{DECLARATION_TEXT.HEADING}</h2>
      
      <div className="govuk-body">
        <p>{DECLARATION_TEXT.CONTENT[0]}</p>
        <ul className="govuk-list govuk-list--bullet">
          {DECLARATION_TEXT.CONTENT.slice(1).map((item, index) => (
            <li key={index}>{item.replace('• ', '')}</li>
          ))}
        </ul>
      </div>

      <div
        className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}
      >
        {error && (
          <p id="declaration-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        
        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="declaration"
              name="declaration"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onChange(e.target.checked)}
              aria-describedby={error ? 'declaration-error' : undefined}
            />
            <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
              {DECLARATION_TEXT.CHECKBOX_LABEL}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
