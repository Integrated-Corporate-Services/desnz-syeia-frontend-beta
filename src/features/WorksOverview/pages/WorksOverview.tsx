import React, { useState, useEffect, useRef } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { useNavigate, Link } from 'react-router-dom';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import RadioGroup from '../component/RadioGroup';
import TextArea from '../component/TextArea';
import TextInput from '../component/TextInput';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { ASSET_ERROR_MESSAGES } from '../../../constants/assetError';
import { createWorksOverview, updateWorksOverview, getWorksOverview } from '../../../services/worksOverviewApiService';
import { WORKS_OVERVIEW_LABELS } from '../../../constants/worksOverviewLabels';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';
import SkipLink from '../../../components/SkipLink';
import {
  validateWorksOverviewForm,
  getFieldErrorMessage,
  clearFieldValidationErrors,
  type ValidationError,
} from '../validations';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';

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
  removingExistingEquipment: '',
  removalDescription: '',
};

const yesNoOptions = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

const mapUploadedFiles = (files: unknown[]): UploadedFile[] =>
  Array.isArray(files)
    ? files.map((file) => {
        const f = file as Record<string, unknown>;
        return {
          id: String(f.id || ''),
          storageProvider: String(f.storageProvider || ''),
          s3Key: String(f.s3Key || ''),
          bucketName: String(f.bucketName || ''),
          virtualFolder: String(f.virtualFolder || ''),
          filename: String(f.filename || ''),
          fileContentType: String(f.fileContentType || ''),
          fileSizeBytes: Number(f.fileSizeBytes || 0),
          uploadedAtTimestamp: String(f.uploadedAtTimestamp || ''),
        };
      })
    : [];

const mapApplicationDocuments = (documents: unknown[]): ApplicationDocument[] =>
  Array.isArray(documents)
    ? documents.map((doc) => {
        const d = doc as Record<string, unknown>;
        return {
          documentId: String(d.documentId || ''),
          applicationId: String(d.applicationId || ''),
          fileId: String(d.fileId || ''),
          category: String(d.category || ''),
          title: String(d.title || ''),
          virtualFolder: String(d.virtualFolder || ''),
          addedBy: String(d.addedBy || ''),
          addedAt: String(d.addedAt || ''),
          description: String(d.description || ''),
        };
      })
    : [];

