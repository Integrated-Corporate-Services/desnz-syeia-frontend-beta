import React, { useState, useEffect,useRef } from 'react';
import { useAssetStore } from '../../../store/useAssetStore';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import TextInput from '../component/TextInput';
import NumberInput from '../component/NumberInput';
import RadioGroup from '../component/RadioGroup';
import SelectInput from '../component/SelectInput';
import TextArea from '../component/TextArea';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { VOLTAGE_CLASS_OPTIONS, TYPE_OF_LINE_ENUM, LINE_TYPE_LABELS } from '../../../constants/asset';
import { createAsset } from '../../../services/asset-service';

const initialState = {
  assetId: '',
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
  overheadLinesWorkItemId: '',
  assetPolesWorkItemId: '',
  assetEquipmentRemovalWorkItemId: ''
};

type FormErrors = Partial<Record<keyof typeof initialState, string>>;

const AssetInformationForm: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { assets, loading, error, fetchAssets, updateAsset } = useAssetStore();
  const navigate = useNavigate();
  // Ref for first error field
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  // Focus the first error field when errors change
  useEffect(() => {
    if (submitted && Object.keys(errors).length > 0 && firstErrorRef.current) {
      firstErrorRef.current.focus();
    }
  }, [errors, submitted]);


  // Get applicationId from URL params or query string
 
    const params = useParams();
 
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
        assetId: asset.assetId || '',
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
        lineType: typeof asset.typeOfLine === 'object' && asset.typeOfLine !== null
          ? (asset.typeOfLine as { code?: string }).code || ''
          : asset.typeOfLine || '',
        lineVoltage: typeof asset.lineVoltage === 'object' && asset.lineVoltage !== null
          ? (asset.lineVoltage as { code?: string }).code || ''
          : asset.lineVoltage || '',
        overheadLinesWorkItemId: asset.overheadLines?.workItemId || '',
        assetPolesWorkItemId: asset.poles?.workItemId || '',
        assetEquipmentRemovalWorkItemId: asset.equipmentRemoval?.workItemId || ''
      });
    }
  }, [assets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof initialState) => ({ ...prev, [name]: value }));
  };

  const validate = (data: typeof initialState): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.referenceNumber.trim()) newErrors.referenceNumber = ASSET_ERROR_MESSAGES.referenceNumber;
    if (!data.lineType) newErrors.lineType = ASSET_ERROR_MESSAGES.lineType;
    if (!data.lineLength.trim()) newErrors.lineLength = ASSET_ERROR_MESSAGES.lineLength;
    if (!data.addingPoles) {
      newErrors.addingPoles = ASSET_ERROR_MESSAGES.addingPoles;
    } else if (data.addingPoles === 'yes') {
      if (!data.polesAdded.trim()) newErrors.polesAdded = ASSET_ERROR_MESSAGES.polesAdded;
      if (!data.polesReplaced.trim()) newErrors.polesReplaced = ASSET_ERROR_MESSAGES.polesReplaced;
      if (!data.constructionDescription.trim()) newErrors.constructionDescription = ASSET_ERROR_MESSAGES.constructionDescription;
    }
    if (!data.addingOverheadLines) {
      newErrors.addingOverheadLines = ASSET_ERROR_MESSAGES.addingOverheadLines;
    } else if (data.addingOverheadLines === 'yes') {
      if (!data.overheadLinesDescription.trim()) newErrors.overheadLinesDescription = ASSET_ERROR_MESSAGES.overheadLinesDescription;
    }
    if (!data.removingEquipment) {
      newErrors.removingEquipment = ASSET_ERROR_MESSAGES.removingEquipment;
    } else if (data.removingEquipment === 'yes') {
      if (!data.removingEquipmentDescription.trim()) newErrors.removingEquipmentDescription = ASSET_ERROR_MESSAGES.removingEquipmentDescription;
    }
    if (!data.worksOnExistingAsset) newErrors.worksOnExistingAsset = ASSET_ERROR_MESSAGES.worksOnExistingAsset;
    const allowedVoltages = VOLTAGE_CLASS_OPTIONS.map(opt => opt.code);
    if (!data.lineVoltage) {
      newErrors.lineVoltage = ASSET_ERROR_MESSAGES.lineVoltage;
    } else if (!allowedVoltages.includes(data.lineVoltage)) {
      newErrors.lineVoltage = ASSET_ERROR_MESSAGES.lineVoltageInvalid;
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    // Map form data to AssetRequest
    //const asset = assets && assets[0] ? assets[0] : {};
    const assetPayload = {
      applicationId: effectiveApplicationId,
      assets: [
        {
          assetId: form.assetId || '',
          assetType: 's37', // or other, if needed
          assetReference: form.referenceNumber,
          description: '', // add if needed
          standardSpecificationReferenceNumber: form.referenceNumber,
          lineLength: parseFloat(form.lineLength),
          typeOfLine: form.lineType,
          poles: {
            hasAddOrReplace: form.addingPoles === 'yes',
            add: parseInt(form.polesAdded) || 0,
            replace: parseInt(form.polesReplaced) || 0,
            description: form.constructionDescription,
            workItemId: typeof form.assetPolesWorkItemId === 'string' ? form.assetPolesWorkItemId : ''
          },
          overheadLines: {
            hasAddOrReplace: form.addingOverheadLines === 'yes',
            description: form.overheadLinesDescription,
            workItemId: typeof form.overheadLinesWorkItemId === 'string' ? form.overheadLinesWorkItemId : ''
          },
          equipmentRemoval: {
            isRemoving: form.removingEquipment === 'yes',
            description: form.removingEquipmentDescription,
            workItemId: typeof form.assetEquipmentRemovalWorkItemId === 'string' ? form.assetEquipmentRemovalWorkItemId : ''
          },
          isExistingAsset: form.worksOnExistingAsset === 'yes',
          generalComments: form.generalComments,
          lineVoltage: form.lineVoltage,
        },
      ],
    };
    if (assets && assets[0]?.assetId) {
      // Update existing asset
      updateAsset(assetPayload)
        .then(() => {
          fetchAssets(effectiveApplicationId);
          navigate(`/task-list?id=${effectiveApplicationId}`);
        })
        .catch((err: any) => {
          setErrors({ generalComments: err.message || ASSET_ERROR_MESSAGES.generalCommentsFailed });
        });
    } else {
      // Create new asset
      createAsset(assetPayload)
        .then(() => {
          fetchAssets(effectiveApplicationId);
          navigate(`/task-list?id=${effectiveApplicationId}`);
        })
        .catch((err: any) => {
          setErrors({ generalComments: err.message || ASSET_ERROR_MESSAGES.generalCommentsFailed });
        });
    }
  };

  return (
  <div className="govuk-width-container">
<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
				<ol className="govuk-breadcrumbs__list">
					<li className="govuk-breadcrumbs__list-item">
						<Link
							className="govuk-breadcrumbs__link"
							to={`/task-list?id=${applicationId}`}
						>
              Task list
            </Link>
					</li>
					<li className="govuk-breadcrumbs__list-item" aria-current="page">Asset information</li>
				</ol>
			</nav>
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
            ref={errors.referenceNumber ? firstErrorRef : undefined}
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
              ...TYPE_OF_LINE_ENUM.map((opt: string) => ({ value: opt, label: LINE_TYPE_LABELS[opt] }))
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
              ref={!errors.referenceNumber && errors.lineLength ? firstErrorRef : undefined}
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
