import React from 'react';
import { LABELS } from '../constants';

interface FormActionsProps {
  submitLabel?: string;
  isSaving?: boolean;
}

/**
 * Form actions component with submit button
 * Note: "Save for later" removed as per project requirements
 */
export const FormActions: React.FC<FormActionsProps> = ({
  submitLabel = LABELS.CONTINUE,
  isSaving = false,
}) => {
  return (
    <button 
      type="submit" 
      className="govuk-button" 
      data-module="govuk-button"
      disabled={isSaving}
    >
      {isSaving ? 'Saving...' : submitLabel}
    </button>
  );
};
