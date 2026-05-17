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

  const [details, setDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (additionalInformationData) {
      setDetails(additionalInformationData.other_information_details || '');
      setUploadedFiles(additionalInformationData.uploaded_files || []);
      setApplicationDocuments(additionalInformationData.application_documents || []);
    }
  }, [additionalInformationData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload pending files first
    if (fileUploadRef.current && pendingFiles.length > 0) {
      await fileUploadRef.current.triggerUpload();
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
      // Get document IDs from uploaded documents
      const documentIds = applicationDocuments.map(doc => doc.documentId);

      await createOrUpdateAdditionalInformationData(appId, {
        has_related_applications: additionalInformationData?.has_related_applications ?? false,
        related_applications_details: additionalInformationData?.related_applications_details,
        has_other_information: true,
        other_information_details: details,
        additional_document_ids: documentIds.length > 0 ? documentIds : undefined,
      });

      navigateToTaskList();
    } catch (error: unknown) {
      console.error('Error saving important information details:', error);
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
                <label className="govuk-label" htmlFor="details">
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
                <h2 className="govuk-heading-m">{FORM_LABELS.DOCUMENTS_UPLOADED}</h2>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                    {FORM_LABELS.UPLOAD_DOCUMENTS}
                </h3>
                <FileUpload
                  ref={fileUploadRef}
                  title=""
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_ADDITIONAL_INFORMATION}`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_ADDITIONAL_INFORMATION}
                  addedBy={userId}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  onUploaded={(newUploadedFiles, newDocuments) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                  }}
                  onPendingFilesChange={(files) => setPendingFiles(files)}
                  showDocumentsHeading={false}
                />
              </div>
              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImportantInformationDetails;
