import React from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { ASSETS_PAGE_IDS } from '../constants/pageNames';
import SkipLink from '../../../../components/SkipLink';

const voltageOptions: string[] = Array.isArray(VOLTAGE_CLASS_OPTIONS)
  ? VOLTAGE_CLASS_OPTIONS.map((opt: { label: string }) => opt.label)
  : [];

const Asset: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = useApplicationId();
  const isAddingAnother = searchParams.get('add') === 'true';
  const editAssetId = searchParams.get('edit');
  const isEditMode = !!editAssetId;
  
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
    setVoltage,
    setLineTypes,
  } = useAssetForm();

  const [saving, setSaving] = React.useState(false);
  const [checkingAssets, setCheckingAssets] = React.useState(true);
  const [loadingAsset, setLoadingAsset] = React.useState(false);

  // Check if assets already exist - redirect to review if they do (unless explicitly adding another or editing)
  React.useEffect(() => {
    const checkExistingAssets = async () => {
      if (!applicationId) return;

      try {
        const response = await nwlAssetService.getAssetsByApplicationId(applicationId);
        
        // If assets exist and user is not explicitly adding another or editing, redirect to review page
        if (response.assets && response.assets.length > 0 && !isAddingAnother && !isEditMode) {
          navigate(`${NWL_BASE_URL}/${applicationId}/assets-review`, { replace: true });
          return;
        }
      } catch {
        // If error (e.g., 404 - no assets), continue to show add form
        // Error logging is handled in the service layer
      } finally {
        setCheckingAssets(false);
      }
    };

    checkExistingAssets();
  }, [applicationId, navigate, isAddingAnother, isEditMode]);

  // Load asset data if in edit mode
  React.useEffect(() => {
    const loadAssetForEdit = async () => {
      if (!isEditMode || !editAssetId) return;

      setLoadingAsset(true);
      try {
        const asset = await nwlAssetService.getAssetById(editAssetId);
        
        // Set voltage
        setVoltage(asset.line_voltage);
        
        // Reverse map backend codes to frontend keys and populate line types
        const backendToFrontendMap: Record<string, string> = {
          'overhead_line': 'overhead-line',
          'overhead_line_wooden_pole': 'overhead-line-wooden-poles',
          'overhead_line_wooden_pole_stay': 'overhead-line-wooden-poles-stays',
          'overhead_line_steel_tower': 'overhead-line-steel-towers',
          'wooden_pole': 'wooden-poles',
          'stay': 'stays',
          'steel_tower': 'steel-towers',
          'underground_cable': 'underground-cable',
          'earth_wire_apparatus': 'earth-wire',
          'other': 'other',
        };
        
        // Build line types state from asset data
        const newLineTypes: Record<string, { checked: boolean; description: string }> = {};
        LINE_TYPE_OPTIONS.forEach(opt => {
          const backendCode = Object.entries(backendToFrontendMap).find(
            ([, frontend]) => frontend === opt.value
          )?.[0];
          
          const isChecked = backendCode ? asset.line_types.includes(backendCode) : false;
          const description = backendCode && asset.component_descriptions[backendCode] ? 
            asset.component_descriptions[backendCode] : '';
          
          newLineTypes[opt.value] = {
            checked: isChecked,
            description: description,
          };
        });
        
        setLineTypes(newLineTypes);
      } catch {
        setErrors({ general: 'Failed to load asset for editing. Please try again.' });
        setShowErrorSummary(true);
      } finally {
        setLoadingAsset(false);
      }
    };

    loadAssetForEdit();
  }, [isEditMode, editAssetId, setVoltage, setLineTypes, setErrors, setShowErrorSummary]);

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
    'earth-wire': 'earth_wire_apparatus',
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
        .map(([key]) => lineTypeCodeMap[key])
        .filter((code): code is string => Boolean(code));

      const validSelectedLineTypeSet = new Set(selectedLineTypes);

      // Build component descriptions with backend codes
      const componentDescriptions = Object.entries(lineTypes)
        .filter(([, value]) => value.checked)
        .reduce((acc, [key, value]) => {
          const backendCode = lineTypeCodeMap[key];
          if (!backendCode || !validSelectedLineTypeSet.has(backendCode)) {
            return acc;
          }

          return {
            ...acc,
            [backendCode]: value.description,
          };
        }, {});

      if (isEditMode && editAssetId) {
        // Update existing asset
        await nwlAssetService.updateAsset(editAssetId, {
          line_voltage: voltage,
          line_types: selectedLineTypes,
          component_descriptions: componentDescriptions,
        });

        // Asset update is logged in the service layer
      } else {
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
          assets_match_plan_explanation: undefined,
        };

        // Call NWL asset service to save
        await nwlAssetService.createAssets(payload, ASSETS_PAGE_IDS.ADD_ASSET);

        // Asset creation is logged in the service layer
      }

      // Reset form
      resetForm();

      // Navigate to review page
      navigate(`${NWL_BASE_URL}/${applicationId}/assets-review`);
    } catch (error: unknown) {
      // Error logging is handled in the service layer
      
      // Type guard for axios error
      interface ValidationDetail {
        field: string;
        message: string;
      }
      
      interface AxiosError {
        response?: {
          data?: {
            details?: ValidationDetail[] | string;
            error?: string;
          };
        };
      }
      
      const axiosError = error as AxiosError;
      
      // Extract error message from response
      let errorMessage: string;
      const details = axiosError?.response?.data?.details;
      
      if (Array.isArray(details)) {
        // Backend validation errors - extract messages
        errorMessage = details.map(d => d.message).join('; ');
      } else if (typeof details === 'string') {
        errorMessage = details;
      } else {
        errorMessage = axiosError?.response?.data?.error || FORM_ERRORS.SAVE_FAILED;
      }
      
      setErrors({ general: errorMessage });
      setShowErrorSummary(true);
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while checking for existing assets or loading asset for edit
  if (checkingAssets || loadingAsset) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content">
        <AssetsBreadcrumbs applicationId={applicationId} currentPage={isEditMode ? "edit" : "add"} />
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{isEditMode ? LABELS.EDIT_ASSET_TITLE : LABELS.ADD_ASSET_TITLE}</h1>
            <p className="govuk-body">Loading...</p>
          </div>
        </div>
      </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content">
      <AssetsBreadcrumbs applicationId={applicationId} currentPage={isEditMode ? "edit" : "add"} />
      
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{isEditMode ? LABELS.EDIT_ASSET_TITLE : LABELS.ADD_ASSET_TITLE}</h1>
          
          <p className="govuk-body">{isEditMode ? HINTS.EDIT_ASSET_INTRO : HINTS.ADD_ASSET_INTRO}</p>

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
              disabled={saving}
              continueLabel={saving ? 'Saving...' : (isEditMode ? 'Save changes' : LABELS.CONTINUE)}
            />
          </form>
        </div>
      </div>
    </main>
    </div>
    </>
  );
};

export default Asset;
