import React, { useState, useEffect, useRef } from 'react';
import {
  LABELS,
  HINTS,
  FORM_LABELS,
  CHARACTER_LIMIT,
  ERRORS,
} from '../constants';
import {
  useAdditionalInformationData,
  useFormValidation,
  useAdditionalInformationNavigation,
} from '../hooks';
import {
  AdditionalInformationBreadcrumbs,
  ErrorSummary,
  FormActions,
} from '../components';
import { CONTENT } from '../constants';
import { createOrUpdateAdditionalInformationData } from '../services/additionalInformationService';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { NWL_FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';
import SkipLink from '../../../../components/SkipLink';

import { useNWLProgress } from '../../hooks/useNWLProgress';

/**
 * Important Information Details Page
 * Collects detailed information and supporting documents
 */
const ImportantInformationDetails: React.FC = () => {
  const { appId, additionalInformationData } = useAdditionalInformationData();
  const { errors, setErrors, validateOtherInformationDetails } = useFormValidation();
  const { navigateToTaskList } = useAdditionalInformationNavigation(appId);
  const { user } = useAuthUserContext();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const { updateProgress } = useNWLProgress(appId);

  const [details, setDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
  };

  useEffect(() => {
    if (additionalInformationData) {
      setDetails(additionalInformationData.other_information_details || '');
      
      const loadedUploadedFiles = additionalInformationData.uploaded_files || [];
      const loadedApplicationDocuments = additionalInformationData.application_documents || [];
            
      setUploadedFiles(loadedUploadedFiles);
      setApplicationDocuments(loadedApplicationDocuments);
    }
  }, [additionalInformationData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fileUploadRef.current?.isBusy()) {
      const blockingMessages = fileUploadRef.current.getBlockingMessages();
      const isPersistent = fileUploadRef.current.hasRejectedFiles();
      const combinedMessage = blockingMessages.join(' ');
      setErrors({ fileUpload: combinedMessage });
      window.scrollTo(0, 0);
      if (!isPersistent) {
        setTimeout(() => {
          setErrors(prev => (Object.keys(prev).length === 1 && prev.fileUpload === combinedMessage) ? {} : prev);
        }, 6000);
      }
      return;
    }

    // Upload pending files first and get the results directly
    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];

    if (fileUploadRef.current && pendingFiles.length > 0) {
      const uploadResult = await fileUploadRef.current.triggerUpload();
      if (uploadResult.scanErrors.length > 0) {
        setErrors({ fileUpload: uploadResult.scanErrors.join(' ') });
        window.scrollTo(0, 0);
        return;
      }
      newlyUploadedFiles = uploadResult.uploadedFiles;
      newlyUploadedDocuments = uploadResult.applicationDocuments;
    }

    if (!validateOtherInformationDetails(details)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      // Combine existing and newly uploaded files/documents
      const allUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles];
      const allApplicationDocuments = [...applicationDocuments, ...newlyUploadedDocuments];
      
      // Get document IDs from all uploaded documents
      const documentIds = allApplicationDocuments.map(doc => doc.documentId);


      await createOrUpdateAdditionalInformationData(appId, {
        has_related_applications: additionalInformationData?.has_related_applications ?? false,
        related_applications_details: additionalInformationData?.related_applications_details,
        has_other_information: true,
        other_information_details: details,
        additional_document_ids: documentIds.length > 0 ? documentIds : undefined,
        uploaded_files: allUploadedFiles,
        application_documents: allApplicationDocuments,
      });

      // Update progress for Supporting information section (backend subsection name)
      try {
        await updateProgress('Supporting information', 'Completed');
      } catch (progressError) {
        // Continue even if progress update fails
      }

      navigateToTaskList();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : ERRORS.API_ERROR;
      setErrors({ api: errorMessage });
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = details.length;
  const charactersRemaining = CHARACTER_LIMIT - characterCount;

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <AdditionalInformationBreadcrumbs 
        appId={appId} 
        currentPage={CONTENT.BREADCRUMBS.IMPORTANT_INFORMATION_DETAILS}
      />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.IMPORTANT_INFORMATION_TITLE}</h1>

            <ErrorSummary errors={errors} />

            <form onSubmit={handleSubmit} noValidate>
              {/* Information Details */}
              <div
                className={`govuk-form-group ${
                  errors.details ? 'govuk-form-group--error' : ''
                }`}
              >
                <label className="govuk-label govuk-label--s" htmlFor="details">
                  {HINTS.OTHER_INFORMATION_DETAILS}
                </label>
                {errors.details && (
                  <p id="details-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{' '}
                    {errors.details}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${
                    errors.details ? 'govuk-textarea--error' : ''
                  }`}
                  id="details"
                  name="details"
                  rows={8}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  aria-describedby={
                    errors.details
                      ? 'details-error details-info'
                      : 'details-info'
                  }
                  maxLength={CHARACTER_LIMIT}
                />
                <div
                  id="details-info"
                  className="govuk-hint govuk-character-count__message"
                  aria-live="polite"
                >
                  {charactersRemaining >= 0
                    ? `You have ${charactersRemaining} characters remaining`
                    : `You have ${Math.abs(charactersRemaining)} characters too many`}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="govuk-form-group">
                {uploadedFiles && uploadedFiles.length > 0 && (
                  <div className="govuk-!-margin-top-2">
                    <h3 className="govuk-heading-s">{FORM_LABELS.DOCUMENTS_UPLOADED}</h3>
                  </div>
                )}
                <FileUpload
                  ref={fileUploadRef}
                  title={FORM_LABELS.UPLOAD_DOCUMENTS}
                  showTitle={true}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_ADDITIONAL_INFORMATION}`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_ADDITIONAL_INFORMATION}
                  addedBy={userId}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  uploadImmediately={true}
                  onDeleteFile={handleDeleteFile}
                  onUploaded={(newUploadedFiles, newDocuments) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                  }}
                  onPendingFilesChange={setPendingFiles}
                  showDocumentsHeading={true}
                />
              </div>
              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
      </main>
    </div>    </>  );
};

export default ImportantInformationDetails;
