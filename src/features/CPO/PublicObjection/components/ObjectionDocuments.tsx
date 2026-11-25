import React, { useRef } from 'react';
import type { ObjectionDocument } from '../types/objectionJourney';
import '../../styles/cpo.css';

interface ObjectionDocumentsProps {
  documents: ObjectionDocument[];
  error?: string;
  busy: boolean;
  uploading: boolean;
  onUpload: (files: File[]) => void;
  onRemove: (document: ObjectionDocument) => void;
}

const STATUS_TEXT: Record<ObjectionDocument['status'], string> = {
  checking: 'Checking for viruses',
  ready: 'Uploaded',
  rejected: 'Could not be uploaded',
};

/** SYEIA-2932: list of uploaded documents with Remove links, and the file input for adding more. */
const ObjectionDocuments: React.FC<ObjectionDocumentsProps> = ({ documents, error, busy, uploading, onUpload, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) onUpload(files);
    // Clear the input so choosing the same file again still triggers an upload.
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      {documents.length > 0 && (
        <>
          <h2 className="govuk-heading-s">Documents uploaded</h2>
          <dl className="govuk-summary-list">
            {documents.map((document) => (
              <div className="govuk-summary-list__row" key={document.fileId}>
                <dt className="govuk-summary-list__key govuk-!-font-weight-regular">{document.fileName}</dt>
                <dd className="govuk-summary-list__value">
                  <span className={document.status === 'rejected' ? 'govuk-error-message govuk-!-margin-bottom-0' : 'govuk-hint govuk-!-margin-bottom-0'}>
                    {STATUS_TEXT[document.status]}
                  </span>
                </dd>
                <dd className="govuk-summary-list__actions">
                  <button className="govuk-link cpo-notice-text-action" type="button" disabled={busy} onClick={() => onRemove(document)}>
                    Remove<span className="govuk-visually-hidden"> {document.fileName}</span>
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
      <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
        <label className="govuk-label govuk-label--s" htmlFor="objection-documents">Upload documents (optional)</label>
        <div className="govuk-hint" id="objection-documents-hint">
          For example, a letter, maps or photos, as PDF, Word, Excel, JPG or PNG files up to 25MB each
        </div>
        {error && (
          <p className="govuk-error-message" id="objection-documents-error">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <input
          ref={inputRef}
          className={`govuk-file-upload${error ? ' govuk-file-upload--error' : ''}`}
          id="objection-documents"
          name="objection-documents"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          disabled={busy}
          aria-describedby={`objection-documents-hint${error ? ' objection-documents-error' : ''}`}
          onChange={chooseFiles}
        />
        {uploading && <p className="govuk-body govuk-!-margin-top-2" role="status">Uploading...</p>}
      </div>
    </>
  );
};

export default ObjectionDocuments;
