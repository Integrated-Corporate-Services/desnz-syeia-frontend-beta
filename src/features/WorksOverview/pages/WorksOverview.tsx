import React, { useState, useEffect, useRef } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { useNavigate, Link } from 'react-router-dom';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import TextInput from '../component/TextInput';
import NumberInput from '../component/NumberInput';
import RadioGroup from '../component/RadioGroup';
import TextArea from '../component/TextArea';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { createWorksOverview, updateWorksOverview, getWorksOverview } from '../../../services/worksOverviewApiService';
import { WORKS_OVERVIEW_VALIDATION_MESSAGES } from '../../../constants/workOverviewError';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';

const initialState = {
  addingOrReplacingPoles: '',
  poleMaterial: '',
  chemicalTreatments: '',
  polesAdded: '',
  polesReplaced: '',
  tallestNewPoleHeight: '',
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
  removingExistingEquipment: '',
  removalDescription: '',
  generalComments: ''
};

type FormErrors = Partial<Record<keyof typeof initialState, string>>;

type AccessRouteBranch = 'existing' | 'proposed';

const ACCESS_ROUTE_CATEGORIES: Record<AccessRouteBranch, string> = {
  existing: FILE_CATEGORIES.WORKS_PRE_EXISTING_ACCESS_ROUTES,
  proposed: FILE_CATEGORIES.WORKS_PROPOSED_ACCESS_ROUTES,
};

const LEGACY_ACCESS_ROUTE_CATEGORY = FILE_CATEGORIES.WORKS_ACCESS_ROUTES;

