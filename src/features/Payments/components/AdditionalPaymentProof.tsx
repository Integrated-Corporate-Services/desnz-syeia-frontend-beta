import { Ref } from 'react';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { additionalEvidenceEndpoints } from '../../../services/additionalPaymentsService';
import { UploadedFile } from '../../../types/fileUpload';
import { ADDITIONAL_PAYMENT_COPY as COPY } from '../constants/additionalPayments';

export function AdditionalPaymentProof({ applicationId, requestId, transaction, onTransaction, upload, files, onErrors, onUploaded, onDelete, actions }: {
  applicationId: string; requestId: string; transaction: string; onTransaction: (value: string) => void;
  upload: Ref<FileUploadHandle>; files: UploadedFile[]; onErrors: (errors: string[]) => void;
  onUploaded: (files: UploadedFile[]) => void; onDelete: (id: string) => void; actions: React.ReactNode;
}) {
  return <>
    <p className="govuk-body">{COPY.proof}</p>
    <p className="govuk-body">{COPY.proofExamples}</p>
    <ul className="govuk-list govuk-list--bullet">
      <li><strong>Transaction number</strong>{COPY.transactionExample}</li>
      <li><strong>Document showing the bank transfer</strong>{COPY.documentExample}</li>
    </ul>
    <div className="govuk-form-group">
      <label className="govuk-label govuk-!-font-weight-bold" htmlFor="transaction-number">{COPY.transactionLabel}</label>
      <div className="govuk-hint" id="transaction-hint">{COPY.transactionHint}</div>
      <input className="govuk-input govuk-input--width-20" id="transaction-number" aria-describedby="transaction-hint" maxLength={100} value={transaction} onChange={event => onTransaction(event.target.value)} />
    </div>
    <h2 className="govuk-heading-s">{COPY.uploadHeading}</h2>
    <FileUpload key={`${applicationId}:${requestId}`} ref={upload} title={COPY.uploadTitle} showTitle={false}
      applicationId={applicationId} category={FILE_CATEGORIES.PAYMENT_PROOF} subCategory={requestId}
      prefix={`${applicationId}/ADDITIONAL_PAYMENTS/${requestId}`} uploadEndpoints={additionalEvidenceEndpoints(applicationId, requestId)}
      uploadedFiles={files} onValidationErrors={onErrors} onUploaded={onUploaded} onDeleteFile={onDelete} />
    <div className="govuk-!-margin-top-6">{actions}</div>
  </>;
}