import React, { useState, useEffect,useRef } from 'react';
import { FileUploadResponse } from '../../../types/FileUploadResponse';
import { useApplicationStore } from '../../../store/useApplicationStore';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import TextInput from '../component/TextInput';
import NumberInput from '../component/NumberInput';
import RadioGroup from '../component/RadioGroup';
import TextArea from '../component/TextArea';
import FileUploadBox from '../../../components/FileUploadBox';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { createWorksOverview, updateWorksOverview, getWorksOverview } from '../../../services/worksOverviewApiService';

const initialState = {
  addingOrReplacingPoles: '',
  poleMaterial: '',
  chemicalTreatments: '',
  polesAdded: '',
  polesReplaced: '',
  poleComments: '',
  addingOrReplacingLines: '',
  overheadLineDescription: '',
  estimatedDuration: '',
  vehiclesRequired: '',
  roadClosuresRequired: '',
  excavationRequired: '',
  excavationDetails: '',
  vegetationClearanceRequired: '',
  vegetationClearanceDetails: '',
  usingExistingAccessRoutes: '',
  accessRoutesDetails: '',
  accessRouteFiles: [] as FileUploadResponse[], // For uploaded files
  removingExistingEquipment: '',
  removalDescription: '',
  generalComments: ''
};

type FormErrors = Partial<Record<keyof typeof initialState, string>>;

