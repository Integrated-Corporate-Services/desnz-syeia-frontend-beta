import React, { useState, useRef } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import {
  LandDetailsBreadcrumbs,
  FormActions,
} from '../components';
import {
  useLandDetailsData,
  useLandNavigation,
} from '../hooks';
import { LAND_DETAILS_LABELS } from '../constants';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';
import { useAuthUser } from '../../../../hooks/useAuthUser';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';

const UploadSiteInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { goToEquipmentVisibility } = useLandNavigation(applicationId);
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);

  const handleDeleteFile = (fileId: string) => {
    updateLandDetails({
      uploadedFiles: landDetails.uploadedFiles?.filter(file => file.id !== fileId),
      applicationDocuments: landDetails.applicationDocuments?.filter(doc => doc.fileId !== fileId)
    });
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);

    try {
      // Trigger file upload if there are pending files
      if (fileUploadRef.current && pendingFiles.length > 0) {
        const { uploadedFiles: newUploadedFiles, applicationDocuments: newDocs } = 
          await fileUploadRef.current.triggerUpload();
        
        if (newUploadedFiles.length > 0) {
          updateLandDetails({
            uploadedFiles: [...(landDetails.uploadedFiles || []), ...newUploadedFiles],
            applicationDocuments: [...(landDetails.applicationDocuments || []), ...newDocs]
          });
        }
      }

      goToEquipmentVisibility();
    } catch (error) {
      setIsSaving(false);
    }
  };

  const labels = LAND_DETAILS_LABELS.UPLOAD_SITE_INFORMATION;

  return (
    <div className="govuk-width-container">
      <LandDetailsBreadcrumbs 
        applicationId={applicationId} 
        currentPage={labels.PAGE_TITLE}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{labels.PAGE_TITLE}</h1>

            <p className="govuk-body">
              {labels.DESCRIPTION}
            </p>

            <form>
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
                  subCategory="SITE_INFORMATION"
                  addedBy={userId}
                  uploadedFiles={landDetails.uploadedFiles || []}
                  applicationDocuments={landDetails.applicationDocuments || []}
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

export default UploadSiteInformation;
