import React, { useState, useEffect, useRef } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload, { FileUploadHandle } from "../../../../components/FileUpload";
import { UploadedFile, ApplicationDocument } from "../../../../types/fileUpload";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
} from "../constants/uploadWrittenWayleaveConstants";
import { SHARED_UPLOAD_LABELS } from "../constants/sharedConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Upload Written Wayleave Page
 * Upload evidence of the written wayleave
 */
const UploadWrittenWayleave: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToNoticeToTerminate, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [error, setError] = useState<string>("");
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const handleFileValidationErrors = (errors: string[]) => {
    // Always update from FileUpload component to clear errors when new files selected
    setFileValidationErrors(errors);
    if (errors.length === 0) {
      setError("");
    }
  };

  const handleErrorClick = (errorType: string) => {
    if (errorType === 'fileUpload') {
      const fileUploadSection = document.querySelector('#file-upload');
      if (fileUploadSection) {
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
          } else {
            const fileInput = fileUploadSection.querySelector('#file-upload-input');
            if (fileInput) {
              (fileInput as HTMLElement).focus();
            }
          }
        }, 300);
      }
    }
  };

  useEffect(() => {
    // Load uploaded documents and files
    if (applicationDetails?.implied_wayleave_documents) {
      // Filter only WRITTEN_WAYLEAVE documents (backend combines both IMPLIED and WRITTEN)
      const writtenDocs = applicationDetails.implied_wayleave_documents.filter(
        doc => doc.category === NWL_FILE_CATEGORIES.NWL_WRITTEN_WAYLEAVE
      );
      
      const docs = writtenDocs.map((doc) => ({
        documentId: doc.document_id,
        applicationId: appId || '',
        fileId: doc.file_id,
        category: NWL_FILE_CATEGORIES.NWL_WRITTEN_WAYLEAVE,
        title: doc.filename,
        filename: doc.filename,
        addedBy: '',
        addedAt: doc.uploaded_at,
      }));
      
      const files = writtenDocs.map((doc) => ({
        id: doc.file_id,
        storageProvider: 'aws_s3',
        s3Key: doc.s3_key,
        bucketName: '',
        virtualFolder: doc.s3_key.split('/').slice(0, -1).join('/'),
        filename: doc.filename,
        fileContentType: doc.file_content_type || 'application/octet-stream',
        fileSizeBytes: Number(doc.file_size),
        uploadedAtTimestamp: doc.uploaded_at,
      }));
      
      setApplicationDocuments(docs as unknown as ApplicationDocument[]);
      setUploadedFiles(files as unknown as UploadedFile[]);
    }
  }, [applicationDetails, appId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];
    
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
        
        setUploadedFiles(prev => [...prev, ...newlyUploadedFiles]);
        setApplicationDocuments(prev => [...prev, ...newlyUploadedDocuments]);
        // Clear file validation errors after successful upload
        setFileValidationErrors([]);
      } catch {
        const errorMsg = 'Failed to upload files. Please try again.';
        setFileValidationErrors([errorMsg]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (fileValidationErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check if at least one file is uploaded (mandatory)
    const allUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles];
    if (allUploadedFiles.length === 0) {
      setFileValidationErrors([FORM_ERRORS.NO_FILES]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const allDocuments = [...applicationDocuments, ...newlyUploadedDocuments];
      const documentIds = allDocuments.map(doc => doc.documentId);
      
      await updateFields({
        type_of_use: 'existing_lines',
        implied_wayleave_document_ids: documentIds,
        implied_wayleave_uploaded_files: allUploadedFiles,
        implied_wayleave_application_documents: allDocuments,
      }, APPLICATION_DETAILS_PAGE_IDS.UPLOAD_WRITTEN_WAYLEAVE);

      navigateToNoticeToTerminate();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // const handleSaveForLater = () => {
  //   navigateToTaskList();
  // };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <a
              className="govuk-breadcrumbs__link"
              href="#"
              onClick={(e) => { e.preventDefault(); navigateToTaskList(); }}
            >
              {BREADCRUMBS.TASK_LIST}
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {BREADCRUMBS.APPLICATION_DETAILS}
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

            {(error || fileValidationErrors.length > 0) && (
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
                  <ul className="govuk-list govuk-error-summary__list">
                    {fileValidationErrors.map((err, index) => (
                      <li key={`file-${index}`}>
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleErrorClick('fileUpload');
                        }}>
                          {err}
                        </a>
                      </li>
                    ))}
                    {error && (
                      <li>
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleErrorClick('fileUpload');
                        }}>
                          {error}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className={`govuk-form-group ${fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`} id="file-upload">
                {fileValidationErrors.length > 0 && fileValidationErrors.map((err, index) => (
                  <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {err}
                  </p>
                ))}
                {uploadedFiles && uploadedFiles.length > 0 && (
                  <div className="govuk-!-margin-top-2">
                    <h3 className="govuk-heading-s">{SHARED_UPLOAD_LABELS.DOCUMENTS_UPLOADED}</h3>
                  </div>
                )}
                <FileUpload
                  ref={fileUploadRef}
                  title={LABELS.UPLOAD_LABEL}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_WRITTEN_WAYLEAVE}`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_WRITTEN_WAYLEAVE}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  showDocumentsHeading={true}
                  uploadImmediately={false}
                  onPendingFilesChange={setPendingFiles}
                  onDeleteFile={(fileId) => {
                    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
                    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
                    setError("");
                    setFileValidationErrors([]);
                  }}
                  onUploaded={(newUploadedFiles, newDocuments) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                  }}
                  onValidationErrors={handleFileValidationErrors}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Save and continue
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadWrittenWayleave;
