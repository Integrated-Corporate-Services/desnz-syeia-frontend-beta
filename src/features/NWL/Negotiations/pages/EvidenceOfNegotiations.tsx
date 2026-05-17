import React, { useState, useEffect, useRef } from 'react';
import {
  LABELS,
  FORM_LABELS,
  CONTENT,
  CHARACTER_LIMITS,
  MESSAGES,
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
  TextAreaWithCounter,
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

    if (!validateComments(comments, true)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      await updateNegotiationsData(appId, {
        has_negotiations: true,
        negotiations_comments: comments,
        // Clear field from opposite flow
        no_negotiations_reason: '',
      });

      navigateToTaskList();
    } catch (error) {
      console.error('Error saving negotiations evidence:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
              <TextAreaWithCounter
                id="comments"
                name="comments"
                label={FORM_LABELS.ADDITIONAL_COMMENTS}
                labelClassName="govuk-label govuk-label--m"
                hint={CONTENT.EVIDENCE_INTRO}
                value={comments}
                error={errors.comments}
                rows={8}
                maxLength={CHARACTER_LIMITS.MAX_COMMENTS}
                onChange={setComments}
                characterRemainingMessage={MESSAGES.CHARACTER_REMAINING}
              />

              {/* File Upload Section */}
              <div className="govuk-form-group">
                <h2 className="govuk-heading-m">{FORM_LABELS.DOCUMENTS_UPLOADED}</h2>
                <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                    {FORM_LABELS.UPLOAD_EVIDENCE}
                </h3>
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
