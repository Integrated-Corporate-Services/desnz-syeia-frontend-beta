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
import { createLogger } from '../../../../utils/logger';

import { useNWLProgress } from '../../hooks/useNWLProgress';

const logger = createLogger('EvidenceOfNegotiations');

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
  const [isFormDirty, setIsFormDirty] = useState(false); // Track if user has modified the form

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
  };

  // Log every render to track state changes
  logger.debug('[EvidenceOfNegotiations] ===== COMPONENT RENDER ===== ', {
    comments_value: comments,
    comments_length: comments.length,
    uploadedFiles_count: uploadedFiles.length,
    applicationDocuments_count: applicationDocuments.length,
    negotiationsData_available: !!negotiationsData,
    negotiationsData_comments: negotiationsData?.negotiations_comments,
    negotiationsData_comments_length: negotiationsData?.negotiations_comments?.length || 0,
    isFormDirty,
  });

  useEffect(() => {
    logger.debug('[EvidenceOfNegotiations] ===== useEffect triggered by negotiationsData change ===== ');
    logger.debug('[EvidenceOfNegotiations] negotiationsData value:', {
      hasData: !!negotiationsData,
      isNull: negotiationsData === null,
      isUndefined: negotiationsData === undefined,
      comments: negotiationsData?.negotiations_comments,
      comments_length: negotiationsData?.negotiations_comments?.length || 0,
      uploadedFilesCount: negotiationsData?.uploaded_files?.length || 0,
      applicationDocumentsCount: negotiationsData?.application_documents?.length || 0,
      raw_data: JSON.stringify(negotiationsData, null, 2),
    });
    
    if (negotiationsData) {
      const newComments = negotiationsData.negotiations_comments || '';
      const newUploadedFiles = negotiationsData.uploaded_files || [];
      const newApplicationDocuments = negotiationsData.application_documents || [];

      logger.debug('[EvidenceOfNegotiations] About to update state with:', {
        newComments,
        commentsLength: newComments.length,
        uploadedFilesCount: newUploadedFiles.length,
        applicationDocumentsCount: newApplicationDocuments.length,
        uploadedFilesSample: newUploadedFiles[0],
        applicationDocumentsSample: newApplicationDocuments[0],
      });

      // CRITICAL FIX: Only update comments if form hasn't been modified by user
      // This prevents refetches from clearing user input
      if (!isFormDirty) {
        console.log('[EvidenceOfNegotiations] Form is not dirty, updating comments state');
        setComments(newComments);
      } else {
        console.log('[EvidenceOfNegotiations] Form IS dirty, preserving user input. Not updating comments.');
      }
      
      setUploadedFiles(newUploadedFiles);
      setApplicationDocuments(newApplicationDocuments);
      
      console.log('[EvidenceOfNegotiations] State SET calls completed. State should update on next render.');
    } else {
      console.log('[EvidenceOfNegotiations] negotiationsData is null/undefined - not updating state');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negotiationsData]); // CRITICAL: Do NOT include isFormDirty in dependencies - it would cause infinite loop!

  // Track when user modifies the comments field
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Watch for comments state changes
  useEffect(() => {
    logger.debug('[EvidenceOfNegotiations] Comments state changed:', {
      comments_value: comments,
      comments_length: comments.length,
      hasUserInteracted,
      timestamp: new Date().toISOString(),
    });
    // Mark form as dirty ONLY if user has interacted with the field
    // This prevents initial data load from marking the form as dirty
    if (hasUserInteracted) {
      setIsFormDirty(true);
      logger.debug('[EvidenceOfNegotiations] Form marked as DIRTY (user has interacted)');
    }
  }, [comments, hasUserInteracted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[EvidenceOfNegotiations] ========== HANDLE SUBMIT CALLED ==========');
    console.log('[EvidenceOfNegotiations] Current state at submit time:', {
      comments_state_value: comments,
      comments_state_length: comments.length,
      comments_state_type: typeof comments,
      pendingFilesCount: pendingFiles.length,
      existingUploadedFiles: uploadedFiles.length,
      existingDocuments: applicationDocuments.length,
      isFormDirty,
      hasUserInteracted,
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

    console.log('[EvidenceOfNegotiations] About to validate comments:', {
      comments_to_validate: comments,
      comments_length: comments.length,
      comments_trimmed: comments.trim(),
      comments_trimmed_length: comments.trim().length,
    });

    if (!validateComments(comments, true)) {
      console.error('[EvidenceOfNegotiations] ❌ VALIDATION FAILED');
      window.scrollTo(0, 0);
      return;
    }

    logger.debug('[EvidenceOfNegotiations] ✓ Validation passed');

    if (!appId) {
      logger.error('[EvidenceOfNegotiations] ✗ No appId - cannot submit');
      return;
    }

    setIsSaving(true);

    try {
      // Merge existing files with newly uploaded files
      const allUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles];
      const allDocuments = [...applicationDocuments, ...newlyUploadedDocuments];

      console.log('[EvidenceOfNegotiations] ========== PREPARING TO SAVE ==========');
      console.log('[EvidenceOfNegotiations] Comments value details:', {
        comments_raw_value: comments,
        comments_type: typeof comments,
        comments_length: comments.length,
        comments_is_empty_string: comments === '',
        comments_is_null: comments === null,
        comments_is_undefined: comments === undefined,
        comments_trimmed: comments.trim(),
        comments_trimmed_length: comments.trim().length,
      });
      console.log('[EvidenceOfNegotiations] Full payload to send:', {
        has_negotiations: true,
        negotiations_comments: comments,
        no_negotiations_reason: '',
        uploaded_files_count: allUploadedFiles.length,
        application_documents_count: allDocuments.length,
      });

      // Use PATCH to update existing record
      // If record doesn't exist (404), will fallback to POST which requires has_negotiations
      // IMPORTANT: Send uploaded files and documents so backend can save them to database
      const result = await patchNegotiationsData(appId, {
        has_negotiations: true, // Required for POST fallback - user reached this page via "Yes" answer
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

      // Wait a short moment to ensure database transaction is fully committed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reset both dirty flags since we just saved
      setIsFormDirty(false);
      setHasUserInteracted(false);
      console.log('[EvidenceOfNegotiations] Form dirty flags reset after successful save');

      // Refetch data to ensure state is updated
      console.log('[EvidenceOfNegotiations] Refetching negotiations data...');
      await refetchNegotiationsData();
      console.log('[EvidenceOfNegotiations] Refetch complete');
      
      // Verify data was actually saved by checking the refetched data
      console.log('[EvidenceOfNegotiations] Verification - checking refetched data:', {
        hasComments: !!negotiationsData?.negotiations_comments,
        commentsLength: negotiationsData?.negotiations_comments?.length || 0,
        uploadedFilesCount: negotiationsData?.uploaded_files?.length || 0,
        applicationDocumentsCount: negotiationsData?.application_documents?.length || 0,
      });
      
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
                onChange={(value) => {
                  console.log('[EvidenceOfNegotiations] Textarea onChange called with value:', {
                    value,
                    value_length: value.length,
                  });
                  // Mark that user has interacted with this field
                  setHasUserInteracted(true);
                  setComments(value);
                }}
                characterRemainingMessage={MESSAGES.CHARACTER_REMAINING}
              />

              {/* File Upload Section */}
              <div className="govuk-form-group">
                {uploadedFiles && uploadedFiles.length > 0 && (
                  <h2 className="govuk-heading-s govuk-!-margin-bottom-4">{FORM_LABELS.DOCUMENTS_UPLOADED}</h2>
                )}
                <FileUpload
                  ref={fileUploadRef}
                  title={FORM_LABELS.UPLOAD_EVIDENCE}
                  showTitle={true}
                  prefix={`${appId}/${FILE_CATEGORIES.NEGOTIATIONS}`}
                  applicationId={appId}
                  category={FILE_CATEGORIES.NEGOTIATIONS}
                  addedBy={userId}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}                  onDeleteFile={handleDeleteFile}                  onUploaded={(newUploadedFiles, newDocuments) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                  }}
                  onPendingFilesChange={(files) => setPendingFiles(files)}
                  showDocumentsHeading={true}
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
