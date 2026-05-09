import React from 'react';
import { LABELS } from '../constants/negotiationsConstants';

interface FormActionsProps {
  submitLabel?: string;
  isSaving?: boolean;
}

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
