import React from 'react';
import { LAND_DETAILS_LABELS } from '../constants';

type FormActionsProps = {
  onSaveAndContinue: () => void;
  isSaving?: boolean;
  disabled?: boolean;
};

const FormActions: React.FC<FormActionsProps> = ({ 
  onSaveAndContinue, 
  isSaving = false,
  disabled = false,
}) => {
  const labels = LAND_DETAILS_LABELS.BUTTONS;

  return (
    <button
      type="button"
      className="govuk-button"
      data-module="govuk-button"
      onClick={onSaveAndContinue}
      disabled={isSaving || disabled}
    >
      {isSaving ? 'Saving...' : labels.SAVE_CONTINUE}
    </button>
  );
};

export default FormActions;
