import React, { useState, useRef, useEffect } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import {
  LandDetailsBreadcrumbs,
  FormActions,
  ErrorSummary,
} from '../components';
import {
  useLandDetailsData,
  useFormValidation,
  useLandNavigation,
} from '../hooks';
import { saveLandRegistry } from '../services/landDetailsService';
import { LAND_DETAILS_LABELS } from '../constants';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';
import { useAuthUser } from '../../../../hooks/useAuthUser';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

const LandRegistryInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, isLoading } = useLandDetailsData(applicationId);
  const { errors, validateTitleNumber, clearError } = useFormValidation();
  const { goToOSGridReference } = useLandNavigation(applicationId);
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [titleNumber, setTitleNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

  // Load existing data from backend
  useEffect(() => {
    if (landDetails) {
      setTitleNumber(landDetails.land_registry_title_number || '');
    }
  }, [landDetails]);

  const handleTitleNumberChange = (value: string) => {
    setTitleNumber(value);
    clearError('titleNumber');
  };

  const handleDeleteFile = (fileId: string) => {
    // TODO: Call API to delete file
    console.log('Delete file:', fileId);
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateTitleNumber(titleNumber);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    if (!applicationId) return;

    setIsSaving(true);

    try {
      // Save land registry info
      await saveLandRegistry(applicationId, {
        is_land_registered: true,
        land_registry_title_number: titleNumber
      });

      // TODO: Handle file uploads separately
      goToOSGridReference();
    } catch (error) {
      console.error('Error saving land registry information:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    titleNumber: 'title-number',
  };

  const labels = LAND_DETAILS_LABELS.LAND_REGISTRY;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.INFO_PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <h1 className="govuk-heading-l">{labels.INFO_PAGE_TITLE}</h1>

            <form>
              <div className={`govuk-form-group${errors.titleNumber ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="title-number">
                  {labels.TITLE_NUMBER}
                </label>
                <div id="title-number-hint" className="govuk-hint">
                  {labels.TITLE_NUMBER_HINT}
                </div>
                {errors.titleNumber && (
                  <p id="title-number-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.titleNumber}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-20${errors.titleNumber ? ' govuk-input--error' : ''}`}
                  id="title-number"
                  name="titleNumber"
                  type="text"
                  value={titleNumber}
                  onChange={(e) => handleTitleNumberChange(e.target.value)}
                  aria-describedby={`title-number-hint${errors.titleNumber ? ' title-number-error' : ''}`}
                />
              </div>

              <div className={`govuk-form-group${fileValidationErrors.length > 0 ? ' govuk-form-group--error' : ''}`}>
                {fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
                  <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                ))}
                
                <FileUpload
                  ref={fileUploadRef}
                  title={labels.UPLOAD_SECTION_TITLE}
                  showTitle={false}
                  prefix={`${applicationId}/${FILE_CATEGORIES.APPLICATION_LAND_DETAILS}`}
                  applicationId={applicationId}
                  category={FILE_CATEGORIES.APPLICATION_LAND_DETAILS}
                  subCategory="LAND_REGISTRY"
                  addedBy={userId}
                  uploadedFiles={landDetails?.uploadedFiles || []}
                  applicationDocuments={landDetails?.applicationDocuments || []}
                  showDocumentsHeading={true}
                  onDeleteFile={handleDeleteFile}
                  onPendingFilesChange={setPendingFiles}
                  onValidationErrors={setFileValidationErrors}
                  onUploaded={(newUploadedFiles: UploadedFile[], newDocs: ApplicationDocument[]) => {
                    // TODO: Call API to save uploaded files
                    console.log('Files uploaded:', newUploadedFiles);
                  }}
                />
              </div>

              <FormActions
                onSaveAndContinue={handleSaveAndContinue}
                isSaving={isSaving}
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandRegistryInformation;
