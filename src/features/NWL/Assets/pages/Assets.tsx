import React, { useState } from "react";
import { createAsset } from '../../../../services/asset-service';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { VOLTAGE_CLASS_OPTIONS } from '../../../../constants/asset';
import { NWL_BASE_URL } from "../../../../constants/nwl";

const lineTypeOptions = [
  { value: "overhead-line", label: "Overhead line" },
  { value: "overhead-line-wooden-poles", label: "Overhead line and wooden pole(s)" },
  { value: "overhead-line-wooden-poles-stays", label: "Overhead line and wooden pole(s) and stay(s)" },
  { value: "overhead-line-steel-towers", label: "Overhead line and steel tower(s)" },
  { value: "wooden-poles", label: "Wooden pole(s)" },
  { value: "stays", label: "Stay(s)" },
  { value: "steel-towers", label: "Steel tower(s)" },
  { value: "underground-cable", label: "Underground cable" },
  { value: "earth-wire", label: "Earth wire and any other associated apparatus" },
  { value: "other", label: "Other" }
];

const voltageOptions: string[] = Array.isArray(VOLTAGE_CLASS_OPTIONS)
  ? VOLTAGE_CLASS_OPTIONS.map((opt: { label: string }) => opt.label)
  : [];

const MAX_CHARS = 4000;

type LineTypeState = Record<string, { checked: boolean; description: string }>;

