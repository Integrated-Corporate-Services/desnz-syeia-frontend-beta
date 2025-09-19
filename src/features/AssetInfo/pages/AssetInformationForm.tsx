import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../../store/useAssetStore';
import { useParams, useLocation } from 'react-router-dom';
import TextInput from '../component/TextInput';
import NumberInput from '../component/NumberInput';
import RadioGroup from '../component/RadioGroup';
import SelectInput from '../component/SelectInput';
import TextArea from '../component/TextArea';
import { ERROR_MESSAGES } from '../../../constants/error';
import { VOLTAGE_CLASS_OPTIONS, LINE_CLASS_OPTIONS } from '../../../constants/asset';

const initialState = {
  referenceNumber: '',
  lineLength: '',
  lineLengthUnit: 'metres',
  addingPoles: '',
  polesAdded: '',
  polesReplaced: '',
  constructionDescription: '',
  addingOverheadLines: '',
  overheadLinesDescription: '',
  removingEquipment: '',
  removingEquipmentDescription: '',
  worksOnExistingAsset: '',
  generalComments: '',
  lineType: '',
  lineVoltage: '',
};

type FormErrors = Partial<Record<keyof typeof initialState, string>>;

const AssetInformationForm: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { assets, loading, error, fetchAssets } = useAssetStore();


  // Get applicationId from URL params or query string
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  // Try to get ?id=... from query string if not present in params
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  const effectiveApplicationId = applicationId || queryId || '';

  // Fetch asset details on mount
  useEffect(() => {
    if (effectiveApplicationId) {
      fetchAssets(effectiveApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveApplicationId]);

  // Bind asset details to form if available
  useEffect(() => {
    if (assets && assets.length > 0) {
      const asset = assets[0];
      setForm({
        referenceNumber: asset.standardSpecificationReferenceNumber || '',
        lineLength: asset.lineLength?.toString() || '',
        lineLengthUnit: 'metres',
        addingPoles: asset.poles?.hasAddOrReplace ? 'yes' : 'no',
        polesAdded: asset.poles?.add?.toString() || '',
        polesReplaced: asset.poles?.replace?.toString() || '',
        constructionDescription: asset.poles?.description || '',
        addingOverheadLines: asset.overheadLines?.hasAddOrReplace ? 'yes' : 'no',
        overheadLinesDescription: asset.overheadLines?.description || '',
        removingEquipment: asset.equipmentRemoval?.isRemoving ? 'yes' : 'no',
        removingEquipmentDescription: asset.equipmentRemoval?.description || '',
        worksOnExistingAsset: asset.isExistingAsset ? 'yes' : 'no',
        generalComments: asset.generalComments || '',
        lineType: typeof asset.lineType === 'object' && asset.lineType !== null
          ? (asset.lineType as { code?: string }).code || ''
          : asset.lineType || '',
        lineVoltage: typeof asset.lineVoltage === 'object' && asset.lineVoltage !== null
          ? (asset.lineVoltage as { code?: string }).code || ''
          : asset.lineVoltage || '',
      });
    }
  }, [assets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof initialState) => ({ ...prev, [name]: value }));
  };

  const validate = (data: typeof initialState): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.referenceNumber.trim()) newErrors.referenceNumber = 'Enter the asset reference';
    if (!data.lineType) newErrors.lineType = 'Select the line type';
    if (!data.lineLength.trim()) newErrors.lineLength = 'Enter the line length';
    if (!data.addingPoles) {
      newErrors.addingPoles = 'Select yes if you are adding or replacing poles';
    } else if (data.addingPoles === 'yes') {
      if (!data.polesAdded.trim()) newErrors.polesAdded = 'Enter how many new poles you are adding';
      if (!data.polesReplaced.trim()) newErrors.polesReplaced = 'Enter how many poles you are replacing';
      if (!data.constructionDescription.trim()) newErrors.constructionDescription = 'Enter details about the poles you are adding or replacing';
    }
    if (!data.addingOverheadLines) {
      newErrors.addingOverheadLines = 'Select yes if you are adding or replacing overhead lines';
    } else if (data.addingOverheadLines === 'yes') {
      if (!data.overheadLinesDescription.trim()) newErrors.overheadLinesDescription = 'Enter details about overhead lines that will be added or replaced';
    }
    if (!data.removingEquipment) {
      newErrors.removingEquipment = 'Select yes if you are adding or removing existing equipment';
    } else if (data.removingEquipment === 'yes') {
      if (!data.removingEquipmentDescription.trim()) newErrors.removingEquipmentDescription = 'Enter details about existing equipment that will be removed';
    }
    if (!data.worksOnExistingAsset) newErrors.worksOnExistingAsset = 'Select yes if works are to be carried out on an existing asset';
    if (!data.lineVoltage) newErrors.lineVoltage = 'Select the line voltage';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setTimeout(() => {
        const firstErrorField = document.querySelector('.govuk-form-group--error input, .govuk-form-group--error select, .govuk-form-group--error textarea');
        if (firstErrorField) {
          (firstErrorField as HTMLElement).focus();
        }
      }, 0);
      return;
    }
    // Submit logic here
    alert('Form submitted!');
  };

  return (
  <div className="govuk-width-container">
      {loading && <div className="govuk-body">Loading asset details...</div>}
      {error && <div className="govuk-error-message">{error}</div>}
      <form className="govuk-!-margin-bottom-6" onSubmit={handleSubmit} noValidate>
        {submitted && Object.keys(errors).length > 0 && (
          <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary" style={{ marginBottom: '2rem', maxWidth: 600 }}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {Object.entries(errors).map(([field, message]) =>
                  typeof message === 'string' && message ? (
                    <li key={field}>
                      <a href={`#${field}`}>{message}</a>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        )}
        <h1 className="govuk-heading-l">Asset information</h1>

        <div className="govuk-!-margin-bottom-6" style={{ maxWidth: 480 }}>
          <TextInput
            id="referenceNumber"
            name="referenceNumber"
            label="Standard specification reference number"
            value={form.referenceNumber}
            error={errors.referenceNumber}
            onChange={handleChange}
            widthClass="govuk-input--width-20"
          />
        </div>

        {/* Line type */}
        <div className="govuk-!-margin-bottom-6">
          <SelectInput
            id="lineType"
            name="lineType"
            label="Line type"
            value={form.lineType}
            error={errors.lineType}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select an option' },
              ...LINE_CLASS_OPTIONS.map(opt => ({ value: opt.code, label: opt.label }))
            ]}
          />
        </div>

        <div className={`govuk-form-group govuk-!-margin-bottom-6${errors.lineLength ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 320 }}>
          <label className="govuk-label govuk-!-font-size-19" htmlFor="lineLength">Line length</label>
          {errors.lineLength && (
            <span className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {errors.lineLength}
            </span>
          )}
          <div className="govuk-input__wrapper">
            <input
              className={`govuk-input govuk-input--width-5${errors.lineLength ? ' govuk-input--error' : ''}`}
              id="lineLength"
              name="lineLength"
              type="number"
              value={form.lineLength}
              onChange={handleChange}
              aria-describedby="lineLength-suffix"
            />
            <span className="govuk-input__suffix" id="lineLength-suffix">metres</span>
          </div>
        </div>

        {/* Adding or replacing poles */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="addingPoles"
            label="Are you adding or replacing any poles?"
            name="addingPoles"
            value={form.addingPoles}
            error={errors.addingPoles}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          >
            <div className={`govuk-form-group${errors.polesAdded ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <NumberInput
                id="polesAdded"
                name="polesAdded"
                label="How many poles are you adding?"
                value={form.polesAdded}
                onChange={handleChange}
                widthClass="govuk-input--width-20"
                error={errors.polesAdded}
              />
            </div>
            <div className={`govuk-form-group${errors.polesReplaced ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <NumberInput
                id="polesReplaced"
                name="polesReplaced"
                label="How many are you replacing?"
                value={form.polesReplaced}
                onChange={handleChange}
                widthClass="govuk-input--width-20"
                error={errors.polesReplaced}
              />
            </div>
            <div className={`govuk-form-group${errors.constructionDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="constructionDescription"
                name="constructionDescription"
                label="Provide a description of the construction works and methods of work"
                value={form.constructionDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                style={{ width: '100%', maxWidth: 600 }}
                error={errors.constructionDescription}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Adding or replacing overhead lines */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="addingOverheadLines"
            label="Are you adding or replacing any overhead lines?"
            name="addingOverheadLines"
            value={form.addingOverheadLines}
            error={errors.addingOverheadLines}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          >
            <div className={`govuk-form-group${errors.overheadLinesDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="overheadLinesDescription"
                name="overheadLinesDescription"
                label="Provide a description of the construction works and methods of work"
                value={form.overheadLinesDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                style={{ width: '100%', maxWidth: 600 }}
                error={errors.overheadLinesDescription}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Removing equipment */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="removingEquipment"
            label="Are you removing any existing equipment as part of this project?"
            name="removingEquipment"
            value={form.removingEquipment}
            error={errors.removingEquipment}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          >
            <div className={`govuk-form-group${errors.removingEquipmentDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="removingEquipmentDescription"
                name="removingEquipmentDescription"
                label="Provide a description of the construction works and methods of work"
                value={form.removingEquipmentDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                style={{ width: '100%', maxWidth: 600 }}
                error={errors.removingEquipmentDescription}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Works on existing asset */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="worksOnExistingAsset"
            label="Are the works to be carried out on an existing asset?"
            name="worksOnExistingAsset"
            value={form.worksOnExistingAsset}
            error={errors.worksOnExistingAsset}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        </div>

        {/* General comments */}
        <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
          <TextArea
            id="generalComments"
            name="generalComments"
            label="General comments (optional)"
            value={form.generalComments}
            onChange={handleChange}
            maxLength={4000}
            showCount
          />
        </div>

        {/* Line voltage */}
        <div className="govuk-!-margin-bottom-6">
          <SelectInput
            id="lineVoltage"
            name="lineVoltage"
            label="Line voltage"
            value={form.lineVoltage}
            error={errors.lineVoltage}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select an option' },
              ...VOLTAGE_CLASS_OPTIONS.map(opt => ({ value: opt.code, label: opt.label }))
            ]}
          />
        </div>

        <details className="govuk-details govuk-!-margin-top-2 govuk-!-margin-bottom-6" data-module="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              I need to provide more than one line voltage
            </span>
          </summary>
          <div className="govuk-details__text">
            Please contact the system administrator to provide additional line voltages.
          </div>
        </details>

        <button type="submit" className="govuk-button govuk-!-margin-top-4">Save and continue</button>
      </form>
    </div>
  );
};

export default AssetInformationForm;
