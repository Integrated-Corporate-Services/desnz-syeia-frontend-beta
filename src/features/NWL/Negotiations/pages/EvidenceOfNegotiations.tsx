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
import { patchNegotiationsData } from '../services';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';

import { useNWLProgress } from '../../hooks/useNWLProgress';

/**
 * Evidence of Negotiations Page
 * Collects comments and documents about negotiations
 */
const EvidenceOfNegotiations: React.FC = () => {
  const { appId, negotiationsData, refetchNegotiationsData } = useNegotiationsData();
  const { errors, validateComments } = useFormValidation();
  const { navigateToTaskList } = useNegotiationsNavigation(appId);
  const { user } = useAuthUserContext();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const { updateProgress } = useNWLProgress(appId);

  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    console.log('[EvidenceOfNegotiations] negotiationsData changed:', {
      hasData: !!negotiationsData,
      comments: negotiationsData?.negotiations_comments,
      uploadedFilesCount: negotiationsData?.uploaded_files?.length || 0,
      applicationDocumentsCount: negotiationsData?.application_documents?.length || 0,
    });
    
    if (negotiationsData) {
      setComments(negotiationsData.negotiations_comments || '');
      setUploadedFiles(negotiationsData.uploaded_files || []);
      setApplicationDocuments(negotiationsData.application_documents || []);
      
      console.log('[EvidenceOfNegotiations] State updated:', {
        comments: negotiationsData.negotiations_comments,
        uploadedFilesCount: negotiationsData.uploaded_files?.length || 0,
        applicationDocumentsCount: negotiationsData.application_documents?.length || 0,
      });
    } else {
      console.log('[EvidenceOfNegotiations] No negotiations data available');
    }
  }, [negotiationsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[EvidenceOfNegotiations] handleSubmit started', {
      pendingFilesCount: pendingFiles.length,
      existingUploadedFiles: uploadedFiles.length,
      existingDocuments: applicationDocuments.length,
    });

    // Capture newly uploaded files (if any)
    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];

    // Upload pending files first and capture the result
    if (fileUploadRef.current && pendingFiles.length > 0) {
      console.log('[EvidenceOfNegotiations] Triggering upload for pending files...');
      const uploadResult = await fileUploadRef.current.triggerUpload();
      newlyUploadedFiles = uploadResult.uploadedFiles;
      newlyUploadedDocuments = uploadResult.applicationDocuments;
      
      console.log('[EvidenceOfNegotiations] Upload completed:', {
        newlyUploadedFilesCount: newlyUploadedFiles.length,
        newlyUploadedDocumentsCount: newlyUploadedDocuments.length,
        files: newlyUploadedFiles.map(f => ({ id: f.id, filename: f.filename })),
        documents: newlyUploadedDocuments.map(d => ({ documentId: d.documentId, category: d.category })),
      });
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
      // Merge existing files with newly uploaded files
      const allUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles];
      const allDocuments = [...applicationDocuments, ...newlyUploadedDocuments];

      console.log('[EvidenceOfNegotiations] Preparing to send to backend:', {
        uploaded_files_count: allUploadedFiles.length,
        application_documents_count: allDocuments.length,
        comments_length: comments.length,
        uploaded_files: JSON.stringify(allUploadedFiles, null, 2),
        application_documents: JSON.stringify(allDocuments, null, 2),
      });

      // Use POST (upsert) instead of PATCH to ensure record is created if it doesn't exist
      // IMPORTANT: Send uploaded files and documents so backend can save them to database
      const result = await patchNegotiationsData(appId, {
        negotiations_comments: comments,
        // Clear field from opposite flow
        no_negotiations_reason: '',
        // Send ALL file metadata to backend (existing + newly uploaded)
        uploaded_files: allUploadedFiles,
        application_documents: allDocuments,
      });

      console.log('[EvidenceOfNegotiations] Backend response:', result);

      if (!result) {
        console.error('[EvidenceOfNegotiations] No response from backend - save may have failed');
        alert('Failed to save data. Please try again.');
        return;
      }

      // Refetch data to ensure state is updated
      console.log('[EvidenceOfNegotiations] Refetching negotiations data...');
      await refetchNegotiationsData();
      console.log('[EvidenceOfNegotiations] Refetch complete');
      
      // Update progress for Negotiations section
      try {
        await updateProgress('Negotiations', 'Completed');
        console.log('[EvidenceOfNegotiations] Progress updated for Negotiations section');
      } catch (progressError) {
        console.error('[EvidenceOfNegotiations] Error updating progress', progressError);
        // Continue even if progress update fails
      }
      
      navigateToTaskList();
    } catch (error) {
      console.error('[EvidenceOfNegotiations] Error saving negotiations evidence:', error);
      alert('An error occurred while saving. Please try again.');
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
