import React from 'react';
import { LABELS } from '../constants';

interface FormActionsProps {
  onContinue: () => void;
  onSaveForLater?: () => void;
  disabled?: boolean;
  continueLabel?: string;
  saveForLaterLabel?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onContinue,
  onSaveForLater,
  disabled = false,
  continueLabel = LABELS.CONTINUE,
  saveForLaterLabel = LABELS.SAVE_FOR_LATER,
}) => {
  return (
    <div className="govuk-button-group">
      <button
        type="button"
        className="govuk-button"
        data-module="govuk-button"
        onClick={onContinue}
        disabled={disabled}
      >
        {continueLabel}
      </button>
      {onSaveForLater && (
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={onSaveForLater}
          disabled={disabled}
        >
          {saveForLaterLabel}
        </button>
      )}
    </div>
  );
};