const Asset: React.FC = () => {
  const [voltage, setVoltage] = useState("select");
  const [lineTypes, setLineTypes] = useState<LineTypeState>(() => {
    const initial: LineTypeState = {};
    lineTypeOptions.forEach(opt => {
      initial[opt.value] = { checked: false, description: "" };
    });
    return initial;
  });
  const [errors, setErrors] = useState<{ voltage?: string; lineTypes?: string; [key: string]: string | undefined }>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  
  const params = useParams();
  const navigate = useNavigate();

  // Get applicationId from params
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };
  const applicationId = getApplicationId();

  const handleCheckboxChange = (value: string) => {
    setLineTypes(prev => ({
      ...prev,
      [value]: {
        ...prev[value],
        checked: !prev[value].checked
      }
    }));
    // Clear error for this specific checkbox if it exists
    if (errors[`lineType-${value}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`lineType-${value}`];
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (value: string, description: string) => {
    if (description.length <= MAX_CHARS) {
      setLineTypes(prev => ({
        ...prev,
        [value]: {
          ...prev[value],
          description
        }
      }));
      // Clear error when user starts typing
      if (errors[`lineType-${value}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`lineType-${value}`];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (saveType: 'continue' | 'later') => {
    const newErrors: typeof errors = {};
    
    // Validate voltage
    if (voltage === "select") {
      newErrors.voltage = "Select a line voltage for this asset";
    }

    // Validate at least one line type is checked
    const anyChecked = Object.values(lineTypes).some(lt => lt.checked);
    if (!anyChecked) {
      newErrors.lineTypes = "Select at least one line type";
    }

    // Validate each checked item has a description
    Object.entries(lineTypes).forEach(([key, value]) => {
      if (value.checked && !value.description.trim()) {
        newErrors[`lineType-${key}`] = "Enter a description for this item";
      }
    });

    setErrors(newErrors);
    setShowErrorSummary(Object.keys(newErrors).length > 0);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Build the line type description from checked items
        const selectedLineTypes = Object.entries(lineTypes)
          .filter(([, value]) => value.checked)
          .map(([key, value]) => {
            const option = lineTypeOptions.find(opt => opt.value === key);
            return `${option?.label}: ${value.description}`;
          })
          .join('\n\n');

        const newAssetId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
        const assetPayload = {
          applicationId,
          assets: [
            {
              assetId: newAssetId,
              assetType: 'nwl',
              typeOfLine: selectedLineTypes,
              lineVoltage: voltage,
              lineLength: 0,
              description: selectedLineTypes,
              standardSpecificationReferenceNumber: selectedLineTypes,
              assetReference: selectedLineTypes,
              poles: { hasAddOrReplace: false, add: 0, replace: 0, description: '' },
              overheadLines: { hasAddOrReplace: false, description: '' },
              equipmentRemoval: { isRemoving: false, description: '' },
              isExistingAsset: false,
            }
          ]
        };

        await createAsset(assetPayload);

        // Reset form
        setVoltage("select");
        setLineTypes(() => {
          const reset: LineTypeState = {};
          lineTypeOptions.forEach(opt => {
            reset[opt.value] = { checked: false, description: "" };
          });
          return reset;
        });
        setErrors({});
        setShowErrorSummary(false);

        // Navigate based on save type
        if (saveType === 'continue') {
          navigate(`${NWL_BASE_URL}/${applicationId}/task-list`);
        }
        // If 'later', stay on page with form reset
      } catch {
        setErrors({ voltage: "Failed to save asset. Please try again." });
        setShowErrorSummary(true);
      }
    }
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${applicationId}/task-list`}
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Information about lines</li>
        </ol>
      </nav>
      
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Add an asset</h1>
          
          <p className="govuk-body">
            Tell us about each electricity asset that is, or will be, on the land covered by this application. 
            You will be able to add more than one asset.
          </p>

          {showErrorSummary && (
            <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {Object.entries(errors).map(([key, err]) => (
                    <li key={key}><a href={`#${key}`}>{err}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form noValidate>
            {/* Line Voltage */}
            <div className={`govuk-form-group ${errors.voltage ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--s" htmlFor="line-voltage">
                Line voltage
              </label>
              <div id="line-voltage-hint" className="govuk-hint">
                Select the voltage for this asset
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
                onChange={e => {
                  setVoltage(e.target.value);
                  if (errors.voltage) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.voltage;
                      return newErrors;
                    });
                  }
                }}
                aria-describedby={`line-voltage-hint ${errors.voltage ? 'line-voltage-error' : ''}`}
              >
                <option value="select">Select an option</option>
                {voltageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Line Type Checkboxes */}
            <div className={`govuk-form-group ${errors.lineTypes ? 'govuk-form-group--error' : ''}`}>
              <fieldset className="govuk-fieldset" aria-describedby={errors.lineTypes ? 'line-type-error' : undefined}>
                <legend className="govuk-fieldset__legend govuk-label--s">
                  <h2 className="govuk-fieldset__heading">Line type</h2>
                </legend>
                <div id="line-type-hint" className="govuk-hint">
                  Select all that apply. You can add a Comment for each item you select.
                </div>
                {errors.lineTypes && (
                  <p id="line-type-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.lineTypes}
                  </p>
                )}

                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                  {lineTypeOptions.map((option) => (
                    <React.Fragment key={option.value}>
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={`line-type-${option.value}`}
                          name="line-type"
                          type="checkbox"
                          checked={lineTypes[option.value].checked}
                          onChange={() => handleCheckboxChange(option.value)}
                          aria-controls={`conditional-${option.value}`}
                          aria-expanded={lineTypes[option.value].checked}
                        />
                        <label 
                          className="govuk-label govuk-checkboxes__label" 
                          htmlFor={`line-type-${option.value}`}
                        >
                          {option.label}
                        </label>
                      </div>

                      {lineTypes[option.value].checked && (
                        <div className="govuk-checkboxes__conditional" id={`conditional-${option.value}`}>
                          <div className={`govuk-form-group ${errors[`lineType-${option.value}`] ? 'govuk-form-group--error' : ''}`}>
                            <label 
                              className="govuk-label" 
                              htmlFor={`description-${option.value}`}
                            >
                              Text to support the user to understand what is expected
                            </label>
                            {errors[`lineType-${option.value}`] && (
                              <p id={`description-${option.value}-error`} className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span> {errors[`lineType-${option.value}`]}
                              </p>
                            )}
                            <textarea
                              className={`govuk-textarea ${errors[`lineType-${option.value}`] ? 'govuk-textarea--error' : ''}`}
                              id={`description-${option.value}`}
                              name={`description-${option.value}`}
                              rows={4}
                              value={lineTypes[option.value].description}
                              onChange={(e) => handleDescriptionChange(option.value, e.target.value)}
                              maxLength={MAX_CHARS}
                              aria-describedby={errors[`lineType-${option.value}`] ? `description-${option.value}-error` : undefined}
                            />
                            <div className="govuk-hint govuk-!-margin-top-1">
                              You can enter up to {MAX_CHARS.toLocaleString()} characters
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Form Buttons */}
            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={() => handleSubmit('continue')}
              >
                Save and continue
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={() => handleSubmit('later')}
              >
                Save for later
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Asset;
