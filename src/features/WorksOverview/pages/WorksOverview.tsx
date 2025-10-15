import React, { useState, useEffect,useRef } from 'react';
import { useAssetStore } from '../../../store/useAssetStore';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import TextInput from '../component/TextInput';
import NumberInput from '../component/NumberInput';
import RadioGroup from '../component/RadioGroup';
import SelectInput from '../component/SelectInput';
import TextArea from '../component/TextArea';
import FileUploadBox from '../../../components/FileUploadBox';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { WORKS_ERROR_MESSAGES } from '../../../constants/worksError';
import { VOLTAGE_CLASS_OPTIONS, TYPE_OF_LINE_ENUM, LINE_TYPE_LABELS } from '../../../constants/asset';
import { createAsset } from '../../../services/asset-service';

const initialState = {
  assetId: '',
  referenceNumber: '',
  lineLength: '',
  lineLengthUnit: 'metres',
  addingPoles: '',
  polesMaterials: '',
  chemicalCoating: '',
  polesAdded: '',
  polesReplaced: '',
  constructionDescription: '',
  addingOverheadLines: '',
  overheadLinesDescription: '',
  overheadLinesDuration: '',
  overheadLinesVehicles: '',
  overheadLinesRoadClosures: '',
  excavationWorks: '',
  excavationWorksDescription: '',
  vegetationClearance: '',
  vegetationClearanceDescription: '',
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

const WorksOverview: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const { assets, fetchAssets, updateAsset } = useAssetStore();
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

  useEffect(() => {
    if (assets && assets.length > 0) {
      const worksOverview = assets[0];
      setForm(prev => ({
        ...prev,
        assetId: worksOverview.assetId || '',
        referenceNumber: worksOverview.standardSpecificationReferenceNumber || '',
        lineLength: worksOverview.lineLength?.toString() || '',
        lineLengthUnit: 'metres',
        addingPoles: worksOverview.poles?.hasAddOrReplace ? 'yes' : 'no',
        polesMaterials: worksOverview.poles?.materials || '',
        polesAdded: worksOverview.poles?.add?.toString() || '',
        polesReplaced: worksOverview.poles?.replace?.toString() || '',
        constructionDescription: worksOverview.poles?.description || '',
        addingOverheadLines: worksOverview.overheadLines?.hasAddOrReplace ? 'yes' : 'no',
        overheadLinesDescription: worksOverview.overheadLines?.description || '',
        // The following fields are frontend-only, do not map from backend
        // overheadLinesDuration, overheadLinesVehicles, overheadLinesRoadClosures
        excavationWorks: worksOverview.excavationWorks?.hasExcavation ? 'yes' : 'no',
        chemicalCoating: worksOverview.poles?.chemicalCoatings || '',
        excavationWorksDescription: worksOverview.excavationWorks?.description || '',
        vegetationClearance: worksOverview.vegetationClearance?.hasClearance ? 'yes' : 'no',
        vegetationClearanceDescription: worksOverview.vegetationClearance?.description || '',
        removingEquipment: worksOverview.equipmentRemoval?.isRemoving ? 'yes' : 'no',
        removingEquipmentDescription: worksOverview.equipmentRemoval?.description || '',
        worksOnExistingAsset: worksOverview.isExistingAsset ? 'yes' : 'no',
        generalComments: worksOverview.generalComments || '',
        lineType: typeof worksOverview.typeOfLine === 'object' && worksOverview.typeOfLine !== null
          ? (worksOverview.typeOfLine as { code?: string }).code || ''
          : worksOverview.typeOfLine || '',
        lineVoltage: typeof worksOverview.lineVoltage === 'object' && worksOverview.lineVoltage !== null
          ? (worksOverview.lineVoltage as { code?: string }).code || ''
          : worksOverview.lineVoltage || '',
        overheadLinesWorkItemId: worksOverview.overheadLines?.workItemId || '',
        assetPolesWorkItemId: worksOverview.poles?.workItemId || '',
        assetEquipmentRemovalWorkItemId: worksOverview.equipmentRemoval?.workItemId || ''
      }));
    }
  }, [assets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof initialState) => ({ ...prev, [name]: value }));
  };

  const validate = (data: typeof initialState): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.addingPoles) {
      newErrors.addingPoles = WORKS_ERROR_MESSAGES.addingPoles;
    } else if (data.addingPoles === 'yes') {
      if (!data.polesAdded.trim()) newErrors.polesAdded = WORKS_ERROR_MESSAGES.polesAdded;
      if (!data.polesReplaced.trim()) newErrors.polesReplaced = WORKS_ERROR_MESSAGES.polesReplaced;
      if (!data.constructionDescription.trim()) newErrors.constructionDescription = WORKS_ERROR_MESSAGES.constructionDescription;
    }
    if (!data.addingOverheadLines) {
      newErrors.addingOverheadLines = WORKS_ERROR_MESSAGES.addingOverheadLines;
    } else if (data.addingOverheadLines === 'yes') {
      if (!data.overheadLinesDescription.trim()) newErrors.overheadLinesDescription = WORKS_ERROR_MESSAGES.overheadLinesDescription;
      if (!data.overheadLinesDuration.trim()) newErrors.overheadLinesDuration = 'Enter the estimated duration of the works';
      if (!data.overheadLinesVehicles.trim()) newErrors.overheadLinesVehicles = 'Enter the vehicles required on site';
      if (!data.overheadLinesRoadClosures) newErrors.overheadLinesRoadClosures = 'Select if road closures or traffic calming measures are required';
    }
    if (!data.excavationWorks) {
      newErrors.excavationWorks = WORKS_ERROR_MESSAGES.excavationWorkDescription;
    } else if (data.excavationWorks === 'yes') {
      if (!data.excavationWorksDescription.trim()) {
        newErrors.excavationWorksDescription = WORKS_ERROR_MESSAGES.excavationWorkDescription;
      }
    }
    if (!data.vegetationClearance) {
      newErrors.vegetationClearance = WORKS_ERROR_MESSAGES.vegetationClearanceDescription;
    } else if (data.vegetationClearance === 'yes') {
      if (!data.vegetationClearanceDescription.trim()) {
        newErrors.vegetationClearanceDescription = WORKS_ERROR_MESSAGES.vegetationClearanceDescription;
      }
    }
    if (!data.removingEquipment) {
      newErrors.removingEquipment = WORKS_ERROR_MESSAGES.removingEquipment;
    } else if (data.removingEquipment === 'yes') {
      if (!data.removingEquipmentDescription.trim()) newErrors.removingEquipmentDescription = WORKS_ERROR_MESSAGES.removingEquipmentDescription;
    }
    if (!data.worksOnExistingAsset) newErrors.worksOnExistingAsset = WORKS_ERROR_MESSAGES.worksOnExistingAsset;
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
          assetType: 's37',
          assetReference: form.referenceNumber,
          description: form.constructionDescription || '',
          poles: {
            hasAddOrReplace: form.addingPoles === 'yes',
            materials: form.polesMaterials,
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
          excavationWorks: {
            hasExcavation: form.excavationWorks === 'yes',
            description: form.excavationWorksDescription
          },
          vegetationClearance: {
            hasClearance: form.vegetationClearance === 'yes',
            description: form.vegetationClearanceDescription
          },
          equipmentRemoval: {
            isRemoving: form.removingEquipment === 'yes',
            description: form.removingEquipmentDescription,
            workItemId: typeof form.assetEquipmentRemovalWorkItemId === 'string' ? form.assetEquipmentRemovalWorkItemId : ''
          },
          isExistingAsset: form.worksOnExistingAsset === 'yes',
          generalComments: form.generalComments,
          typeOfLine: form.lineType,
          lineVoltage: form.lineVoltage,
          lineLength: parseFloat(form.lineLength) || 0,
          standardSpecificationReferenceNumber: form.referenceNumber
        }
      ]
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
					<li className="govuk-breadcrumbs__list-item" aria-current="page">Works Overview</li>
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
        <h1 className="govuk-heading-l">Works Overview</h1>

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
              
              <TextInput
                id="polesMaterials"
                name="polesMaterials"
                label="What materials will be used for the new poles/pylons?"
                value={form.polesMaterials}
                onChange={handleChange}
                error={errors.polesAdded}
              />
            </div>
            <div className={`govuk-form-group${errors.polesAdded ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              
              <TextInput
                id="chemicalCoatings"
                name="chemicalCoating"
                label="Are any chemical coatings proposed?"
                value={form.chemicalCoating}
                onChange={handleChange}
                error={errors.polesAdded}
              />
            </div>
            <div className={`govuk-form-group${errors.polesAdded ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>

              <NumberInput
                id="polesAdded"
                name="polesAdded"
                label="How many poles are you adding?"
                value={form.polesAdded}
                onChange={handleChange}
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
                error={errors.polesReplaced}
              />
            </div>
            <div className={`govuk-form-group${errors.constructionDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="constructionDescription"
                name="constructionDescription"
                label="Comments on poles being added or replaced (optional)"
                hint="On poles being added or replaced"
                value={form.constructionDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
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
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <h3 className="govuk-heading-s">Provide a description of the overhead lines that you are adding or replacing</h3>
            <div className={`govuk-form-group${errors.overheadLinesDuration ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextInput
                id="overheadLinesDuration"
                name="overheadLinesDuration"
                label="What is the estimated duration of the works?"
                value={form.overheadLinesDuration}
                onChange={handleChange}
                error={errors.overheadLinesDuration}
              />
            </div>
            <div className={`govuk-form-group${errors.overheadLinesVehicles ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextInput
                id="overheadLinesVehicles"
                name="overheadLinesVehicles"
                label="What vehicles will be required on site?"
                value={form.overheadLinesVehicles}
                onChange={handleChange}
                error={errors.overheadLinesVehicles}
              />
            </div>
            <div className={`govuk-form-group${errors.overheadLinesRoadClosures ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <RadioGroup
                id="overheadLinesRoadClosures"
                label="Will any road closures or traffic calming measures be required?"
                name="overheadLinesRoadClosures"
                value={form.overheadLinesRoadClosures}
                error={errors.overheadLinesRoadClosures}
                onChange={handleChange}
                options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Excavation works */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="excavationWorks"
            label="Are excavation works required?"
            name="excavationWorks"
            hint="For example hedgerow removal or tree lopping"
            value={form.excavationWorks}
            error={errors.excavationWorks}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          >
            <div className={`govuk-form-group${errors.excavationWorksDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="excavationWorksDescription"
                name="excavationWorksDescription"
                label="Provide more details about the excavation works"
                value={form.excavationWorksDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                style={{ width: '100%', maxWidth: 600 }}
                error={errors.excavationWorksDescription}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Vegetation clearance */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="vegetationClearance"
            label="Is vegetation clearance required?"
            name="vegetationClearance"
            hint="For example hedgerow removal or tree lopping"
            value={form.vegetationClearance}
            error={errors.vegetationClearance}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          >
            <div className={`govuk-form-group${errors.vegetationClearanceDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="vegetationClearanceDescription"
                name="vegetationClearanceDescription"
                label="Provide more details about the vegetation clearance"
                value={form.vegetationClearanceDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                style={{ width: '100%' }}
                error={errors.vegetationClearanceDescription}
              />
            </div>
          </RadioGroup>
        </div>

                {/* Vegetation clearance */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="vegetationClearance"
            label="Are you using pre-existing access routes and/or storage sites?"
            name="vegetationClearance"
            value={form.vegetationClearance}
            error={errors.vegetationClearance}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          >
            <div className={`govuk-form-group${errors.vegetationClearanceDescription ? ' govuk-form-group--error' : ''}`}> 
              <TextArea
                id="vegetationClearanceDescription"
                name="vegetationClearanceDescription"
                label="Provide more details about the pre-existing access routes and/or storage sites?"
                value={form.vegetationClearanceDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                style={{ width: '100%' }}
                error={errors.vegetationClearanceDescription}
              />
            </div>
            <div style={{ marginTop: '2rem' }}>
              <label className="govuk-label govuk-label--m" style={{ fontWeight: 700 }}>
                Upload map and photos of the Access Route.
              </label>
              <FileUploadBox
                prefix={`access-route/${applicationId}`}
                onUploadComplete={() => {}}
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
            hint="Are you carrying out any additional work to any assets on this route that is not covered above."
            value={form.generalComments}
            onChange={handleChange}
            maxLength={4000}
            showCount
          />
        </div>

        <button type="submit" className="govuk-button govuk-!-margin-top-4">Save and continue</button>
      </form>
    </div>
  );
};

export default WorksOverview;
