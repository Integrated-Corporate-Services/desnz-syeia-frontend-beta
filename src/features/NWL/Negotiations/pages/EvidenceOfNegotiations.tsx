import React, { useState, useEffect, useRef } from 'react';
import {
  LABELS,
  FORM_LABELS,
  CONTENT,
} from '../constants/negotiationsConstants';
import {
  useNegotiationsData,
  useFormValidation,
  useNegotiationsNavigation,
} from '../hooks';
import {
  NegotiationsBreadcrumbs,
  ErrorSummary,
  FormActions,
} from '../components';
import { updateNegotiationsData } from '../services';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';

/**
 * Evidence of Negotiations Page
 * Collects comments and documents about negotiations
 */
const EvidenceOfNegotiations: React.FC = () => {
  const { appId, negotiationsData } = useNegotiationsData();
  const { errors, validateComments } = useFormValidation();
  const { navigateToTaskList } = useNegotiationsNavigation(appId);
  const { user } = useAuthUserContext();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (negotiationsData) {
      setComments(negotiationsData.negotiations_comments || '');
      setUploadedFiles(negotiationsData.uploaded_files || []);
      setApplicationDocuments(negotiationsData.application_documents || []);
    }
  }, [negotiationsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload pending files first
    if (fileUploadRef.current && pendingFiles.length > 0) {
      await fileUploadRef.current.triggerUpload();
    }

    if (!validateComments(comments, false)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      await updateNegotiationsData(appId, {
        negotiations_comments: comments,
      });

      navigateToTaskList();
    } catch (error) {
      console.error('Error saving negotiations evidence:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = comments.length;
  const characterLimit = 4000;
  const charactersRemaining = characterLimit - characterCount;

  return (
    <div className="govuk-width-container">
      <NegotiationsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.EVIDENCE_TITLE}</h1>

            <ErrorSummary errors={errors} />

            <form onSubmit={handleSubmit} noValidate>
              {/* Additional Comments */}
              <div
                className={`govuk-form-group ${
                  errors.comments ? 'govuk-form-group--error' : ''
                }`}
              >
                <label className="govuk-label" htmlFor="comments">
                  {FORM_LABELS.ADDITIONAL_COMMENTS}
                </label>
                <div id="comments-hint" className="govuk-hint">
                  {CONTENT.EVIDENCE_INTRO}
                </div>
                {errors.comments && (
                  <p id="comments-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{' '}
                    {errors.comments}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea ${
                    errors.comments ? 'govuk-textarea--error' : ''
                  }`}
                  id="comments"
                  name="comments"
                  rows={8}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  aria-describedby={
                    errors.comments
                      ? 'comments-error comments-hint comments-info'
                      : 'comments-hint comments-info'
                  }
                  maxLength={characterLimit}
                />
                <div
                  id="comments-info"
                  className="govuk-hint govuk-character-count__message"
                  aria-live="polite"
                >
                  {charactersRemaining >= 0
                    ? `You have ${charactersRemaining} characters remaining`
                    : `You have ${Math.abs(charactersRemaining)} characters too many`}
                </div>
                <div className="govuk-hint">{CONTENT.CHARACTER_LIMIT}</div>
              </div>

              {/* File Upload Section */}
              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{FORM_LABELS.DOCUMENTS_UPLOADED}</h2>
                
                <FileUpload
                  ref={fileUploadRef}
                  title=""
                  prefix={`${appId}/${FILE_CATEGORIES.NEGOTIATIONS}`}
                  applicationId={appId}
                  category={FILE_CATEGORIES.NEGOTIATIONS}
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

                <div className="govuk-hint govuk-!-margin-top-4">
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                    {FORM_LABELS.UPLOAD_EVIDENCE}
                  </h3>
                  <p className="govuk-body-s">
                    You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx,
                    .xls, and .xlsx files of up to 25MB each. Files cannot be
                    password protected.
                  </p>
                </div>
              </div>

              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EvidenceOfNegotiations;