const WorksOverview: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roadClosureFiles, setRoadClosureFiles] = useState<UploadedFile[]>([]);
  const [roadClosureDocuments, setRoadClosureDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingRoadClosureFiles, setPendingRoadClosureFiles] = useState<File[]>([]);
  const roadClosureFileUploadRef = useRef<FileUploadHandle>(null);
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const userId = user?.user_id;

  const applicationId = useGetApplicationId();
  const effectiveApplicationId = applicationId;
  const taskListUrl = `${S37_BASE_URL}/${applicationId}/task-list`;

  useEffect(() => {
    setForm(initialState);
    setRoadClosureFiles([]);
    setRoadClosureDocuments([]);
    setPendingRoadClosureFiles([]);
  }, [effectiveApplicationId]);

  useEffect(() => {
    async function fetchWorksOverview() {
      if (!effectiveApplicationId) return;

      try {
        const data = await getWorksOverview(effectiveApplicationId);
        if (data && (data.application_id === effectiveApplicationId || data.applicationId === effectiveApplicationId)) {
          setForm({
            addingOrReplacingPoles: data.addingOrReplacingPoles != null ? (data.addingOrReplacingPoles ? 'yes' : 'no') : '',
            poleMaterial: data.poleMaterial || '',
            chemicalTreatments: data.chemicalTreatments || '',
            polesAdded: data.polesAdded !== undefined ? data.polesAdded.toString() : '',
            polesReplaced: data.polesReplaced !== undefined ? data.polesReplaced.toString() : '',
            tallestNewPoleHeight: data.tallestNewPoleHeight !== undefined && data.tallestNewPoleHeight !== null
              ? data.tallestNewPoleHeight.toString()
              : '',
            poleComments: data.poleComments || '',
            addingOrReplacingLines: data.addingOrReplacingLines != null ? (data.addingOrReplacingLines ? 'yes' : 'no') : '',
            overheadLineDescription: data.overheadLineDescription || '',
            estimatedDuration: data.estimatedDuration || '',
            vehiclesRequired: data.vehiclesRequired || '',
            roadClosuresRequired: data.roadClosuresRequired != null ? (data.roadClosuresRequired ? 'yes' : 'no') : '',
            roadClosuresDetails: data.roadClosuresDetails || '',
            excavationRequired: data.excavationRequired != null ? (data.excavationRequired ? 'yes' : 'no') : '',
            excavationDetails: data.excavationDetails || '',
            vegetationClearanceRequired: data.vegetationClearanceRequired != null ? (data.vegetationClearanceRequired ? 'yes' : 'no') : '',
            vegetationClearanceDetails: data.vegetationClearanceDetails || '',
            removingExistingEquipment: data.removingExistingEquipment != null ? (data.removingExistingEquipment ? 'yes' : 'no') : '',
            removalDescription: data.removalDescription || '',
          });
          setIsEditMode(true);
          setRoadClosureFiles(mapUploadedFiles(data.roadClosureUploadedFiles));
          setRoadClosureDocuments(mapApplicationDocuments(data.roadClosureApplicationDocuments));
        } else {
          setForm(initialState);
          setIsEditMode(false);
        }
      } catch {
        setForm(initialState);
        setIsEditMode(false);
      }
    }

    fetchWorksOverview();
  }, [effectiveApplicationId]);

  const conditionalFieldsByRadio: Partial<Record<keyof typeof initialState, (keyof typeof initialState)[]>> = {
    addingOrReplacingPoles: ['poleMaterial', 'chemicalTreatments', 'polesAdded', 'polesReplaced', 'tallestNewPoleHeight', 'poleComments'],
    addingOrReplacingLines: ['overheadLineDescription'],
    roadClosuresRequired: ['roadClosuresDetails'],
    excavationRequired: ['excavationDetails'],
    vegetationClearanceRequired: ['vegetationClearanceDetails'],
    removingExistingEquipment: ['removalDescription'],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof typeof initialState;

    setForm((prev) => ({ ...prev, [name]: value }));

    const fieldsToClear: string[] = [fieldName];
    if (type === 'radio' && value === 'no' && conditionalFieldsByRadio[fieldName]) {
      fieldsToClear.push(...conditionalFieldsByRadio[fieldName]!);
    }
    setErrors((prev) => clearFieldValidationErrors(prev, fieldsToClear));
  };

  const buildPayload = () => ({
    addingOrReplacingPoles: form.addingOrReplacingPoles === '' ? null : form.addingOrReplacingPoles === 'yes',
    addingOrReplacingLines: form.addingOrReplacingLines === '' ? null : form.addingOrReplacingLines === 'yes',
    poleMaterial: form.addingOrReplacingPoles === 'yes' ? form.poleMaterial : '',
    chemicalTreatments: form.addingOrReplacingPoles === 'yes' ? form.chemicalTreatments : '',
    polesAdded: form.addingOrReplacingPoles === 'yes' ? (parseInt(form.polesAdded, 10) || 0) : 0,
    polesReplaced: form.addingOrReplacingPoles === 'yes' ? (parseInt(form.polesReplaced, 10) || 0) : 0,
    tallestNewPoleHeight: form.addingOrReplacingPoles === 'yes' ? (parseFloat(form.tallestNewPoleHeight) || 0) : 0,
    poleComments: form.addingOrReplacingPoles === 'yes' ? form.poleComments : '',
    overheadLineDescription: form.addingOrReplacingLines === 'yes' ? form.overheadLineDescription : '',
    estimatedDuration: form.estimatedDuration,
    vehiclesRequired: form.vehiclesRequired,
    roadClosuresRequired: form.roadClosuresRequired === '' ? null : form.roadClosuresRequired === 'yes',
    roadClosuresDetails: form.roadClosuresRequired === 'yes' ? form.roadClosuresDetails : '',
    excavationRequired: form.excavationRequired === '' ? null : form.excavationRequired === 'yes',
    excavationDetails: form.excavationRequired === 'yes' ? form.excavationDetails : '',
    vegetationClearanceRequired: form.vegetationClearanceRequired === '' ? null : form.vegetationClearanceRequired === 'yes',
    vegetationClearanceDetails: form.vegetationClearanceRequired === 'yes' ? form.vegetationClearanceDetails : '',
    usingExistingAccessRoutes: null,
    existingAccessRoutesDetails: '',
    proposedAccessRoutesDetails: '',
    removingExistingEquipment: form.removingExistingEquipment === '' ? null : form.removingExistingEquipment === 'yes',
    removalDescription: form.removingExistingEquipment === 'yes' ? form.removalDescription : '',
    generalComments: '',
  });

  const uploadPendingFiles = async () => {
    if (roadClosureFileUploadRef.current && pendingRoadClosureFiles.length > 0) {
      await roadClosureFileUploadRef.current.triggerUpload();
    }
  };

  const persistForm = async () => {
    await uploadPendingFiles();
    const payload = { applicationId: effectiveApplicationId, worksOverview: buildPayload() };
    if (isEditMode) {
      await updateWorksOverview(effectiveApplicationId, payload);
    } else {
      await createWorksOverview(payload);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateWorksOverviewForm(form);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    try {
      await persistForm();
      navigate(getNextPageUrl(TASK_NAMES.WORKS_OVERVIEW, effectiveApplicationId));
    } catch {
      setErrors([{ field: 'generalComments', message: ASSET_ERROR_MESSAGES.generalCommentsFailed }]);
    }
  };

  const polesYesFields = (
    <>
      <TextInput id="poleMaterial" name="poleMaterial" label={WORKS_OVERVIEW_LABELS.POLE_MATERIAL} value={form.poleMaterial} onChange={handleChange} error={getFieldErrorMessage('poleMaterial', errors)} />
      <TextInput id="chemicalTreatments" name="chemicalTreatments" label={WORKS_OVERVIEW_LABELS.CHEMICAL_TREATMENTS} value={form.chemicalTreatments} onChange={handleChange} error={getFieldErrorMessage('chemicalTreatments', errors)} />
      <TextInput id="polesAdded" name="polesAdded" label={WORKS_OVERVIEW_LABELS.POLES_ADDED} value={form.polesAdded} onChange={handleChange} error={getFieldErrorMessage('polesAdded', errors)} inputMode="numeric" />
      <TextInput id="polesReplaced" name="polesReplaced" label={WORKS_OVERVIEW_LABELS.POLES_REPLACED} value={form.polesReplaced} onChange={handleChange} error={getFieldErrorMessage('polesReplaced', errors)} inputMode="numeric" />
      <TextInput id="tallestNewPoleHeight" name="tallestNewPoleHeight" label={WORKS_OVERVIEW_LABELS.TALLEST_NEW_POLE_HEIGHT} hint={WORKS_OVERVIEW_LABELS.TALLEST_NEW_POLE_HEIGHT_HINT} value={form.tallestNewPoleHeight} onChange={handleChange} error={getFieldErrorMessage('tallestNewPoleHeight', errors)} inputMode="decimal" suffix="metres" widthClass="govuk-input--width-4" />
      <TextArea id="poleComments" name="poleComments" label={WORKS_OVERVIEW_LABELS.POLE_COMMENTS} value={form.poleComments} onChange={handleChange} maxLength={4000} showCount error={getFieldErrorMessage('poleComments', errors)} />
    </>
  );

  const roadClosuresYesFields = (
    <>
      <TextArea id="roadClosuresDetails" name="roadClosuresDetails" label={WORKS_OVERVIEW_LABELS.ROAD_CLOSURES_DETAILS} value={form.roadClosuresDetails} onChange={handleChange} error={getFieldErrorMessage('roadClosuresDetails', errors)} maxLength={4000} showCount />
      <div className="govuk-form-group govuk-!-margin-top-2">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{WORKS_OVERVIEW_LABELS.ROAD_CLOSURES_DOCUMENTS}</legend>
          <FileUpload
            ref={roadClosureFileUploadRef}
            title="Upload a file"
            showTitle={false}
            prefix={`${applicationId}/${FILE_CATEGORIES.WORKS_ROAD_CLOSURE}`}
            applicationId={applicationId}
            category={FILE_CATEGORIES.WORKS_ROAD_CLOSURE}
            addedBy={userId}
            uploadedFiles={roadClosureFiles}
            applicationDocuments={roadClosureDocuments}
            uploadImmediately={false}
            onDeleteFile={(fileId) => {
              setRoadClosureFiles((prev) => prev.filter((file) => file.id !== fileId));
              setRoadClosureDocuments((prev) => prev.filter((doc) => doc.fileId !== fileId));
            }}
            onPendingFilesChange={setPendingRoadClosureFiles}
            onUploaded={(newUploadedFiles, newDocuments) => {
              setRoadClosureFiles((prev) => [...prev, ...newUploadedFiles]);
              setRoadClosureDocuments((prev) => [...prev, ...newDocuments]);
            }}
          />
        </fieldset>
      </div>
    </>
  );

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={taskListUrl}>Task list</Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">Works overview</li>
          </ol>
        </nav>

        <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing" id="main-content" role="main">
          {errors.length > 0 && (
            <div className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary">
              <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {errors.map((err, idx) => (
                    <li key={idx}><a href={`#${err.field}`}>{err.message}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form className="govuk-!-margin-bottom-6" onSubmit={handleSubmit} noValidate>
            <h1 className="govuk-heading-l">Works Overview</h1>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <RadioGroup
                id="addingOrReplacingPoles"
                label={WORKS_OVERVIEW_LABELS.ADDING_REPLACING_POLES}
                name="addingOrReplacingPoles"
                value={form.addingOrReplacingPoles}
                error={getFieldErrorMessage('addingOrReplacingPoles', errors)}
                onChange={handleChange}
                options={yesNoOptions.map((opt) => opt.value === 'yes' ? { ...opt, conditional: polesYesFields } : opt)}
              />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <RadioGroup
                id="addingOrReplacingLines"
                label={WORKS_OVERVIEW_LABELS.ADDING_REPLACING_LINES}
                name="addingOrReplacingLines"
                value={form.addingOrReplacingLines}
                error={getFieldErrorMessage('addingOrReplacingLines', errors)}
                onChange={handleChange}
                options={yesNoOptions.map((opt) => opt.value === 'yes' ? {
                  ...opt,
                  conditional: (
                    <TextArea id="overheadLineDescription" name="overheadLineDescription" label={WORKS_OVERVIEW_LABELS.OVERHEAD_LINE_DESCRIPTION} value={form.overheadLineDescription} onChange={handleChange} error={getFieldErrorMessage('overheadLineDescription', errors)} maxLength={4000} showCount />
                  ),
                } : opt)}
              />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <TextInput id="estimatedDuration" name="estimatedDuration" label={WORKS_OVERVIEW_LABELS.ESTIMATED_DURATION} value={form.estimatedDuration} onChange={handleChange} error={getFieldErrorMessage('estimatedDuration', errors)} labelClassName="govuk-label--m" />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <TextInput id="vehiclesRequired" name="vehiclesRequired" label={WORKS_OVERVIEW_LABELS.VEHICLES_REQUIRED} value={form.vehiclesRequired} onChange={handleChange} error={getFieldErrorMessage('vehiclesRequired', errors)} labelClassName="govuk-label--m" />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <RadioGroup
                id="roadClosuresRequired"
                label={WORKS_OVERVIEW_LABELS.ROAD_CLOSURES}
                name="roadClosuresRequired"
                value={form.roadClosuresRequired}
                error={getFieldErrorMessage('roadClosuresRequired', errors)}
                onChange={handleChange}
                options={yesNoOptions.map((opt) => opt.value === 'yes' ? { ...opt, conditional: roadClosuresYesFields } : opt)}
              />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <RadioGroup
                id="excavationRequired"
                label={WORKS_OVERVIEW_LABELS.EXCAVATION_REQUIRED}
                hint={WORKS_OVERVIEW_LABELS.EXCAVATION_HINT}
                name="excavationRequired"
                value={form.excavationRequired}
                error={getFieldErrorMessage('excavationRequired', errors)}
                onChange={handleChange}
                options={yesNoOptions.map((opt) => opt.value === 'yes' ? {
                  ...opt,
                  conditional: (
                    <TextArea id="excavationDetails" name="excavationDetails" label={WORKS_OVERVIEW_LABELS.EXCAVATION_DETAILS} value={form.excavationDetails} onChange={handleChange} maxLength={4000} showCount error={getFieldErrorMessage('excavationDetails', errors)} />
                  ),
                } : opt)}
              />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <RadioGroup
                id="vegetationClearanceRequired"
                label={WORKS_OVERVIEW_LABELS.VEGETATION_CLEARANCE}
                hint={WORKS_OVERVIEW_LABELS.VEGETATION_HINT}
                name="vegetationClearanceRequired"
                value={form.vegetationClearanceRequired}
                error={getFieldErrorMessage('vegetationClearanceRequired', errors)}
                onChange={handleChange}
                options={yesNoOptions.map((opt) => opt.value === 'yes' ? {
                  ...opt,
                  conditional: (
                    <TextArea id="vegetationClearanceDetails" name="vegetationClearanceDetails" label={WORKS_OVERVIEW_LABELS.VEGETATION_DETAILS} value={form.vegetationClearanceDetails} onChange={handleChange} maxLength={4000} showCount error={getFieldErrorMessage('vegetationClearanceDetails', errors)} />
                  ),
                } : opt)}
              />
            </div>

            <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds">
              <RadioGroup
                id="removingExistingEquipment"
                label={WORKS_OVERVIEW_LABELS.REMOVING_EQUIPMENT}
                name="removingExistingEquipment"
                value={form.removingExistingEquipment}
                error={getFieldErrorMessage('removingExistingEquipment', errors)}
                onChange={handleChange}
                options={yesNoOptions.map((opt) => opt.value === 'yes' ? {
                  ...opt,
                  conditional: (
                    <TextArea id="removalDescription" name="removalDescription" label={WORKS_OVERVIEW_LABELS.REMOVAL_DESCRIPTION} value={form.removalDescription} onChange={handleChange} maxLength={4000} showCount error={getFieldErrorMessage('removalDescription', errors)} />
                  ),
                } : opt)}
              />
            </div>

            <div className="govuk-button-group">
              <button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default WorksOverview;
