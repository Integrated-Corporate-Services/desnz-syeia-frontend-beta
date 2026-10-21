import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import type { ApplicationDocument, UploadedFile } from '../../../types/fileUpload';
import { FIR_CATEGORY_LABELS, FIR_MESSAGES } from '../constants/fir.constants';
import { useFirRequest, useFirRoute, useFirSelectedCategories } from '../hooks';
import { firUploadEndpoints, submitFurtherInformationResponse } from '../services';
import { FirErrorSummary } from './FirErrorSummary';
import { FirRequestDetails } from './FirRequestDetails';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';

interface FirResponseFormProps {
  acceptsDocuments: boolean;
}

export const FirResponseForm: React.FC<FirResponseFormProps> = ({ acceptsDocuments }) => {
  const { applicationId, requestId, requestPath, location } = useFirRoute();
  const { request, error, setError } = useFirRequest(applicationId, requestId);
  const navigate = useNavigate();
  const { selectedCategories, clearSelectedCategories } = useFirSelectedCategories(applicationId, requestId);
  const uploadRefs = useRef<Record<string, FileUploadHandle | null>>({});
  // Captures errors from FileUpload's catch path, which resolves triggerUpload with empty scanErrors
  const uploadErrorsRef = useRef<Record<string, string[]>>({});
  const [comment, setComment] = useState('');
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [uploadedFilesByCategory, setUploadedFilesByCategory] = useState<Record<string, UploadedFile[]>>({});

  const backPath = acceptsDocuments
    ? `${requestPath}/${requestId}/document-types`
    : `${requestPath}/${requestId}/upload-decision`;

  useBreadcrumb(<Link className="govuk-back-link" to={backPath}>Back</Link>);

  if (!applicationId || !requestId) return null;

  const handleDeleteFile = (category: string, fileId: string) => {
    setUploadedFilesByCategory((current) => ({
      ...current,
      [category]: (current[category] || []).filter((file) => file.id !== fileId),
    }));
    setDocuments((current) => current.filter((document) => document.fileId !== fileId));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    uploadErrorsRef.current = {};

    const uploadResults = acceptsDocuments
      ? await Promise.all(selectedCategories.map((category) => uploadRefs.current[category]?.triggerUpload()))
      : [];
    const scanError = uploadResults.flatMap((result) => result?.scanErrors || [])[0];
    const validationError = Object.values(uploadErrorsRef.current).flat().find(Boolean);
    if (scanError || validationError) {
      setError(scanError || validationError || FIR_MESSAGES.RESPONSE_FAILED);
      return;
    }

    const uploadedDocuments = [
      ...documents,
      ...uploadResults.flatMap((result) => result?.applicationDocuments || []),
    ];
    if (!comment.trim() && uploadedDocuments.length === 0) {
      setError(FIR_MESSAGES.RESPONSE_REQUIRED);
      return;
    }

    try {
      await submitFurtherInformationResponse(applicationId, requestId, {
        responseText: comment,
        documentCategories: selectedCategories,
        documentLinks: uploadedDocuments.map((document) => ({
          documentId: document.documentId,
          documentCategory: document.category,
        })),
      });
      clearSelectedCategories();
      navigate(`${requestPath}/${requestId}/submitted`);
    } catch {
      setError(FIR_MESSAGES.RESPONSE_FAILED);
    }
  };

  return (
    <div className="govuk-width-container">
      {request && <span className="govuk-caption-l">{request.desnzRef}</span>}
      <h1 className="govuk-heading-l">Provide the information requested</h1>
      <FirErrorSummary error={error} />
      {request && (
        <form onSubmit={submit} noValidate>
          {acceptsDocuments && selectedCategories.map((category) => (
            <div className="govuk-!-margin-bottom-6" key={category}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Upload {FIR_CATEGORY_LABELS[category] || category}</h2>
              <details className="govuk-details" data-module="govuk-details" open={(uploadedFilesByCategory[category]?.length ?? 0) > 0}>
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">View or add documents</span>
                </summary>
                <div className="govuk-details__text">
                  <FileUpload
                    ref={(instance) => { uploadRefs.current[category] = instance; }}
                    title="Upload documents"
                    applicationId={applicationId}
                    category={category}
                    prefix={`${applicationId}/FURTHER_INFORMATION_REQUESTED/${requestId}/${category}`}
                    uploadEndpoints={firUploadEndpoints(applicationId, requestId)}
                    uploadImmediately
                    uploadedFiles={uploadedFilesByCategory[category] || []}
                    applicationDocuments={documents}
                    onUploaded={(newFiles, newDocuments) => {
                      setUploadedFilesByCategory((current) => ({
                        ...current,
                        [category]: [...(current[category] || []), ...newFiles],
                      }));
                      setDocuments((current) => [...current, ...newDocuments]);
                    }}
                    onDeleteFile={(fileId) => handleDeleteFile(category, fileId)}
                    onValidationErrors={(errors) => {
                      uploadErrorsRef.current[category] = errors;
                    }}
                  />
                </div>
              </details>
            </div>
          ))}
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="additional-information">
              Additional information{acceptsDocuments ? ' (optional)' : ''}
            </label>
            <textarea
              className="govuk-textarea"
              id="additional-information"
              rows={5}
              maxLength={4000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              aria-describedby="additional-information-hint"
            />
            <div id="additional-information-hint" className="govuk-hint" aria-live="polite">
              You can enter up to {(4000 - comment.length).toLocaleString()} characters.
            </div>
          </div>
          <button className="govuk-button" type="submit">Submit</button>
        </form>
      )}
      {request && <FirRequestDetails request={request} />}
    </div>
  );
};
