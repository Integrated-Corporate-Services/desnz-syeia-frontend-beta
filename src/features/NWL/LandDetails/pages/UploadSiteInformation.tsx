import React, { useState, useRef } from 'react';
import { useGetApplicationId } from '../../../../hooks/useGetApplicationId';
import SkipLink from '../../../../components/SkipLink';
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
import { NWL_FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';
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
    // Only remove files/documents belonging to SITE_INFORMATION subCategory
    const targetSub = 'SITE_INFORMATION';
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
  const pageSubCategory = 'SITE_INFORMATION';
  const pageApplicationDocuments = (landDetails.applicationDocuments || []).filter(doc => ((doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase()) === pageSubCategory);
  const pageUploadedFiles = (landDetails.uploadedFiles || []).filter(file => pageApplicationDocuments.some(doc => doc.fileId === file.id));

  const handleSaveAndContinue = async () => {
    if (fileUploadRef.current?.isBusy()) {
      setFileValidationErrors(['File scan is in progress. Wait for the scan to finish before continuing.']);
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);

    try {
      // Trigger file upload if there are pending files
      if (fileUploadRef.current && pendingFiles.length > 0) {
        const { uploadedFiles: newUploadedFiles, applicationDocuments: newDocs, scanErrors } =
          await fileUploadRef.current.triggerUpload();

        if (scanErrors.length > 0) {
          setFileValidationErrors(scanErrors);
          window.scrollTo(0, 0);
          return;
        }

        if (newUploadedFiles.length > 0) {
          await updateLandDetails({
            uploadedFiles: [...(landDetails.uploadedFiles || []), ...newUploadedFiles],
            applicationDocuments: [...(landDetails.applicationDocuments || []), ...newDocs]
          });
        }
      }

      goToEquipmentVisibility();
    } catch (error) {
      // Error is handled by updateLandDetails or file upload
    } finally {
      setIsSaving(false);
    }
  };

  const labels = LAND_DETAILS_LABELS.UPLOAD_SITE_INFORMATION;

  return (
    <>
      <SkipLink />
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

            <p className="govuk-body">
              {labels.SITE_VISIT_INFO}
            </p>

            <form>
              <div className={`govuk-form-group${fileValidationErrors.length > 0 ? ' govuk-form-group--error' : ''}`}>
                {fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
                  <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                ))}
                {pageUploadedFiles && pageUploadedFiles.length > 0 && (
                  <h2 className="govuk-heading-s govuk-!-margin-bottom-4">{labels.DOCUMENTS_UPLOADED}</h2>
                )}
                
                <FileUpload
                  ref={fileUploadRef}
                  title={labels.UPLOAD_SECTION_TITLE}
                  showTitle={true}
                  prefix={`${applicationId}/${NWL_FILE_CATEGORIES.NWL_SITE_INFORMATION}`}
                  applicationId={applicationId}
                  category={NWL_FILE_CATEGORIES.NWL_SITE_INFORMATION}
                  subCategory="SITE_INFORMATION"
                  addedBy={userId}
                  uploadedFiles={pageUploadedFiles}
                  applicationDocuments={pageApplicationDocuments}
                  onDeleteFile={handleDeleteFile}
                  uploadImmediately={true}
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
    </>
  );
};

export default UploadSiteInformation;
