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

const UnregisteredLandDetails: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, isLoading } = useLandDetailsData(applicationId);
  const { errors, validateUnregisteredLand, clearError } = useFormValidation();
  const { goToOSGridReference } = useLandNavigation(applicationId);
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [explanation, setExplanation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

  const maxCharacters = 4000;

  // Load existing data from backend
  useEffect(() => {
    if (landDetails) {
      setExplanation(landDetails.land_ownership_unknown_reason || '');
    }
  }, [landDetails]);

  const handleExplanationChange = (value: string) => {
    if (value.length <= maxCharacters) {
      setExplanation(value);
      clearError('unregisteredLand');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    // File deletion would need API call - placeholder for now
    console.log('Delete file:', fileId);
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateUnregisteredLand(explanation);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    if (!applicationId) return;

    setIsSaving(true);

    try {
      // Save land ownership unknown reason
      await saveLandRegistry(applicationId, {
        is_land_registered: false,
        land_registry_title_number: undefined
      });

      // TODO: Handle file uploads separately
      goToOSGridReference();
    } catch (error) {
      console.error('Error saving unregistered land details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const errorFields = {
    unregisteredLand: 'unregistered-land-explanation',
  };

  const labels = LAND_DETAILS_LABELS.UNREGISTERED_LAND;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} errorFields={errorFields} />

            <h1 className="govuk-heading-l">{labels.PAGE_TITLE}</h1>

            <form>
              <div className={`govuk-form-group${errors.unregisteredLand ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="unregistered-land-explanation">
                  {labels.DESCRIPTION}
                </label>
                {errors.unregisteredLand && (
                  <p id="unregistered-land-explanation-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.unregisteredLand}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea${errors.unregisteredLand ? ' govuk-textarea--error' : ''}`}
                  id="unregistered-land-explanation"
                  name="unregisteredLandExplanation"
                  rows={8}
                  value={explanation}
                  onChange={(e) => handleExplanationChange(e.target.value)}
                  aria-describedby={errors.unregisteredLand ? 'unregistered-land-explanation-error' : undefined}
                />
                <div id="unregistered-land-hint" className="govuk-hint">
                  {labels.CHARACTER_LIMIT}
                </div>
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
                  subCategory="UNREGISTERED_LAND"
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

export default UnregisteredLandDetails;
