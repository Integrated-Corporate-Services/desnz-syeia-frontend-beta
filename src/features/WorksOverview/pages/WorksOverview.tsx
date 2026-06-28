import React, { useState, useEffect, useRef } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { FileUploadResponse } from '../../../types/FileUploadResponse';
import { useNavigate, Link } from 'react-router-dom';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import TextInput from '../component/TextInput';
import NumberInput from '../component/NumberInput';
import RadioGroup from '../component/RadioGroup';
import TextArea from '../component/TextArea';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { createWorksOverview, updateWorksOverview, getWorksOverview } from '../../../services/worksOverviewApiService';
import { WORKS_OVERVIEW_VALIDATION_MESSAGES } from '../../../constants/workOverviewError';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import SkipLink from '../../../components/SkipLink';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { buildWorksOverviewPayload } from '../utils/buildWorksOverviewPayload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { WORKS_OVERVIEW_QUESTIONS } from '../../../constants/worksOverviewLabels';

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
  roadClosuresDetails: '',
  tallestNewPoleHeight: '',
  excavationRequired: '',
  excavationDetails: '',
  vegetationClearanceRequired: '',
  vegetationClearanceDetails: '',
  removingExistingEquipment: '',
  removalDescription: '',
  generalComments: ''
};

type FormErrors = Partial<Record<keyof typeof initialState, string>>;

