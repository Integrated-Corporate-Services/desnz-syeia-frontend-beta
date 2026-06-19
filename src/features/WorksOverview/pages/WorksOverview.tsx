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
import { WORKS_OVERVIEW_QUESTIONS } from '../../../constants/worksOverviewLabels';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import { buildWorksOverviewPayload } from '../utils/buildWorksOverviewPayload';

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
  roadClosuresDetails: '',
  excavationRequired: '',
  excavationDetails: '',
  vegetationClearanceRequired: '',
  vegetationClearanceDetails: '',
  usingExistingAccessRoutes: '',
  existingAccessRoutesDetails: '',
  proposedAccessRoutesDetails: '',
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
  const [pendingRoadClosureFiles, setPendingRoadClosureFiles] = useState<File[]>([]);
  const preExistingAccessRouteUploadRef = useRef<FileUploadHandle>(null);
  const proposedAccessRouteUploadRef = useRef<FileUploadHandle>(null);
  const roadClosuresUploadRef = useRef<FileUploadHandle>(null);
  // Remove asset store usage for works overview
  const navigate = useNavigate();

  const resetFormState = () => {
    setForm(initialState);
    setErrors({});
    setSubmitted(false);
    setIsEditMode(false);
    setUploadedFiles([]);
    setApplicationDocuments([]);
    setPendingPreExistingAccessRouteFiles([]);
    setPendingProposedAccessRouteFiles([]);
    setPendingRoadClosureFiles([]);
  };
  const applicationId = useGetApplicationId();
 
 
  const effectiveApplicationId = applicationId;

  // Fetch works overview details on mount / application change
  useEffect(() => {
    let cancelled = false;

    async function fetchWorksOverview() {
      if (!effectiveApplicationId) return;

      resetFormState();

      try {
        const data = await getWorksOverview(effectiveApplicationId);
        if (cancelled) return;

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
              roadClosuresDetails: data.roadClosuresDetails || '',
              excavationRequired: data.excavationRequired ? 'yes' : 'no',
              excavationDetails: data.excavationDetails || '',
              vegetationClearanceRequired: data.vegetationClearanceRequired ? 'yes' : 'no',
              vegetationClearanceDetails: data.vegetationClearanceDetails || '',
              usingExistingAccessRoutes: data.usingExistingAccessRoutes ? 'yes' : 'no',
              existingAccessRoutesDetails: data.usingExistingAccessRoutes
                ? (data.accessRoutesDetails || '')
                : '',
              proposedAccessRoutesDetails: data.usingExistingAccessRoutes
                ? ''
                : (data.accessRoutesDetails || ''),
              removingExistingEquipment: data.removingExistingEquipment ? 'yes' : 'no',
              removalDescription: data.removalDescription || '',
              generalComments: data.generalComments || ''
            });
            if (Array.isArray(data.uploadedFiles)) {
              setUploadedFiles(
                data.uploadedFiles.map((file: UploadedFile & { file_id?: string }) => ({
                  ...file,
                  id: file.id || file.file_id || '',
                })),
              );
            }
            if (Array.isArray(data.applicationDocuments)) {
              setApplicationDocuments(
                data.applicationDocuments.map((doc: ApplicationDocument & { file_id?: string; document_id?: string }) => ({
                  ...doc,
                  fileId: doc.fileId || doc.file_id || '',
                  documentId: doc.documentId || doc.document_id || '',
                })),
              );
            }
            setIsEditMode(true);
          } else {
            setIsEditMode(false);
          }
        } catch {
          if (!cancelled) {
            setIsEditMode(false);
          }
        }
      }

    fetchWorksOverview();

    return () => {
      cancelled = true;
    };
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
      
      // poleComments is optional

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
    if (!data.estimatedDuration.trim()) {
      newErrors.estimatedDuration = WORKS_OVERVIEW_VALIDATION_MESSAGES.ESTIMATED_DURATION_REQUIRED;
    }
    if (!data.vehiclesRequired.trim()) {
      newErrors.vehiclesRequired = WORKS_OVERVIEW_VALIDATION_MESSAGES.VEHICLES_REQUIRED_REQUIRED;
    }
    if (!data.addingOrReplacingLines) {
      newErrors.addingOrReplacingLines = WORKS_OVERVIEW_VALIDATION_MESSAGES.ADDING_OR_REPLACING_LINES_REQUIRED;
    } else if (data.addingOrReplacingLines === 'yes') {
      if (!data.overheadLineDescription.trim()) {
        newErrors.overheadLineDescription = WORKS_OVERVIEW_VALIDATION_MESSAGES.OVERHEAD_LINE_DESCRIPTION_REQUIRED;
      }
    }
    if (!data.roadClosuresRequired) {
      newErrors.roadClosuresRequired = WORKS_OVERVIEW_VALIDATION_MESSAGES.ROAD_CLOSURES_REQUIRED;
    } else if (data.roadClosuresRequired === 'yes') {
      if (!data.roadClosuresDetails.trim()) {
        newErrors.roadClosuresDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.ROAD_CLOSURES_DETAILS_REQUIRED;
      }
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
      if (!data.existingAccessRoutesDetails.trim()) {
        newErrors.existingAccessRoutesDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.ACCESS_ROUTES_DETAILS_REQUIRED;
      }
    } else if (data.usingExistingAccessRoutes === 'no') {
      if (!data.proposedAccessRoutesDetails.trim()) {
        newErrors.proposedAccessRoutesDetails = WORKS_OVERVIEW_VALIDATION_MESSAGES.PROPOSED_ACCESS_ROUTES_DETAILS_REQUIRED;
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const uploadPendingFiles = async (
      uploadRef: React.RefObject<FileUploadHandle | null>,
      pendingFiles: File[]
    ) => {
      if (uploadRef.current && pendingFiles.length > 0) {
        const uploadResult = await uploadRef.current.triggerUpload();
        if (uploadResult.uploadedFiles.length > 0) {
          setUploadedFiles(prev => [...prev, ...uploadResult.uploadedFiles]);
          setApplicationDocuments(prev => [...prev, ...uploadResult.applicationDocuments]);
        }
      }
    };

    try {
      if (form.roadClosuresRequired === 'yes') {
        await uploadPendingFiles(roadClosuresUploadRef, pendingRoadClosureFiles);
      }

      const activeUploadRef = form.usingExistingAccessRoutes === 'yes'
        ? preExistingAccessRouteUploadRef
        : proposedAccessRouteUploadRef;
      const activePendingFiles = form.usingExistingAccessRoutes === 'yes'
        ? pendingPreExistingAccessRouteFiles
        : pendingProposedAccessRouteFiles;
      await uploadPendingFiles(activeUploadRef, activePendingFiles);
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
          inputId={`works-overview-upload-${storageCategory}`}
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

  const renderAccessRouteUpload = (branch: AccessRouteBranch, uploadLabel: string) => {
    const categories = branch === 'existing'
      ? [ACCESS_ROUTE_CATEGORIES.existing, LEGACY_ACCESS_ROUTE_CATEGORY]
      : [ACCESS_ROUTE_CATEGORIES.proposed];
    const uploadRef = branch === 'existing' ? preExistingAccessRouteUploadRef : proposedAccessRouteUploadRef;
    const onPendingFilesChange = branch === 'existing'
      ? setPendingPreExistingAccessRouteFiles
      : setPendingProposedAccessRouteFiles;

    return renderWorksFileUpload(
      categories,
      ACCESS_ROUTE_CATEGORIES[branch],
      uploadRef,
      uploadLabel,
      onPendingFilesChange,
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
            label={WORKS_OVERVIEW_QUESTIONS.ADDING_REPLACING_POLES}
            name="addingOrReplacingPoles"
            value={form.addingOrReplacingPoles}
            error={errors.addingOrReplacingPoles}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.poleMaterial ? ' govuk-form-group--error' : ''}`}>
              <TextInput
                id="poleMaterial"
                name="poleMaterial"
                label={WORKS_OVERVIEW_QUESTIONS.POLE_MATERIAL}
                value={form.poleMaterial}
                onChange={handleChange}
                error={errors.poleMaterial}
              />
            </div>
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.chemicalTreatments ? ' govuk-form-group--error' : ''}`}>
              <TextInput
                id="chemicalTreatments"
                name="chemicalTreatments"
                label={WORKS_OVERVIEW_QUESTIONS.CHEMICAL_TREATMENTS}
                value={form.chemicalTreatments}
                onChange={handleChange}
                error={errors.chemicalTreatments}
              />
            </div>
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.polesAdded ? ' govuk-form-group--error' : ''}`}>
              <NumberInput
                id="polesAdded"
                name="polesAdded"
                label={WORKS_OVERVIEW_QUESTIONS.POLES_ADDED}
                value={form.polesAdded}
                onChange={handleChange}
                error={errors.polesAdded}
              />
            </div>
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.polesReplaced ? ' govuk-form-group--error' : ''}`}>
              <NumberInput
                id="polesReplaced"
                name="polesReplaced"
                label={WORKS_OVERVIEW_QUESTIONS.POLES_REPLACED}
                value={form.polesReplaced}
                onChange={handleChange}
                error={errors.polesReplaced}
              />
            </div>
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.tallestNewPoleHeight ? ' govuk-form-group--error' : ''}`}>
              <NumberInput
                id="tallestNewPoleHeight"
                name="tallestNewPoleHeight"
                label={WORKS_OVERVIEW_QUESTIONS.TALLEST_NEW_POLE_HEIGHT}
                suffix="metres"
                value={form.tallestNewPoleHeight}
                onChange={handleChange}
                error={errors.tallestNewPoleHeight}
              />
            </div>
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.poleComments ? ' govuk-form-group--error' : ''}`}>
              <TextArea
                id="poleComments"
                name="poleComments"
                label={WORKS_OVERVIEW_QUESTIONS.POLE_COMMENTS}
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
            label={WORKS_OVERVIEW_QUESTIONS.ADDING_REPLACING_LINES}
            name="addingOrReplacingLines"
            value={form.addingOrReplacingLines}
            error={errors.addingOrReplacingLines}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.overheadLineDescription ? ' govuk-form-group--error' : ''}`}>
              <TextArea
                id="overheadLineDescription"
                name="overheadLineDescription"
                label={WORKS_OVERVIEW_QUESTIONS.OVERHEAD_LINE_DESC}
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
            label={WORKS_OVERVIEW_QUESTIONS.EXCAVATION_REQUIRED}
            hint={WORKS_OVERVIEW_QUESTIONS.EXCAVATION_HINT}
            name="excavationRequired"
            value={form.excavationRequired}
            error={errors.excavationRequired}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.excavationDetails ? ' govuk-form-group--error' : ''}`}>
              <TextArea
                id="excavationDetails"
                name="excavationDetails"
                label={WORKS_OVERVIEW_QUESTIONS.EXCAVATION_DETAILS}
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
            label={WORKS_OVERVIEW_QUESTIONS.VEGETATION_CLEARANCE}
            hint={WORKS_OVERVIEW_QUESTIONS.VEGETATION_HINT}
            name="vegetationClearanceRequired"
            value={form.vegetationClearanceRequired}
            error={errors.vegetationClearanceRequired}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.vegetationClearanceDetails ? ' govuk-form-group--error' : ''}`}>
              <TextArea
                id="vegetationClearanceDetails"
                name="vegetationClearanceDetails"
                label={WORKS_OVERVIEW_QUESTIONS.VEGETATION_DETAILS}
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
            label={WORKS_OVERVIEW_QUESTIONS.EXISTING_ACCESS_ROUTES}
            name="usingExistingAccessRoutes"
            value={form.usingExistingAccessRoutes}
            error={errors.usingExistingAccessRoutes}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            noChildren={
              <>
                <div className={`govuk-form-group govuk-!-width-two-thirds${errors.proposedAccessRoutesDetails ? ' govuk-form-group--error' : ''}`}>
                  <TextArea
                    id="proposedAccessRoutesDetails"
                    name="proposedAccessRoutesDetails"
                    label={WORKS_OVERVIEW_QUESTIONS.PROPOSED_ACCESS_ROUTES_DETAILS}
                    value={form.proposedAccessRoutesDetails}
                    onChange={handleChange}
                    maxLength={4000}
                    showCount
                    error={errors.proposedAccessRoutesDetails}
                  />
                </div>
                {renderAccessRouteUpload('proposed', WORKS_OVERVIEW_QUESTIONS.PROPOSED_ACCESS_ROUTES_DOCUMENTS)}
              </>
            }
          >
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.existingAccessRoutesDetails ? ' govuk-form-group--error' : ''}`}>
              <TextArea
                id="existingAccessRoutesDetails"
                name="existingAccessRoutesDetails"
                label={WORKS_OVERVIEW_QUESTIONS.ACCESS_ROUTES_DETAILS}
                value={form.existingAccessRoutesDetails}
                onChange={handleChange}
                maxLength={4000}
                showCount
                error={errors.existingAccessRoutesDetails}
              />
            </div>
            {renderAccessRouteUpload('existing', WORKS_OVERVIEW_QUESTIONS.ACCESS_ROUTES_DOCUMENTS)}
          </RadioGroup>
        </div>

        {/* Removing existing equipment */}
        <div className="govuk-!-margin-bottom-6">
          <RadioGroup
            id="removingExistingEquipment"
            label={WORKS_OVERVIEW_QUESTIONS.REMOVING_EQUIPMENT}
            name="removingExistingEquipment"
            value={form.removingExistingEquipment}
            error={errors.removingExistingEquipment}
            onChange={handleChange}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          >
            <div className={`govuk-form-group govuk-!-width-two-thirds${errors.removalDescription ? ' govuk-form-group--error' : ''}`}>
              <TextArea
                id="removalDescription"
                name="removalDescription"
                label={WORKS_OVERVIEW_QUESTIONS.REMOVAL_DESCRIPTION}
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
            label={WORKS_OVERVIEW_QUESTIONS.GENERAL_COMMENTS}
            hint={WORKS_OVERVIEW_QUESTIONS.GENERAL_COMMENTS_HINT}
            value={form.generalComments}
            onChange={handleChange}
            maxLength={4000}
            showCount
          />
        </div>

        <button type="submit" className="govuk-button">Save and continue</button>
        {/* <Link
          to={`${S37_BASE_URL}/${applicationId}/task-list`}
          className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
        >
          Save for later
        </Link> */}
      </form>
    </main>
  </div>
  );
};

export default WorksOverview;
