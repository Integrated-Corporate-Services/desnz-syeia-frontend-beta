import React from "react";

interface FormActionsProps {
  onSaveForLater: () => void;
  saveButtonText?: string;
  saveForLaterText?: string;
  isSubmitting?: boolean;
}

/**
 * Reusable form action buttons for Application Details pages
 */
const FormActions: React.FC<FormActionsProps> = ({
  onSaveForLater,
  saveButtonText = "Save and continue",
  saveForLaterText = "Save for later",
  isSubmitting = false,
}) => {
  return (
    <div className="govuk-button-group">
      <button
        type="submit"
        className="govuk-button"
        data-module="govuk-button"
        disabled={isSubmitting}
      >
        {saveButtonText}
      </button>
      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        onClick={onSaveForLater}
        disabled={isSubmitting}
      >
        {saveForLaterText}
      </button>
    </div>
  );
};

export default FormActions;
