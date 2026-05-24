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
import { useAuthUser } from '../../../../hooks/useAuthUser';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

const LandRegistryInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { errors, validateTitleNumber, clearError } = useFormValidation();
  const { goToOSGridReference } = useLandNavigation(applicationId);
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [titleNumber, setTitleNumber] = useState(landDetails.land_registry_title_number || '');

  // Sync form with fetched data
  useEffect(() => {
    setTitleNumber(landDetails.land_registry_title_number || '');
  }, [landDetails.land_registry_title_number]);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

  const handleTitleNumberChange = (value: string) => {
    setTitleNumber(value);
    clearError('titleNumber');
  };

  const handleDeleteFile = (fileId: string) => {
    // Only remove files/documents belonging to LAND_REGISTRY subCategory
    const targetSub = 'LAND_REGISTRY';
    const remainingDocuments = (landDetails.applicationDocuments || []).filter(doc => {
      const sub = (doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase();
      if (doc.fileId === fileId && sub === targetSub) return false;
      return true;
    });
    const remainingFiles = (landDetails.uploadedFiles || []).filter(file => {
      // Keep file if it is not the one being deleted for this subcategory
      const hasDocInThisSub = (landDetails.applicationDocuments || []).some(doc => (doc.fileId === file.id) && ((doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase() === targetSub));
      if (file.id === fileId && hasDocInThisSub) return false;
      return true;
    });

    updateLandDetails({
      uploadedFiles: remainingFiles,
      applicationDocuments: remainingDocuments,
    });
  };

  // Files/documents only for this page's subCategory
  const pageSubCategory = 'LAND_REGISTRY';
  const pageApplicationDocuments = (landDetails.applicationDocuments || []).filter(doc => ((doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase()) === pageSubCategory);
  const pageUploadedFiles = (landDetails.uploadedFiles || []).filter(file => pageApplicationDocuments.some(doc => doc.fileId === file.id));

  const handleSaveAndContinue = async () => {
    const isValid = validateTitleNumber(titleNumber);

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
            land_registry_title_number: titleNumber,
            uploadedFiles: [...(landDetails.uploadedFiles || []), ...newUploadedFiles],
            applicationDocuments: [...(landDetails.applicationDocuments || []), ...newDocs]
          });
        } else {
          await updateLandDetails({
            land_registry_title_number: titleNumber,
          });
        }
      } else {
        await updateLandDetails({
          land_registry_title_number: titleNumber,
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
                {landDetails.uploadedFiles && landDetails.uploadedFiles.length > 0 && (
                  <h2 className="govuk-heading-s govuk-!-margin-bottom-4">Documents uploaded</h2>
                )}
                
                <FileUpload
                  ref={fileUploadRef}
                  title={labels.UPLOAD_SECTION_TITLE}
                  showTitle={false}
                  prefix={`${applicationId}/${FILE_CATEGORIES.APPLICATION_LAND_DETAILS}`}
                  applicationId={applicationId}
                  category={FILE_CATEGORIES.APPLICATION_LAND_DETAILS}
                  subCategory="LAND_REGISTRY"
                  addedBy={userId}
                  uploadedFiles={pageUploadedFiles}
                  applicationDocuments={pageApplicationDocuments}
                  showDocumentsHeading={true}
                  uploadImmediately={true}
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
