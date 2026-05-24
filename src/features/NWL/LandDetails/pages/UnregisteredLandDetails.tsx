import React, { useState, useEffect, useRef } from 'react';
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
import { LAND_DETAILS_LABELS } from '../constants';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';
import { LAND_DETAILS_SUBCATEGORIES } from '../constants';
import { useAuthUser } from '../../../../hooks/useAuthUser';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

const UnregisteredLandDetails: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateUnregisteredLand, clearError } = useFormValidation();
  const { goToOSGridReference } = useLandNavigation(applicationId);
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [explanation, setExplanation] = useState(landDetails.unregistered_land_explanation || '');

  // Sync form with fetched data
  useEffect(() => {
    setExplanation(landDetails.unregistered_land_explanation || '');
  }, [landDetails.unregistered_land_explanation]);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

  const maxCharacters = 4000;

  const handleExplanationChange = (value: string) => {
    if (value.length <= maxCharacters) {
      setExplanation(value);
      clearError('unregisteredLand');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    // Only remove files/documents belonging to UNREGISTERED_LAND subCategory
    const targetSub = LAND_DETAILS_SUBCATEGORIES.UNREGISTERED_LAND;
    const remainingDocuments = (landDetails.applicationDocuments || []).filter(doc => {
      const sub = (doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase();
      if (doc.fileId === fileId && sub === targetSub) return false;
      return true;
    });
    const remainingFiles = (landDetails.uploadedFiles || []).filter(file => {
      const hasDocInThisSub = (landDetails.applicationDocuments || []).some(doc => (doc.fileId === file.id) && ((doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase() === targetSub));
      if (file.id === fileId && hasDocInThisSub) return false;
      return true;
    });

    updateLandDetails({
      uploadedFiles: remainingFiles,
      applicationDocuments: remainingDocuments,
    });
  };

  const handleSaveAndContinue = async () => {
    const isValid = validateUnregisteredLand(explanation);

    if (!isValid) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      // Trigger file upload if there are pending files
      if (fileUploadRef.current && pendingFiles.length > 0) {
        const { uploadedFiles: newUploadedFiles, applicationDocuments: newDocs } = 
          await fileUploadRef.current.triggerUpload();
        
        if (newUploadedFiles.length > 0) {
          await updateLandDetails({
            unregistered_land_explanation: explanation,
            uploadedFiles: [...(landDetails.uploadedFiles || []), ...newUploadedFiles],
            applicationDocuments: [...(landDetails.applicationDocuments || []), ...newDocs]
          });
        } else {
          await updateLandDetails({
            unregistered_land_explanation: explanation,
          });
        }
      } else {
        await updateLandDetails({
          unregistered_land_explanation: explanation,
        });
      }

      goToOSGridReference();
    } catch (error) {
      // Error is handled by updateLandDetails or file upload
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
                {landDetails.uploadedFiles && landDetails.uploadedFiles.length > 0 && (
                  <h2 className="govuk-heading-s govuk-!-margin-bottom-4">Documents uploaded</h2>
                )}
                
                  {/* Files/documents only for this page's subCategory */}
                  {(() => {
                    const pageSubCategory = LAND_DETAILS_SUBCATEGORIES.UNREGISTERED_LAND;
                    const pageApplicationDocuments = (landDetails.applicationDocuments || []).filter(doc => ((doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase()) === pageSubCategory);
                    const pageUploadedFiles = (landDetails.uploadedFiles || []).filter(file => pageApplicationDocuments.some(doc => doc.fileId === file.id));

                    return (
                      <FileUpload
                  ref={fileUploadRef}
                  title={labels.UPLOAD_SECTION_TITLE}
                  showTitle={false}
                  prefix={`${applicationId}/${FILE_CATEGORIES.APPLICATION_LAND_DETAILS}`}
                  applicationId={applicationId}
                  category={FILE_CATEGORIES.APPLICATION_LAND_DETAILS}
                    subCategory="UNREGISTERED_LAND"
                    addedBy={userId}
                    uploadedFiles={pageUploadedFiles}
                    applicationDocuments={pageApplicationDocuments}
                    uploadImmediately={true}
                  showDocumentsHeading={true}
                  onDeleteFile={handleDeleteFile}
                  onPendingFilesChange={setPendingFiles}
                  onValidationErrors={setFileValidationErrors}
                  onUploaded={(newUploadedFiles: UploadedFile[], newDocs: ApplicationDocument[]) => {
                    updateLandDetails({
                      uploadedFiles: [...(landDetails.uploadedFiles || []), ...newUploadedFiles],
                      applicationDocuments: [...(landDetails.applicationDocuments || []), ...newDocs]
                    });
                  }}
                      />
                    );
                  })()}
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
