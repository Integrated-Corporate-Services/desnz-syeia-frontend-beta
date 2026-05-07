import React from "react";
import { createAsset } from '../../../../services/asset-service';
import { useNavigate } from 'react-router-dom';
import { VOLTAGE_CLASS_OPTIONS } from '../../../../constants/asset';
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { 
  AssetsBreadcrumbs, 
  ErrorSummary, 
  LineTypeCheckboxGroup, 
  FormActions 
} from '../components';
import { useApplicationId, useAssetForm } from '../hooks';
import { 
  LABELS, 
  HINTS, 
  LINE_TYPE_OPTIONS, 
  FORM_ERRORS 
} from '../constants';

const voltageOptions: string[] = Array.isArray(VOLTAGE_CLASS_OPTIONS)
  ? VOLTAGE_CLASS_OPTIONS.map((opt: { label: string }) => opt.label)
  : [];

const Asset: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useApplicationId();
  
  const {
    voltage,
    lineTypes,
    errors,
    showErrorSummary,
    handleVoltageChange,
    handleCheckboxChange,
    handleDescriptionChange,
    validateForm,
    buildAssetPayload,
    setErrors,
    setShowErrorSummary,
  } = useAssetForm();

  const handleSubmit = async () => {
    // Navigate directly to assets review page without saving
    navigate(`${NWL_BASE_URL}/${applicationId}/assets-review`);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <AssetsBreadcrumbs applicationId={applicationId} currentPage="add" />
      
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{LABELS.ADD_ASSET_TITLE}</h1>
          
          <p className="govuk-body">{HINTS.ADD_ASSET_INTRO}</p>

          {showErrorSummary && <ErrorSummary errors={errors} />}

          <form noValidate>
            {/* Line Voltage */}
            <div className={`govuk-form-group ${errors.voltage ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--s" htmlFor="line-voltage">
                {LABELS.LINE_VOLTAGE}
              </label>
              <div id="line-voltage-hint" className="govuk-hint">
                {HINTS.SELECT_VOLTAGE}
              </div>
              {errors.voltage && (
                <p id="line-voltage-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {errors.voltage}
                </p>
              )}
              <select 
                className={`govuk-select ${errors.voltage ? 'govuk-select--error' : ''}`}
                id="line-voltage" 
                name="line-voltage" 
                value={voltage} 
                onChange={e => handleVoltageChange(e.target.value)}
                aria-describedby={`line-voltage-hint ${errors.voltage ? 'line-voltage-error' : ''}`}
              >
                <option value="select">Select an option</option>
                {voltageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Line Type Checkboxes */}
            <LineTypeCheckboxGroup
              lineTypes={lineTypes}
              options={LINE_TYPE_OPTIONS}
              errors={errors}
              onCheckboxChange={handleCheckboxChange}
              onDescriptionChange={handleDescriptionChange}
            />

            {/* Form Buttons */}
            <FormActions
              onContinue={handleSubmit}
            />
          </form>
        </div>
      </div>
    </main>
  );
};

export default Asset;
