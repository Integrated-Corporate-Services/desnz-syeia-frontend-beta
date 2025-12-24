import React from "react";

interface FormButtonsProps {
  onSaveLater: (e: React.FormEvent) => void;
  onSaveContinue: (e: React.FormEvent) => void;
}

const FormButtons: React.FC<FormButtonsProps> = ({ onSaveLater, onSaveContinue }) => {
  return (
    <div className="govuk-button-group">
      <button
        type="button"
        onClick={onSaveLater}
        className="govuk-button govuk-button--secondary"
        data-module="govuk-button"
      >
        Save for later
      </button>
      <button
        type="button"
        onClick={onSaveContinue}
        className="govuk-button"
        data-module="govuk-button"
      >
        Save and Continue
      </button>
    </div>
  );
};

export default FormButtons;
