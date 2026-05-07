import React from 'react';
import { LABELS } from '../constants/objectorDetailsConstants';

interface FormActionsProps {
  onSaveForLater: () => void;
  submitLabel?: string;
  isSaving?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSaveForLater,
  submitLabel = LABELS.CONTINUE,
  isSaving = false,
}) => {
  return (
    <div className="govuk-button-group">
      <button 
        type="submit" 
        className="govuk-button" 
        data-module="govuk-button"
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : submitLabel}
      </button>
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        data-module="govuk-button"
        onClick={onSaveForLater}
        disabled={isSaving}
      >
        {LABELS.SAVE_FOR_LATER}
      </button>
    </div>
  );
};
