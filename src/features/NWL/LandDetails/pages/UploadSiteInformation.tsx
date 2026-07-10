import React, { useState, useRef, useEffect } from 'react';
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
import { ERROR_MESSAGES } from '../../../../constants/error';

const UploadSiteInformation: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { landDetails, updateLandDetails } = useLandDetailsData(applicationId);
  const { goToEquipmentVisibility } = useLandNavigation(applicationId);
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [versionError, setVersionError] = useState<string>('');
  const versionRef = useRef<number | undefined>(undefined);

  // Track version for optimistic locking
  useEffect(() => {
    if (landDetails) {
      versionRef.current = landDetails.version;
    }
  }, [landDetails]);

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

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    setVersionError('');

    try {
      // Trigger file upload if there are pending files
      if (fileUploadRef.current && pendingFiles.length > 0) {
        const { uploadedFiles: newUploadedFiles, applicationDocuments: newDocs } = 
          await fileUploadRef.current.triggerUpload();
        
        if (newUploadedFiles.length > 0) {
          await updateLandDetails({
            uploadedFiles: [...(landDetails.uploadedFiles || []), ...newUploadedFiles],
            applicationDocuments: [...(landDetails.applicationDocuments || []), ...newDocs],
            version: versionRef.current,
          });
        } else {
          // Even if no files are uploaded, we still need to send version
          await updateLandDetails({
            version: versionRef.current,
          });
        }
      } else {
        // No pending files, but still send version
        await updateLandDetails({
          version: versionRef.current,
        });
      }

      goToEquipmentVisibility();
    } catch (error: any) {
      if (error.statusCode === 409 || error.isVersionConflict) {
        setVersionError(ERROR_MESSAGES.VERSION_CONFLICT);
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter uploaded files and documents for SITE_INFORMATION only
  const targetSub = 'SITE_INFORMATION';
  const pageApplicationDocuments = (landDetails.applicationDocuments || []).filter(doc => {
    const sub = (doc.subCategory || (doc as any).sub_category || '').toString().toUpperCase();
    return sub === targetSub;
  });
  const pageUploadedFiles = (landDetails.uploadedFiles || []).filter(file => {
    return pageApplicationDocuments.some(doc => doc.fileId === file.id);
  });

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
            {versionError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <div dangerouslySetInnerHTML={{ __html: versionError }} />
                </div>
              </div>
            )}

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
