import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import type { ApplicationDocument, UploadedFile } from '../../../types/fileUpload';
import { FIR_CATEGORY_LABELS, FIR_MESSAGES } from '../constants/fir.constants';
import { useFirRequest, useFirRoute, useFirSelectedCategories } from '../hooks';
import { firUploadEndpoints, submitFurtherInformationResponse } from '../services';
import { FirErrorSummary } from './FirErrorSummary';
import { FirRequestDetails } from './FirRequestDetails';

interface FirResponseFormProps {
  acceptsDocuments: boolean;
}

export const FirResponseForm: React.FC<FirResponseFormProps> = ({ acceptsDocuments }) => {
  const { applicationId, requestId, requestPath, location } = useFirRoute();
  const { request, error, setError } = useFirRequest(applicationId, requestId);
  const navigate = useNavigate();
  const { selectedCategories, clearSelectedCategories } = useFirSelectedCategories(applicationId, requestId);
  const uploadRefs = useRef<Record<string, FileUploadHandle | null>>({});
  const [comment, setComment] = useState('');
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);

  if (!applicationId || !requestId) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const uploadResults = acceptsDocuments
      ? await Promise.all(selectedCategories.map((category) => uploadRefs.current[category]?.triggerUpload()))
      : [];
    const scanError = uploadResults.flatMap((result) => result?.scanErrors || [])[0];
    if (scanError) {
      setError(scanError);
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

  const backPath = acceptsDocuments
    ? `${requestPath}/${requestId}/document-types`
    : `${requestPath}/${requestId}/upload-decision`;

  return (
    <div className="govuk-width-container">
      <Link className="govuk-back-link" to={backPath}>Back</Link>
      <h1 className="govuk-heading-l">Provide the information requested</h1>
      <FirErrorSummary error={error} />
      {request && (
        <form onSubmit={submit} noValidate>
          {acceptsDocuments && selectedCategories.map((category) => (
            <FileUpload
              key={category}
              ref={(instance) => { uploadRefs.current[category] = instance; }}
              title={`Upload ${FIR_CATEGORY_LABELS[category] || category}`}
              applicationId={applicationId}
              category={category}
              prefix={`${applicationId}/fir/${requestId}/${category}`}
              uploadEndpoints={firUploadEndpoints(applicationId, requestId)}
              onUploaded={(_files: UploadedFile[], newDocuments) => {
                setDocuments((current) => [...current, ...newDocuments]);
              }}
            />
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
            />
            <div className="govuk-hint">You can enter up to 4,000 characters.</div>
          </div>
          <button className="govuk-button" type="submit">Submit</button>
        </form>
      )}
      {request && <FirRequestDetails request={request} />}
    </div>
  );
};
