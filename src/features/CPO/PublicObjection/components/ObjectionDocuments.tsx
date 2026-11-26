import React, { useRef } from 'react';
import type { ObjectionDocument } from '../types/objectionJourney';
import '../../styles/cpo.css';
import '../../../../styles/Fileupload.css';

interface ObjectionDocumentsProps {
  documents: ObjectionDocument[];
  error?: string;
  busy: boolean;
  uploading: boolean;
  onUpload: (files: File[]) => void;
  onRemove: (document: ObjectionDocument) => void;
}

// A finished, clean upload shows just its name, as in the design; only these states need words.
const STATUS_TEXT: Partial<Record<ObjectionDocument['status'], string>> = {
  checking: 'Checking for viruses',
  rejected: 'Could not be uploaded',
};

/**
 * SYEIA-2932: uploaded documents with Remove links, and the drop zone for adding more.
 * Same markup and styles as the shared components/FileUpload (gds-upload-*), which cannot be reused here
 * because it uploads through presigned URLs for a signed-in applicant.
 */
const ObjectionDocuments: React.FC<ObjectionDocumentsProps> = ({ documents, error, busy, uploading, onUpload, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) onUpload(files);
    // Clear the input so choosing the same file again still triggers an upload.
    if (inputRef.current) inputRef.current.value = '';
  };

  const dropFiles = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (busy) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onUpload(files);
  };

  const openPicker = (event: React.MouseEvent<HTMLDivElement>) => {
    // The input sits inside the drop zone, so its own click bubbles back here.
    if (busy || event.target === inputRef.current) return;
    inputRef.current?.click();
  };

  return (
    <>
      {documents.length > 0 && (
        <div className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Documents uploaded</h2>
          <ul className="govuk-task-list">
            {documents.map((document) => (
              <li className="govuk-task-list__item" key={document.fileId}>
                <span className="govuk-task-list__name-and-hint">
                  <span>{document.fileName}</span>
                  {STATUS_TEXT[document.status] && (
                    <span className={`govuk-task-list__hint${document.status === 'rejected' ? ' govuk-error-message govuk-!-margin-bottom-0' : ''}`}>
                      {STATUS_TEXT[document.status]}
                    </span>
                  )}
                </span>
                <span className="govuk-task-list__status">
                  <button className="govuk-link cpo-notice-text-action" type="button" disabled={busy} onClick={() => onRemove(document)}>
                    Remove<span className="govuk-visually-hidden"> {document.fileName}</span>
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
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
        {uploading && (
          <div className="gds-upload-status govuk-!-margin-bottom-4" role="status" aria-live="polite" aria-atomic="true">
            <span className="gds-upload-spinner" aria-hidden="true" />
            <strong className="govuk-body govuk-!-font-weight-bold govuk-!-margin-0">
              Uploading your files and checking them for viruses. This can take a few moments.
            </strong>
          </div>
        )}
        <div
          className={`gds-upload-dropzone${busy ? ' gds-upload-dropzone--disabled' : ''}`}
          aria-disabled={busy}
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropFiles}
          onClick={openPicker}
        >
          <input
            ref={inputRef}
            className="govuk-visually-hidden"
            id="objection-documents"
            name="objection-documents"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            disabled={busy}
            aria-describedby={`objection-documents-hint${error ? ' objection-documents-error' : ''}`}
            onChange={chooseFiles}
          />
          <div className="gds-upload-dropzone-content">
            <span className="govuk-body govuk-!-margin-0">No file chosen</span>
          </div>
          <button type="button" className="gds-upload-choose" disabled={busy}>Choose file</button>
          <span className="govuk-body govuk-!-margin-0">or drop file</span>
        </div>
      </div>
    </>
  );
};

export default ObjectionDocuments;
