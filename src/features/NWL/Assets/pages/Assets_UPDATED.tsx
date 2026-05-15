/**
 * Updated Assets.tsx with proper data persistence using NWL Asset Service
 */

import React, { useEffect } from "react";
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
  FORM_ERRORS,
} from '../constants';
import nwlAssetService, { CreateAssetsPayload } from '../services/nwlAssetService';

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
    resetForm,
    setErrors,
    setShowErrorSummary,
  } = useAssetForm();

  const [saving, setSaving] = React.useState(false);

  // Map frontend line type keys to backend codes
  const lineTypeCodeMap: Record<string, string> = {
    'overhead-line': 'overhead_line',
    'overhead-line-wooden-poles': 'overhead_line_wooden_pole',
    'overhead-line-wooden-poles-stays': 'overhead_line_wooden_pole_stay',
    'overhead-line-steel-towers': 'overhead_line_steel_tower',
    'wooden-poles': 'wooden_pole',
    'stays': 'stay',
    'steel-towers': 'steel_tower',
    'underground-cable': 'underground_cable',
    'earth-wire-apparatus': 'earth_wire_apparatus',
    'other': 'other',
  };

  const handleSubmit = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});
    setShowErrorSummary(false);

    try {
      // Build line types array with backend codes
      const selectedLineTypes = Object.entries(lineTypes)
        .filter(([, value]) => value.checked)
        .map(([key]) => lineTypeCodeMap[key] || key);

      // Build component descriptions with backend codes
      const componentDescriptions = Object.entries(lineTypes)
        .filter(([, value]) => value.checked)
        .reduce((acc, [key, value]) => {
          const backendCode = lineTypeCodeMap[key] || key;
          return {
            ...acc,
            [backendCode]: value.description,
          };
        }, {});

      // Create payload for NWL backend
      const payload: CreateAssetsPayload = {
        application_id: applicationId,
        assets: [
          {
            line_voltage: voltage,
            line_types: selectedLineTypes,
            component_descriptions: componentDescriptions,
          },
        ],
        assets_match_plan: true, // Default, will be updated in final page
        assets_match_plan_explanation: undefined,
      };

      // Call NWL asset service to save
      const response = await nwlAssetService.createAssets(payload);

      console.log('[Assets] Asset created successfully', { 
        metadata_id: response.assets_metadata_id,
        asset_count: response.assets.length 
      });

      // Reset form
      resetForm();

      // Navigate to review page
      navigate(`${NWL_BASE_URL}/${applicationId}/assets-review`);
    } catch (error: any) {
      console.error('[Assets] Error saving asset', { error });
      
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.error || 
                          FORM_ERRORS.SAVE_FAILED;
      
      setErrors({ general: errorMessage });
      setShowErrorSummary(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <AssetsBreadcrumbs applicationId={applicationId} currentPage="add" />
      
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{LABELS.ADD_ASSET_TITLE}</h1>
          
          <p className="govuk-body">{HINTS.ADD_ASSET_INTRO}</p>

          {showErrorSummary && <ErrorSummary errors={errors} />}

          {saving && (
            <div className="govuk-notification-banner" role="region" aria-labelledby="saving-banner">
              <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading" id="saving-banner">
                  Saving asset...
                </p>
              </div>
            </div>
          )}

          <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                disabled={saving}
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
              continueDisabled={saving}
              continueText={saving ? 'Saving...' : LABELS.CONTINUE}
            />
          </form>
        </div>
      </div>
    </main>
  );
};

export default Asset;