const WorksOverview: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingRoadClosureFiles, setPendingRoadClosureFiles] = useState<File[]>([]);
  const roadClosuresUploadRef = useRef<FileUploadHandle>(null);
  // Remove asset store usage for works overview
  const navigate = useNavigate();
  // Ref for first error field
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  const resetFormState = () => {
    setForm(initialState);
    setErrors({});
    setSubmitted(false);
    setIsEditMode(false);
    setUploadedFiles([]);
    setApplicationDocuments([]);
    setPendingRoadClosureFiles([]);
  };
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
              addingOrReplacingPoles: data.addingOrReplacingPoles != null ? (data.addingOrReplacingPoles ? 'yes' : 'no') : '',
              poleMaterial: data.poleMaterial || '',
              chemicalTreatments: data.chemicalTreatments || '',
              polesAdded: data.polesAdded !== undefined ? data.polesAdded.toString() : '',
              polesReplaced: data.polesReplaced !== undefined ? data.polesReplaced.toString() : '',
              poleComments: data.poleComments || '',
              addingOrReplacingLines: data.addingOrReplacingLines != null ? (data.addingOrReplacingLines ? 'yes' : 'no') : '',
              overheadLineDescription: data.overheadLineDescription || '',
              estimatedDuration: data.estimatedDuration || '',
              vehiclesRequired: data.vehiclesRequired || '',
              roadClosuresRequired: data.roadClosuresRequired != null ? (data.roadClosuresRequired ? 'yes' : 'no') : '',
              roadClosuresDetails: data.roadClosuresDetails || '',
              tallestNewPoleHeight: data.tallestNewPoleHeight !== undefined && data.tallestNewPoleHeight !== null ? data.tallestNewPoleHeight.toString() : '',
              excavationRequired: data.excavationRequired != null ? (data.excavationRequired ? 'yes' : 'no') : '',
              excavationDetails: data.excavationDetails || '',
              vegetationClearanceRequired: data.vegetationClearanceRequired != null ? (data.vegetationClearanceRequired ? 'yes' : 'no') : '',
              vegetationClearanceDetails: data.vegetationClearanceDetails || '',
              removingExistingEquipment: data.removingExistingEquipment ? 'yes' : 'no',
              removalDescription: data.removalDescription || '',
              generalComments: data.generalComments || ''
            });
            if (Array.isArray(data.uploadedFiles)) {
              const mappedFiles = data.uploadedFiles.map((file: UploadedFile & { file_id?: string }) => ({
                ...file,
                id: file.id || file.file_id || '',
              }));
              const mappedDocuments = Array.isArray(data.applicationDocuments)
                ? data.applicationDocuments.map((doc: ApplicationDocument & { file_id?: string; document_id?: string }) => ({
                    ...doc,
                    fileId: doc.fileId || doc.file_id || '',
                    documentId: doc.documentId || doc.document_id || '',
                  }))
                : [];
              setUploadedFiles(mappedFiles);
              setApplicationDocuments(mappedDocuments);
            } else if (Array.isArray(data.applicationDocuments)) {
              setApplicationDocuments(
                data.applicationDocuments.map((doc: ApplicationDocument & { file_id?: string; document_id?: string }) => ({
                  ...doc,
                  fileId: doc.fileId || doc.file_id || '',
                  documentId: doc.documentId || doc.document_id || '',
                })),
              );
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


    if (submitted && errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
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
    // Map form data to backend expected payload - clear dependent fields based on radio selection
    const worksOverviewPayload = {
      addingOrReplacingPoles: form.addingOrReplacingPoles === '' ? null : form.addingOrReplacingPoles === 'yes',
      addingOrReplacingLines: form.addingOrReplacingLines === '' ? null : form.addingOrReplacingLines === 'yes',
      poleMaterial: form.addingOrReplacingPoles === 'yes' ? form.poleMaterial : '',
      chemicalTreatments: form.addingOrReplacingPoles === 'yes' ? form.chemicalTreatments : '',
      polesAdded: form.addingOrReplacingPoles === 'yes' ? (parseInt(form.polesAdded) || 0) : 0,
      polesReplaced: form.addingOrReplacingPoles === 'yes' ? (parseInt(form.polesReplaced) || 0) : 0,
      poleComments: form.addingOrReplacingPoles === 'yes' ? form.poleComments : '',
      overheadLineDescription: form.addingOrReplacingLines === 'yes' ? form.overheadLineDescription : '',
      estimatedDuration: form.addingOrReplacingLines === 'yes' ? form.estimatedDuration : '',
      vehiclesRequired: form.addingOrReplacingLines === 'yes' ? form.vehiclesRequired : '',
      roadClosuresRequired: form.addingOrReplacingLines === 'yes' ? (form.roadClosuresRequired === '' ? null : form.roadClosuresRequired === 'yes') : null,
      excavationRequired: form.excavationRequired === '' ? null : form.excavationRequired === 'yes',
      excavationDetails: form.excavationRequired === 'yes' ? form.excavationDetails : '',
      vegetationClearanceRequired: form.vegetationClearanceRequired === '' ? null : form.vegetationClearanceRequired === 'yes',
      vegetationClearanceDetails: form.vegetationClearanceRequired === 'yes' ? form.vegetationClearanceDetails : '',
      // accessRouteFiles: (form.accessRouteFiles || []).map(f => ({
      //   url: f.url,
      //   name: f.filename || '',
      //   size: typeof f.fileSize === 'number' ? f.fileSize : 0
      // })),
      removingExistingEquipment: form.removingExistingEquipment === '' ? null : form.removingExistingEquipment === 'yes',
      removalDescription: form.removingExistingEquipment === 'yes' ? form.removalDescription : '',
      generalComments: form.generalComments || ''
    };

    try {
      if (form.roadClosuresRequired === 'yes') {
        await roadClosuresUploadRef.current?.triggerUpload();
      }
    } catch {
      setErrors({ generalComments: 'Failed to upload files. Please try again.' });
      return;
    }

    const payload = buildWorksOverviewPayload(form, effectiveApplicationId);

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

  const getDocumentFileId = (doc: ApplicationDocument & { file_id?: string }) =>
    doc.fileId || doc.file_id || '';

  const getFilesForCategory = (categories: string[]) => {
    const docs = applicationDocuments.filter((doc) => doc.category && categories.includes(doc.category));
    const fileIds = new Set(docs.map(getDocumentFileId).filter(Boolean));
    const files = uploadedFiles.filter((file) => fileIds.has(file.id));
    return { docs, files };
  };

  const renderWorksFileUpload = (
    categories: string[],
    storageCategory: string,
    uploadRef: React.RefObject<FileUploadHandle | null>,
    uploadLabel: string,
    onPendingFilesChange: (files: File[]) => void,
  ) => {
    const { docs: categoryDocuments, files: categoryUploadedFiles } = getFilesForCategory(categories);
    const hasUploadedDocuments = categoryUploadedFiles.length > 0;

    return (
      <div className="govuk-form-group govuk-!-width-two-thirds">
        {hasUploadedDocuments && (
          <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Documents uploaded</h3>
        )}
        <FileUpload
          ref={uploadRef}
          title={uploadLabel}
          showTitle={true}
          uploadImmediately={true}
          prefix={`${effectiveApplicationId}/${storageCategory}`}
          uploadedFiles={categoryUploadedFiles}
          applicationDocuments={categoryDocuments}
          applicationId={effectiveApplicationId}
          category={storageCategory}
          onUploaded={(newUploadedFiles, newDocuments) => {
            setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
            setApplicationDocuments(prev => [...prev, ...newDocuments]);
          }}
          onDeleteFile={(fileId) => {
            setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
            setApplicationDocuments(prev =>
              prev.filter(doc => getDocumentFileId(doc) !== fileId),
            );
          }}
          onPendingFilesChange={onPendingFilesChange}
        />
      </div>
    );
  };

  const renderRoadClosuresUpload = () => renderWorksFileUpload(
    [FILE_CATEGORIES.WORKS_ROAD_CLOSURES],
    FILE_CATEGORIES.WORKS_ROAD_CLOSURES,
    roadClosuresUploadRef,
    WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES_DOCUMENTS,
    setPendingRoadClosureFiles,
  );

  return (
    <>
      <SkipLink />
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
          </RadioGroup>
        </div>

        <div className={`govuk-form-group govuk-!-width-two-thirds${errors.estimatedDuration ? ' govuk-form-group--error' : ''} govuk-!-margin-bottom-6`}>
          <TextInput
            id="estimatedDuration"
            name="estimatedDuration"
            label={WORKS_OVERVIEW_QUESTIONS.ESTIMATED_DURATION}
            labelClassName="govuk-!-font-weight-bold"
            value={form.estimatedDuration}
            onChange={handleChange}
            error={errors.estimatedDuration}
          />
        </div>

        <div className={`govuk-form-group govuk-!-width-two-thirds${errors.vehiclesRequired ? ' govuk-form-group--error' : ''} govuk-!-margin-bottom-6`}>
          <TextInput
            id="vehiclesRequired"
            name="vehiclesRequired"
            label={WORKS_OVERVIEW_QUESTIONS.VEHICLES_REQUIRED}
            labelClassName="govuk-!-font-weight-bold"
            value={form.vehiclesRequired}
            onChange={handleChange}
            error={errors.vehiclesRequired}
          />
        </div>

        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="roadClosuresRequired"
            label={WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES}
            name="roadClosuresRequired"
            value={form.roadClosuresRequired}
            error={errors.roadClosuresRequired}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className="govuk-!-width-two-thirds">
              <TextArea
                id="roadClosuresDetails"
                name="roadClosuresDetails"
                label={WORKS_OVERVIEW_QUESTIONS.ROAD_CLOSURES_DETAILS}
                value={form.roadClosuresDetails}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.roadClosuresDetails}
              />
            </div>
            {renderRoadClosuresUpload()}
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
    </>
  );
};

export default WorksOverview;
