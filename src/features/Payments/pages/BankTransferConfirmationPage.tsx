import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { useAuthUser } from '../../../hooks/useAuthUser';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('BankTransferConfirmationPage');

const BankTransferConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const [transactionNumber, setTransactionNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const { invoiceNumber, totalAmount } = location.state || {};

  // No on-mount create/upsert call — payment will be created/submitted when user clicks Submit.

  const handleSubmit = async () => {
    // Transaction number is optional now

    // Validate required fields: invoiceNumber and totalAmount
    if (!invoiceNumber || invoiceNumber === '') {
      setError('Invoice number is required');
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView();
      }, 0);
      return;
    }

    if (totalAmount === undefined || totalAmount === null) {
      setError('Amount is required');
      setTimeout(() => {
        const errorSummary = document.querySelector('.govuk-error-summary');
        if (errorSummary) errorSummary.scrollIntoView();
      }, 0);
      return;
    }

    // No explicit user confirmation required here — backend saves payment on page load

    setLoading(true);
    setError('');

    try {
      logger.info('Submitting application with bank transfer', {
        applicationId,
        invoiceNumber,
        transactionNumber
      });

      // If there are pending files in the FileUpload component, trigger upload now
      let uploadedFiles: any[] = [];
      let applicationDocuments: any[] = [];
      if (fileUploadRef.current && pendingFiles.length > 0) {
        const uploadResult = await fileUploadRef.current.triggerUpload();
        uploadedFiles = uploadResult.uploadedFiles || [];
        applicationDocuments = uploadResult.applicationDocuments || [];
      }

      // Prepare payload including both snake_case and camelCase keys
      const payload: any = {
        // snake_case
        payment_method: 'bank_transfer',
        invoice_number: invoiceNumber,
        transaction_number: transactionNumber || null,
        amount: totalAmount,
        user_id: user?.user_id || null,
        // camelCase (controller may expect these)
        paymentMethod: 'bank_transfer',
        invoiceNumber: invoiceNumber,
        transactionNumber: transactionNumber || null,
        userId: user?.user_id || null,
      };

      if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
        // include both forms for uploaded files
        payload.uploaded_files = uploadedFiles.map((f: any) => ({
          id: f.id,
          storage_provider: f.storage_provider || f.storageProvider || null,
          s3_key: f.s3_key || f.s3Key || null,
          bucket_name: f.bucket_name || f.bucketName || null,
          virtual_folder: f.virtual_folder || f.virtualFolder || null,
          filename: f.filename || f.fileName || null,
          file_content_type: f.file_content_type || f.fileContentType || f.contentType || null,
          file_size_bytes: f.file_size_bytes || f.fileSizeBytes || f.fileSize || null,
          uploaded_at_timestamp: f.uploaded_at_timestamp || f.uploadedAtTimestamp || f.uploadedAt || null
        }));
        payload.uploadedFiles = uploadedFiles.map((f: any) => ({
          id: f.id,
          storageProvider: f.storage_provider || f.storageProvider || null,
          s3Key: f.s3_key || f.s3Key || null,
          bucketName: f.bucket_name || f.bucketName || null,
          virtualFolder: f.virtual_folder || f.virtualFolder || null,
          filename: f.filename || f.fileName || null,
          fileContentType: f.file_content_type || f.fileContentType || f.contentType || null,
          fileSizeBytes: f.file_size_bytes || f.fileSizeBytes || f.fileSize || null,
          uploadedAtTimestamp: f.uploaded_at_timestamp || f.uploadedAtTimestamp || f.uploadedAt || null
        }));
      }

      if (Array.isArray(applicationDocuments) && applicationDocuments.length > 0) {
        payload.application_documents = applicationDocuments.map((d: any) => ({
          document_id: d.document_id || d.documentId || null,
          application_id: d.application_id || d.applicationId || null,
          file_id: d.file_id || d.fileId || null,
          category: d.category || null,
          sub_category: d.sub_category || d.subCategory || null,
          title: d.title || null,
          virtual_folder: d.virtual_folder || d.virtualFolder || null,
          added_by: d.added_by || d.addedBy || null,
          added_at: d.added_at || d.addedAt || null,
          consultation_id: d.consultation_id || d.consultationId || null
        }));
        payload.applicationDocuments = applicationDocuments.map((d: any) => ({
          documentId: d.document_id || d.documentId || null,
          applicationId: d.application_id || d.applicationId || null,
          fileId: d.file_id || d.fileId || null,
          category: d.category || null,
          subCategory: d.sub_category || d.subCategory || null,
          title: d.title || null,
          virtualFolder: d.virtual_folder || d.virtualFolder || null,
          addedBy: d.added_by || d.addedBy || null,
          addedAt: d.added_at || d.addedAt || null,
          consultationId: d.consultation_id || d.consultationId || null
        }));
      }

      const response = await fetch(`/backend/api/application/${applicationId}/save-with-bank-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...payload, action: 'submit' }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to submit application with bank transfer';
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          logger.error('[BankTransferConfirmationPage] Submission failed:', errorData);
        } else {
          logger.error('[BankTransferConfirmationPage] Non-JSON response:', { status: response.status, statusText: response.statusText });
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      logger.info('Application submitted successfully:', result);
      navigate(`${S37_BASE_URL}/${applicationId}/bank-transfer-success`, {
        state: {
          invoiceNumber,
          totalAmount,
          desnz_ref: result.desnz_ref || result.desnzReference,
          referenceNumber: result.payment?.reference,
        }
      });
    } catch (err: any) {
      logger.error('Failed to submit application:', err);
      setError(err.message || 'Failed to submit application');
      setLoading(false);
    }
  };

  const handleBackToTaskList = () => {
    navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/payment-method`}>
                Pay and submit
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">
              Confirm your payment action
            </li>
          </ol>
        </nav>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                      <ul className="govuk-list govuk-error-summary__list">
                        <li>{error}</li>
                      </ul>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">Provide proof of payment</h1>

            <p className="govuk-body">
              If possible, please provide proof of payment to help us reconcile your payment more quickly.
            </p>

            <p className="govuk-body">Here are some examples of acceptable proof of payment:</p>

            <ul className="govuk-list govuk-!-margin-bottom-4">
              <li><strong>Transaction number</strong> - this is usually found within the details of the bank transfer</li>
              <li><strong>Document showing the bank transfer</strong> - this could be a remittance advice note or transfer receipt showing all the details of the transaction</li>
            </ul>

            <div className={`govuk-form-group`}>
              <label className="govuk-label govuk-label--m" htmlFor="transaction-number">
                Transaction number (optional)
              </label>
              <input
                className="govuk-input"
                id="transaction-number"
                name="transaction-number"
                type="text"
                value={transactionNumber}
                onChange={(e) => {
                  setTransactionNumber(e.target.value);
                  setError('');
                }}
              />
            </div>

            <div className="govuk-form-group govuk-!-margin-top-4">
              <label className="govuk-label" htmlFor="proof-file">Upload a document showing full details of the bank transfer (optional)</label>
              <FileUpload
                ref={fileUploadRef}
                showTitle={false}
                prefix={`${applicationId}/PAYMENT_PROOF`}
                applicationId={applicationId}
                category={'PAYMENT_PROOF'}
                addedBy={user?.user_id}
                uploadedFiles={[]}
                applicationDocuments={[]}
                onPendingFilesChange={setPendingFiles}
                onValidationErrors={() => {}}
                onUploaded={() => {}}
                uploadImmediately={false}
              />
              <p className="govuk-hint">You can upload .pdf, .jpg, .png files up to 25MB each. Files cannot be password protected.</p>
            </div>

            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
              {/* No user-facing confirmation checkbox — backend-set PROCESSING_PAYMENT on entry */}
            </div>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                data-module="govuk-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={handleBackToTaskList}
                disabled={loading}
              >
                Back to task list
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BankTransferConfirmationPage;