const WorksOverview: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingPreExistingAccessRouteFiles, setPendingPreExistingAccessRouteFiles] = useState<File[]>([]);
  const [pendingProposedAccessRouteFiles, setPendingProposedAccessRouteFiles] = useState<File[]>([]);
  const preExistingAccessRouteUploadRef = useRef<FileUploadHandle>(null);
  const proposedAccessRouteUploadRef = useRef<FileUploadHandle>(null);
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
  const applicationId = useGetApplicationId();
 
 
  const effectiveApplicationId = applicationId;

  // Clear form when applicationId changes
  useEffect(() => {
    setForm(initialState);
  }, [effectiveApplicationId]);

  // Fetch works overview details on mount
  useEffect(() => {
    async function fetchWorksOverview() {
      if (effectiveApplicationId) {
        try {
          const data = await getWorksOverview(effectiveApplicationId);
          // Check if we have data and it belongs to current application (more flexible validation)
          if (data && (data.application_id === effectiveApplicationId || data.applicationId === effectiveApplicationId)) {
            setForm({
              addingOrReplacingPoles: data.addingOrReplacingPoles ? 'yes' : 'no',
              poleMaterial: data.poleMaterial || '',
              chemicalTreatments: data.chemicalTreatments || '',
              polesAdded: data.polesAdded !== undefined ? data.polesAdded.toString() : '',
              polesReplaced: data.polesReplaced !== undefined ? data.polesReplaced.toString() : '',
              tallestNewPoleHeight: data.tallestNewPoleHeight !== undefined && data.tallestNewPoleHeight !== null
                ? data.tallestNewPoleHeight.toString()
                : '',
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
              removingExistingEquipment: data.removingExistingEquipment ? 'yes' : 'no',
              removalDescription: data.removalDescription || '',
              generalComments: data.generalComments || ''
            });
            if (Array.isArray(data.uploadedFiles)) {
              setUploadedFiles(data.uploadedFiles);
            }
            if (Array.isArray(data.applicationDocuments)) {
              setApplicationDocuments(data.applicationDocuments);
            }
            setIsEditMode(true);
          } else if (data === null || data === undefined) {
            // No data found for this application - reset to initial state
            setForm(initialState);
            setIsEditMode(false);
          } else {
            // Data found but doesn't match current application
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
      newErrors.addingOrReplacingPoles = WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_POLES_REQUIRED;
    } else if (data.addingOrReplacingPoles === 'yes') {
      if (!data.poleMaterial.trim()) newErrors.poleMaterial = WORKS_OVERVIEW_VALIDATION_MESSAGES.POLE_MATERIAL_REQUIRED;
      if (!data.chemicalTreatments.trim()) newErrors.chemicalTreatments = WORKS_OVERVIEW_VALIDATION_MESSAGES.CHEMICAL_TREATMENTS_REQUIRED;
      
      // Validate polesAdded
      if (!data.polesAdded.trim()) {
        newErrors.polesAdded = WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_ADDED_REQUIRED;
      } else if (!/^[a-zA-Z0-9]+$/.test(data.polesAdded.trim())) {
        newErrors.polesAdded = WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_ADDED_FORMAT;
      }
      
      // Validate polesReplaced
      if (!data.polesReplaced.trim()) {
        newErrors.polesReplaced = WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_REPLACED_REQUIRED;
      } else if (!/^[a-zA-Z0-9]+$/.test(data.polesReplaced.trim())) {
        newErrors.polesReplaced = WORKS_OVERVIEW_VALIDATION_MESSAGES.POLES_REPLACED_FORMAT;
      }
      
      // Validate poleComments
      if (!data.poleComments.trim()) {
        newErrors.poleComments = WORKS_OVERVIEW_VALIDATION_MESSAGES.POLE_COMMENTS_REQUIRED;
      }

      // Validate tallestNewPoleHeight
      if (!data.tallestNewPoleHeight.trim()) {
        newErrors.tallestNewPoleHeight = WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_REQUIRED;
      } else {
        const heightVal = data.tallestNewPoleHeight.trim();
        const num = Number(heightVal);
        if (Number.isNaN(num)) {
          newErrors.tallestNewPoleHeight = WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_INVALID;
        } else if (num < 0) {
          newErrors.tallestNewPoleHeight = WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_NEGATIVE;
        } else if (num > 9999) {
          newErrors.tallestNewPoleHeight = WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_TOO_LARGE;
        } else if (!/^\d+(\.\d{1,2})?$/.test(heightVal)) {
          newErrors.tallestNewPoleHeight = WORKS_OVERVIEW_VALIDATION_MESSAGES.TALLEST_NEW_POLE_HEIGHT_DECIMAL_PLACES;
        }
      }
    }
    if (!data.addingOrReplacingLines) {
      newErrors.addingOrReplacingLines = WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_LINES_REQUIRED;
    } else if (data.addingOrReplacingLines === 'yes') {
      if (!data.overheadLineDescription.trim()) newErrors.overheadLineDescription = WORKS_OVERVIEW_VALIDATION_MESSAGES.OVERHEAD_LINE_DESCRIPTION_REQUIRED;
      if (!data.estimatedDuration.trim()) newErrors.estimatedDuration = WORKS_OVERVIEW_VALIDATION_MESSAGES.ESTIMATED_DURATION_REQUIRED;
      if (!data.vehiclesRequired.trim()) newErrors.vehiclesRequired = WORKS_OVERVIEW_VALIDATION_MESSAGES.VEHICLES_REQUIRED_REQUIRED;
      if (!data.roadClosuresRequired) newErrors.roadClosuresRequired = WORKS_OVERVIEW_VALIDATION_MESSAGES.ROAD_CLOSURES_REQUIRED;
    }
    if (!data.excavationRequired) {
      newErrors.excavationRequired = WORKS_OVERVIEW_VALIDATION_MESSAGES.EXCAVATION_REQUIRED;
    } else if (data.excavationRequired === 'yes') {
      if (!data.excavationDetails.trim()) newErrors.excavationDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.EXCAVATION_DETAILS_REQUIRED;
    }
    if (!data.vegetationClearanceRequired) {
      newErrors.vegetationClearanceRequired = WORKS_OVERVIEW_VALIDATION_MESSAGES.VEGETATION_CLEARANCE_REQUIRED;
    } else if (data.vegetationClearanceRequired === 'yes') {
      if (!data.vegetationClearanceDetails.trim()) newErrors.vegetationClearanceDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.VEGETATION_CLEARANCE_DETAILS_REQUIRED;
    }
    if (!data.usingExistingAccessRoutes) {
      newErrors.usingExistingAccessRoutes = WORKS_OVERVIEW_VALIDATION_MESSAGES.USING_EXISTING_ACCESS_ROUTES_REQUIRED;
    } else if (data.usingExistingAccessRoutes === 'yes') {
      if (!data.accessRoutesDetails.trim()) {
        newErrors.accessRoutesDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.ACCESS_ROUTES_DETAILS_REQUIRED;
      }
    } else if (data.usingExistingAccessRoutes === 'no') {
      if (!data.accessRoutesDetails.trim()) {
        newErrors.accessRoutesDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.PROPOSED_ACCESS_ROUTES_DETAILS_REQUIRED;
      }
    }
    if (!data.removingExistingEquipment) {
      newErrors.removingExistingEquipment = WORKS_OVERVIEW_VALIDATION_MESSAGES.REMOVING_EXISTING_EQUIPMENT_REQUIRED;
    } else if (data.removingExistingEquipment === 'yes') {
      if (!data.removalDescription.trim()) newErrors.removalDescription = WORKS_OVERVIEW_VALIDATION_MESSAGES.REMOVAL_DESCRIPTION_REQUIRED;
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

    const activeUploadRef = form.usingExistingAccessRoutes === 'yes'
      ? preExistingAccessRouteUploadRef
      : proposedAccessRouteUploadRef;
    const activePendingFiles = form.usingExistingAccessRoutes === 'yes'
      ? pendingPreExistingAccessRouteFiles
      : pendingProposedAccessRouteFiles;

    if (activeUploadRef.current && activePendingFiles.length > 0) {
      try {
        const uploadResult = await activeUploadRef.current.triggerUpload();
        if (uploadResult.uploadedFiles.length > 0) {
          setUploadedFiles(prev => [...prev, ...uploadResult.uploadedFiles]);
          setApplicationDocuments(prev => [...prev, ...uploadResult.applicationDocuments]);
        }
      } catch {
        setErrors({ accessRoutesDetails: 'Failed to upload access route files. Please try again.' });
        return;
      }
    }

    // Map form data to backend expected payload: { applicationId, worksOverview: { ...fields... } }
    const worksOverviewPayload = {
      addingOrReplacingPoles: form.addingOrReplacingPoles === 'yes',
      addingOrReplacingLines: form.addingOrReplacingLines === 'yes',
      poleMaterial: form.poleMaterial || '',
      chemicalTreatments: form.chemicalTreatments || '',
      polesAdded: parseInt(form.polesAdded) || 0,
      polesReplaced: parseInt(form.polesReplaced) || 0,
      tallestNewPoleHeight: form.addingOrReplacingPoles === 'yes'
        ? parseFloat(form.tallestNewPoleHeight) || 0
        : null,
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
      // Navigate to the next page in the task list sequence
      const nextPageUrl = getNextPageUrl(TASK_NAMES.WORKS_OVERVIEW, effectiveApplicationId);
      navigate(nextPageUrl);
    } catch (err: unknown) {
      let errorMsg = ASSET_ERROR_MESSAGES.generalCommentsFailed;
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        errorMsg = (err as { message: string }).message;
      }
      setErrors({ generalComments: errorMsg });
    }
  };

  const getAccessRouteFileData = (branch: AccessRouteBranch) => {
    const branchCategories = branch === 'existing'
      ? [ACCESS_ROUTE_CATEGORIES.existing, LEGACY_ACCESS_ROUTE_CATEGORY]
      : [ACCESS_ROUTE_CATEGORIES.proposed];

    const accessRouteDocuments = applicationDocuments.filter(
      doc => branchCategories.includes(doc.category)
    );
    const accessRouteFileIds = new Set(accessRouteDocuments.map(doc => doc.fileId));
    const accessRouteUploadedFiles = uploadedFiles.filter(file => accessRouteFileIds.has(file.id));
    return {
      accessRouteDocuments,
      accessRouteUploadedFiles,
      category: ACCESS_ROUTE_CATEGORIES[branch],
    };
  };

  const renderAccessRouteUpload = (branch: AccessRouteBranch, uploadLabel: string) => {
    const { accessRouteDocuments, accessRouteUploadedFiles, category } = getAccessRouteFileData(branch);
    const hasUploadedDocuments = accessRouteUploadedFiles.length > 0;
    const uploadRef = branch === 'existing' ? preExistingAccessRouteUploadRef : proposedAccessRouteUploadRef;
    const onPendingFilesChange = branch === 'existing'
      ? setPendingPreExistingAccessRouteFiles
      : setPendingProposedAccessRouteFiles;

    return (
      <div className="govuk-form-group" style={{ maxWidth: 600 }}>
        {hasUploadedDocuments && (
          <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Documents uploaded</h3>
        )}
        <FileUpload
          ref={uploadRef}
          title={uploadLabel}
          showTitle={true}
          showDocumentsHeading={false}
          uploadImmediately={true}
          prefix={`${effectiveApplicationId}/${category}`}
          uploadedFiles={accessRouteUploadedFiles}
          applicationDocuments={accessRouteDocuments}
          applicationId={effectiveApplicationId}
          category={category}
          onUploaded={(newUploadedFiles, newDocuments) => {
            setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
            setApplicationDocuments(prev => [...prev, ...newDocuments]);
          }}
          onDeleteFile={(fileId) => {
            setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
            setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
          }}
          onPendingFilesChange={onPendingFilesChange}
        />
      </div>
    );
  };

  return (
  <div className="govuk-width-container">
<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Works Overview</li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {submitted && Object.keys(errors).length > 0 && (
          <div className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
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
        <form className="govuk-!-margin-bottom-6" onSubmit={handleSubmit} noValidate>
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
            <div className={`govuk-form-group${errors.tallestNewPoleHeight ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <NumberInput
                id="tallestNewPoleHeight"
                name="tallestNewPoleHeight"
                label="What is the height of the tallest new pole?"
                hint="If none, enter 0."
                suffix="metres"
                value={form.tallestNewPoleHeight}
                onChange={handleChange}
                error={errors.tallestNewPoleHeight}
              />
            </div>
            <div className={`govuk-form-group${errors.poleComments ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="poleComments"
                name="poleComments"
                label="Comments on poles being added or replaced"
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
            noChildren={
              <>
                <div className={`govuk-form-group${errors.accessRoutesDetails ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
                  <TextArea
                    id="accessRoutesDetails"
                    name="accessRoutesDetails"
                    label="Provide more details about the proposed access routes and storage sites"
                    value={form.accessRoutesDetails}
                    onChange={handleChange}
                    maxLength={4000}
                    showCount
                    error={errors.accessRoutesDetails}
                  />
                </div>
                {renderAccessRouteUpload('proposed', 'Upload map and photos of proposed routes and storage sites')}
              </>
            }
          >
            <div className={`govuk-form-group${errors.accessRoutesDetails ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 600 }}>
              <TextArea
                id="accessRoutesDetails"
                name="accessRoutesDetails"
                label="Provide more details about the pre-existing access routes and storage sites"
                value={form.accessRoutesDetails}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.accessRoutesDetails}
              />
            </div>
            {renderAccessRouteUpload('existing', 'Upload map and photos of pre-existing routes and storage sites')}
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

        <button type="submit" className="govuk-button">Save and continue</button>
      </form>
    </main>
  </div>
  );
};

export default WorksOverview;
