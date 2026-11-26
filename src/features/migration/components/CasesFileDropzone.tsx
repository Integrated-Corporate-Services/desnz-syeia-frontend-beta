import React, { useRef } from 'react';
import '../../../styles/Fileupload.css';
import { formatFileSize } from '../utils/format';

interface CasesFileDropzoneProps {
  /** id of the file input; the page's label and the error summary link point to it. */
  id: string;
  file: File | null;
  onChange: (file: File | null) => void;
  hasError: boolean;
  disabled: boolean;
  uploading: boolean;
  uploadingText: string;
  describedBy: string;
}

/**
 * Same look as the shared FileUpload (S37 / NWL pages): "Choose file or drop file" zone, the chosen
 * file in a task list with a Remove link, and the spinner while uploading. One .xlsx file only;
 * the page uploads it itself (the shared component is tied to the documents upload flow).
 */
export const CasesFileDropzone: React.FC<CasesFileDropzoneProps> = ({
  id,
  file,
  onChange,
  hasError,
  disabled,
  uploading,
  uploadingText,
  describedBy,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const choose = (files: FileList | null | undefined) => {
    if (disabled) return;
    onChange(files?.[0] ?? null);
  };

  const remove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (inputRef.current) inputRef.current.value = '';
    onChange(null);
  };

  return (
    <div className={`gds-upload-container${hasError ? ' gds-upload-container--error' : ''}`}>
      {file && (
        <div className="govuk-!-margin-bottom-6">
          <h3 className="govuk-visually-hidden">File to be uploaded</h3>
          <ul className="govuk-task-list">
            <li className="govuk-task-list__item">
              <span className="govuk-task-list__name-and-hint">
                <span className="govuk-body govuk-!-margin-0">{file.name}</span>
                <span className="govuk-task-list__hint">{formatFileSize(file.size)}</span>
              </span>
              {!disabled && (
                <span className="govuk-task-list__status">
                  <a href="#" className="govuk-link" onClick={remove}>
                    Remove<span className="govuk-visually-hidden"> {file.name}</span>
                  </a>
                </span>
              )}
            </li>
          </ul>
        </div>
      )}

      <div role="status" aria-live="polite" aria-atomic="true">
        {uploading && (
          <div className="gds-upload-status govuk-!-margin-bottom-4">
            <span className="gds-upload-spinner" aria-hidden="true"></span>
            <strong className="govuk-body govuk-!-font-weight-bold govuk-!-margin-0">{uploadingText}</strong>
          </div>
        )}
      </div>

      <div
        className={`gds-upload-dropzone${disabled ? ' gds-upload-dropzone--disabled' : ''}${hasError ? ' gds-upload-dropzone--error' : ''}`}
        aria-disabled={disabled}
        data-testid="cases-file-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          choose(event.dataTransfer?.files);
        }}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          id={id}
          name="casesFile"
          type="file"
          className="govuk-visually-hidden"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => choose(event.target.files)}
        />
        <div className="gds-upload-dropzone-content">
          <span>{file ? file.name : 'No file chosen'}</span>
          <button type="button" className="gds-upload-choose" disabled={disabled}>
            {uploading ? 'Uploading…' : 'Choose file'}
          </button>
          <span>or drop file</span>
        </div>
      </div>
    </div>
  );
};

export default CasesFileDropzone;
