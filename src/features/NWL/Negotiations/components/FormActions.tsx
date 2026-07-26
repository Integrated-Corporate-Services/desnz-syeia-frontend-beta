import React from 'react';
import { LABELS } from '../constants/negotiationsConstants';

interface FormActionsProps {
  submitLabel?: string;
  isSaving?: boolean;
  disabled?: boolean;
}

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