const WorksOverview: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // New state to track edit mode
  // Remove asset store usage for works overview
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
  const location = useLocation();
  const application = useApplicationStore((state) => state.application);
  // Helper to get applicationId from store, params, or query string
  const getApplicationId = () => {
    if (application && application.application_id)
      return application.application_id;
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };
  const applicationId = getApplicationId();
 
 
  const effectiveApplicationId = applicationId;


  // Fetch works overview details on mount
  useEffect(() => {
    async function fetchWorksOverview() {
      if (effectiveApplicationId) {
        try {
          const data = await getWorksOverview(effectiveApplicationId);
          if (data) {
            setForm({
              addingOrReplacingPoles: data.addingOrReplacingPoles ? 'yes' : 'no',
              poleMaterial: data.poleMaterial || '',
              chemicalTreatments: data.chemicalTreatments || '',
              polesAdded: data.polesAdded !== undefined ? data.polesAdded.toString() : '',
              polesReplaced: data.polesReplaced !== undefined ? data.polesReplaced.toString() : '',
              poleComments: data.poleComments || '',
              addingOrReplacingLines: data.addingOrReplacingLines ? 'yes' : 'no',
              overheadLineDescription: data.overheadLineDescription || '',
              estimatedDuration: data.estimatedDuration || '',
              vehiclesRequired: data.vehiclesRequired || '',
              roadClosuresRequired: data.roadClosuresRequired ? 'yes' : 'no',
              excavationRequired: data.excavationRequired ? 'yes' : 'no',
              excavationDetails: data.excavationDetails || '',
              vegetationClearanceRequired: data.vegetationClearanceRequired ? 'yes' : 'no',
              vegetationClearanceDetails: data.vegetationClearanceDetails || '',
              usingExistingAccessRoutes: data.usingExistingAccessRoutes ? 'yes' : 'no',
              accessRoutesDetails: data.accessRoutesDetails || '',
              accessRouteFiles: [],
              removingExistingEquipment: data.removingExistingEquipment ? 'yes' : 'no',
              removalDescription: data.removalDescription || '',
              generalComments: data.generalComments || ''
            });
            setIsEditMode(true);
          } else {
            setForm(initialState);
            setIsEditMode(false);
          }
        } catch {
          setForm(initialState);
          setIsEditMode(false);
        }
      }
    }
    fetchWorksOverview();
  }, [effectiveApplicationId]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof initialState) => ({ ...prev, [name]: value }));
  };

  const validate = (data: typeof initialState): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.addingOrReplacingPoles) {
      newErrors.addingOrReplacingPoles = 'Select if you are adding or replacing poles.';
    } else if (data.addingOrReplacingPoles === 'yes') {
      if (!data.poleMaterial.trim()) newErrors.poleMaterial = 'Enter pole material.';
      if (!data.chemicalTreatments.trim()) newErrors.chemicalTreatments = 'Enter chemical treatments.';
      if (!data.polesAdded.trim()) newErrors.polesAdded = 'Enter number of poles added.';
      if (!data.polesReplaced.trim()) newErrors.polesReplaced = 'Enter number of poles replaced.';
      if (!data.poleComments.trim()) newErrors.poleComments = 'Enter comments on poles being added or replaced.';
    }
    if (!data.addingOrReplacingLines) {
      newErrors.addingOrReplacingLines = 'Select if you are adding or replacing overhead lines.';
    } else if (data.addingOrReplacingLines === 'yes') {
      if (!data.overheadLineDescription.trim()) newErrors.overheadLineDescription = 'Enter overhead line description.';
      if (!data.estimatedDuration.trim()) newErrors.estimatedDuration = 'Enter estimated duration.';
      if (!data.vehiclesRequired.trim()) newErrors.vehiclesRequired = 'Enter vehicles required.';
      if (!data.roadClosuresRequired) newErrors.roadClosuresRequired = 'Select if road closures are required.';
    }
    if (!data.excavationRequired) {
      newErrors.excavationRequired = 'Select if excavation is required.';
    } else if (data.excavationRequired === 'yes') {
      if (!data.excavationDetails.trim()) newErrors.excavationDetails = 'Enter excavation details.';
    }
    if (!data.vegetationClearanceRequired) {
      newErrors.vegetationClearanceRequired = 'Select if vegetation clearance is required.';
    } else if (data.vegetationClearanceRequired === 'yes') {
      if (!data.vegetationClearanceDetails.trim()) newErrors.vegetationClearanceDetails = 'Enter vegetation clearance details.';
    }
    if (!data.usingExistingAccessRoutes) {
      newErrors.usingExistingAccessRoutes = 'Select if using existing access routes.';
    } else if (data.usingExistingAccessRoutes === 'yes') {
      if (!data.accessRoutesDetails.trim()) newErrors.accessRoutesDetails = 'Enter access routes details.';
    }
    if (!data.removingExistingEquipment) {
      newErrors.removingExistingEquipment = 'Select if removing existing equipment.';
    } else if (data.removingExistingEquipment === 'yes') {
      if (!data.removalDescription.trim()) newErrors.removalDescription = 'Enter removal description.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    // Map form data to backend expected payload: { applicationId, worksOverview: { ...fields... } }
    const worksOverviewPayload = {
      addingOrReplacingPoles: form.addingOrReplacingPoles === 'yes',
      addingOrReplacingLines: form.addingOrReplacingLines === 'yes',
      poleMaterial: form.poleMaterial || '',
      chemicalTreatments: form.chemicalTreatments || '',
      polesAdded: parseInt(form.polesAdded) || 0,
      polesReplaced: parseInt(form.polesReplaced) || 0,
      poleComments: form.poleComments,
      overheadLineDescription: form.overheadLineDescription || '',
      estimatedDuration: form.estimatedDuration || '',
      vehiclesRequired: form.vehiclesRequired || '',
      roadClosuresRequired: form.roadClosuresRequired === 'yes',
      excavationRequired: form.excavationRequired === 'yes',
      excavationDetails: form.excavationDetails || '',
      vegetationClearanceRequired: form.vegetationClearanceRequired === 'yes',
      vegetationClearanceDetails: form.vegetationClearanceDetails || '',
      usingExistingAccessRoutes: form.usingExistingAccessRoutes === 'yes',
      accessRoutesDetails: form.accessRoutesDetails || '',
      // accessRouteFiles: (form.accessRouteFiles || []).map(f => ({
      //   url: f.url,
      //   name: f.filename || '',
      //   size: typeof f.fileSize === 'number' ? f.fileSize : 0
      // })),
      removingExistingEquipment: form.removingExistingEquipment === 'yes',
      removalDescription: form.removalDescription || '',
      generalComments: form.generalComments || ''
    };

    const payload = {
      applicationId: effectiveApplicationId,
      worksOverview: worksOverviewPayload
    };

    try {
      // Always use updateWorksOverview for PUT, createWorksOverview for POST
      if (isEditMode) {
        await updateWorksOverview(effectiveApplicationId, payload);
      } else {
        await createWorksOverview(payload);
      }
      navigate(`/task-list?id=${effectiveApplicationId}`);
    } catch (err: unknown) {
      let errorMsg = ASSET_ERROR_MESSAGES.generalCommentsFailed;
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        errorMsg = (err as { message: string }).message;
      }
      setErrors({ generalComments: errorMsg });
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
            id="addingOrReplacingPoles"
            label="Are you adding or replacing any poles?"
            name="addingOrReplacingPoles"
            value={form.addingOrReplacingPoles}
            error={errors.addingOrReplacingPoles}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group${errors.poleMaterial ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextInput
                id="poleMaterial"
                name="poleMaterial"
                label="What materials will be used for the new poles/pylons?"
                value={form.poleMaterial}
                onChange={handleChange}
                error={errors.poleMaterial}
              />
            </div>
            <div className={`govuk-form-group${errors.chemicalTreatments ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextInput
                id="chemicalTreatments"
                name="chemicalTreatments"
                label="Are any chemical treatments proposed?"
                value={form.chemicalTreatments}
                onChange={handleChange}
                error={errors.chemicalTreatments}
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
            <div className={`govuk-form-group${errors.poleComments ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="poleComments"
                name="poleComments"
                label="Comments on poles being added or replaced (optional)"
                value={form.poleComments}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.poleComments}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Adding or replacing overhead lines */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="addingOrReplacingLines"
            label="Are you adding or replacing any overhead lines?"
            name="addingOrReplacingLines"
            value={form.addingOrReplacingLines}
            error={errors.addingOrReplacingLines}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <h3 className="govuk-heading-s">Provide a description of the overhead lines that you are adding or replacing</h3>
            <div className={`govuk-form-group${errors.overheadLineDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="overheadLineDescription"
                name="overheadLineDescription"
                label="Description of the overhead lines"
                value={form.overheadLineDescription}
                onChange={handleChange}
                error={errors.overheadLineDescription}
                maxLength={4000}
                showCount
              />
            </div>
            <div className={`govuk-form-group${errors.estimatedDuration ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextInput
                id="estimatedDuration"
                name="estimatedDuration"
                label="Estimated duration of the works"
                value={form.estimatedDuration}
                onChange={handleChange}
                error={errors.estimatedDuration}
              />
            </div>
            <div className={`govuk-form-group${errors.vehiclesRequired ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextInput
                id="vehiclesRequired"
                name="vehiclesRequired"
                label="Vehicles required on site"
                value={form.vehiclesRequired}
                onChange={handleChange}
                error={errors.vehiclesRequired}
              />
            </div>
            <div className={`govuk-form-group${errors.roadClosuresRequired ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <RadioGroup
                id="roadClosuresRequired"
                label="Will any road closures or traffic calming measures be required?"
                name="roadClosuresRequired"
                value={form.roadClosuresRequired}
                error={errors.roadClosuresRequired}
                onChange={handleChange}
                options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
              />
            </div>
          </RadioGroup>
        </div>



        {/* Excavation works */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="excavationRequired"
            label="Are excavation works required?"
            name="excavationRequired"
            value={form.excavationRequired}
            error={errors.excavationRequired}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group${errors.excavationDetails ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="excavationDetails"
                name="excavationDetails"
                label="Provide more details about the excavation works"
                value={form.excavationDetails}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.excavationDetails}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Vegetation clearance */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="vegetationClearanceRequired"
            label="Is vegetation clearance required?"
            name="vegetationClearanceRequired"
            value={form.vegetationClearanceRequired}
            error={errors.vegetationClearanceRequired}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group${errors.vegetationClearanceDetails ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="vegetationClearanceDetails"
                name="vegetationClearanceDetails"
                label="Provide more details about the vegetation clearance"
                value={form.vegetationClearanceDetails}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.vegetationClearanceDetails}
              />
            </div>
          </RadioGroup>
        </div>

        {/* Pre-existing access routes */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="usingExistingAccessRoutes"
            label="Are you using pre-existing access routes and/or storage sites?"
            name="usingExistingAccessRoutes"
            value={form.usingExistingAccessRoutes}
            error={errors.usingExistingAccessRoutes}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group${errors.accessRoutesDetails ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="accessRoutesDetails"
                name="accessRoutesDetails"
                label="Provide more details about the pre-existing access routes and/or storage sites"
                value={form.accessRoutesDetails}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.accessRoutesDetails}
              />
            </div>
            {/* File upload for access route map/photos */}
            {/* <div className="govuk-form-group" style={{ maxWidth: 600 }}>
              <label className="govuk-label">Upload map and photos of the Access Route.</label>
              <FileUploadBox
                title="Upload map and photos of the Access Route."
                prefix="access-route"
                onUploadComplete={(files: FileUploadResponse[]) => setForm(prev => ({ ...prev, accessRouteFiles: files }))}
              />
            </div> */}
          </RadioGroup>
        </div>

        {/* Removing existing equipment */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="removingExistingEquipment"
            label="Are you removing existing equipment?"
            name="removingExistingEquipment"
            value={form.removingExistingEquipment}
            error={errors.removingExistingEquipment}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group${errors.removalDescription ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="removalDescription"
                name="removalDescription"
                label="Provide more details about the equipment removal"
                value={form.removalDescription}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.removalDescription}
              />
            </div>
          </RadioGroup>
        </div>

        {/* General comments */}
        <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
          <TextArea
            id="generalComments"
            name="generalComments"
            label="General comments (optional)"
            hint="Are you carrying out any additional work to any assets on this route that is not covered above?"
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
