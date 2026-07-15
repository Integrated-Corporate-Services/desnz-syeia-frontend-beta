import log from '../logger';
import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

export const createPayment = async (
  amount: number,
  reference: string,
  description: string,
  returnUrl: string,
  metadata?: any
) => {
  try {
    // Validate applicationId before sending
    if (!metadata?.applicationId) {
      log.error('[createPayment] applicationId is required in metadata');
      throw new Error('applicationId is required in metadata');
    }

    const applicationId = metadata.applicationId; 

    const payload = {
      amount,
      reference,
      description,
      return_url: returnUrl,
      applicationId, // Explicitly include at root level
      userId: metadata.userId, // Explicitly include at root level
      metadata
    };

    log.debug('[createPayment] Creating payment', { applicationId, amount, reference });

    const response = await fetch(buildBackendUrl(`/backend/api/gov-pay/applications/${applicationId}/payments`), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      log.error('[createPayment] Payment creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment');
    }

    log.info('[createPayment] Payment created successfully');
    return await response.json();
  } catch (error) {
    log.error('[createPayment] Error creating payment:', error);
    throw error;
  }
};

export const submitApplicationWithBankTransfer = async (
  applicationId: string,
  invoiceNumber: string,
  transactionNumber: string,
  amount: number,
  userId?: string,
  uploaded_files?: any[],
  application_documents?: any[]
) => {
  try {
    log.debug('[submitApplicationWithBankTransfer] Submitting application', {
      applicationId,
      invoiceNumber,
      transactionNumber
    });

    // Build payload using snake_case keys for file/document entries to match backend expectations
    const payload: any = {
      paymentMethod: 'bank_transfer',
      invoiceNumber,
      transactionNumber,
      amount,
      userId
    };

    if (Array.isArray(uploaded_files) && uploaded_files.length > 0) {
      payload.uploaded_files = uploaded_files.map((f: any) => ({
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
    }

    if (Array.isArray(application_documents) && application_documents.length > 0) {
      payload.application_documents = application_documents.map((d: any) => ({
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
    }

    const response = await fetch(buildBackendUrl(`/backend/api/application/${applicationId}/save-with-bank-transfer`), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Failed to submit application with bank transfer';
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        log.error('[submitApplicationWithBankTransfer] Submission failed:', errorData);
      } else {
        log.error('[submitApplicationWithBankTransfer] Non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
        });
        if (response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. Please try again.';
        }
      }
      
      throw new Error(errorMessage);
    }

    log.info('[submitApplicationWithBankTransfer] Application submitted successfully');
    return await response.json();
  } catch (error) {
    log.error('[submitApplicationWithBankTransfer] Error submitting application:', error);
    throw error;
  }
};

export const getPaymentStatus = async (applicationId: string, paymentId: string) => {
  try {
    log.debug('[getPaymentStatus] Fetching payment status', { applicationId, paymentId });
    const response = await fetch(buildBackendUrl(`/backend/api/gov-pay/applications/${applicationId}/payments/${paymentId}/status`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include credentials for session authentication
    });

    if (!response.ok) {
      log.error('[getPaymentStatus] Failed to get payment status');
      throw new Error('Failed to get payment status');
    }

    return await response.json();
  } catch (error) {
    log.error('[getPaymentStatus] Error getting payment status:', error);
    throw error;
  }
};