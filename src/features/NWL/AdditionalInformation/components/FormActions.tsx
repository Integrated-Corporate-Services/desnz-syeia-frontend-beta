import React from 'react';
import { LABELS } from '../constants';

interface FormActionsProps {
  submitLabel?: string;
  isSaving?: boolean;
  disabled?: boolean;
}

/**
 * Form actions component with submit button
 * Note: "Save for later" removed as per project requirements
 */
export const FormActions: React.FC<FormActionsProps> = ({
  submitLabel = LABELS.CONTINUE,
  isSaving = false,
  disabled = false,
}) => {
  return (
    <button 
      type="submit" 
      className="govuk-button" 
      data-module="govuk-button"
      disabled={isSaving || disabled}
    >
      {isSaving ? 'Saving...' : submitLabel}
    </button>
  );
};
