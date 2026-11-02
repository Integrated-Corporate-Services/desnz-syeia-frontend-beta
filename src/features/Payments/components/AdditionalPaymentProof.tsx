import { Ref } from 'react';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { additionalEvidenceEndpoints } from '../../../services/additionalPaymentsService';
import { ApplicationDocument, UploadedFile } from '../../../types/fileUpload';
import { ADDITIONAL_PAYMENT_COPY as COPY } from '../constants/additionalPayments';

export function AdditionalPaymentProof({ applicationId, requestId, transaction, onTransaction, upload, files, documents, busy, errors, transactionError, onErrors, onUploaded, onDelete, actions }: {
  applicationId: string; requestId: string; transaction: string; onTransaction: (value: string) => void;
  upload: Ref<FileUploadHandle>; files: UploadedFile[]; onErrors: (errors: string[]) => void;
  documents: ApplicationDocument[]; busy: boolean; errors: string[]; transactionError?: string;
  onUploaded: (files: UploadedFile[], documents: ApplicationDocument[]) => void; onDelete: (id: string) => Promise<void>; actions: React.ReactNode;
}) {
  return <>
    <p className="govuk-body">{COPY.proof}</p>
    <p className="govuk-body">{COPY.proofExamples}</p>
    <ul className="govuk-list govuk-list--bullet">
      <li><strong>Transaction number</strong>{COPY.transactionExample}</li>
      <li><strong>Document showing the bank transfer</strong>{COPY.documentExample}</li>
    </ul>
    <div className={`govuk-form-group${transactionError ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label govuk-!-font-weight-bold" htmlFor="transaction-number">{COPY.transactionLabel}</label>
      <div className="govuk-hint" id="transaction-hint">{COPY.transactionHint}</div>
      {transactionError && <p id="transaction-error" className="govuk-error-message">{transactionError}</p>}
      <input className="govuk-input govuk-input--width-20" id="transaction-number" disabled={busy}
        aria-invalid={transactionError ? true : undefined}
        aria-describedby={`transaction-hint${transactionError ? ' transaction-error' : ''}`} maxLength={100} value={transaction} onChange={event => onTransaction(event.target.value)} />
    </div>
    <h2 className="govuk-heading-s">{COPY.uploadHeading}</h2>
    <FileUpload key={`${applicationId}:${requestId}`} ref={upload} title={COPY.uploadTitle} showTitle={false}
      applicationId={applicationId} category={FILE_CATEGORIES.PAYMENT_PROOF} subCategory={requestId}
      prefix={`${applicationId}/ADDITIONAL_PAYMENTS/${requestId}`} uploadEndpoints={additionalEvidenceEndpoints(applicationId, requestId)}
      uploadedFiles={files} applicationDocuments={documents} disabled={busy} errors={errors}
      onValidationErrors={onErrors} onUploaded={onUploaded} onRemoveUploadedFile={onDelete} />
    <div className="govuk-!-margin-top-6">{actions}</div>
  </>;
}